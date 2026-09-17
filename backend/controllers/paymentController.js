const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

const getOrderId = (metadata) => metadata?.orderId || metadata?.order_id;

const sendPaymentConfirmation = async (order) => {
  const customerEmail = order.customer?.email || order.guestInfo?.email;
  if (!customerEmail) {
    console.warn(`Payment confirmation email skipped for ${order.orderNumber}: no customer email`);
    return;
  }

  const items = order.items.map((item) => (
    `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.name}</td>` +
    `<td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${item.quantity}</td>` +
    `<td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">GHS ${item.price * item.quantity}</td></tr>`
  )).join('');

  await sendEmail({
    to: customerEmail,
    subject: `Payment Confirmed — #${order.orderNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px">
      <h2 style="color:#006989">Alpha iStore</h2>
      <h3>Payment confirmed</h3>
      <p>Your payment for order <strong>#${order.orderNumber}</strong> was confirmed successfully.</p>
      <table style="width:100%;border-collapse:collapse">${items}</table>
      <p style="font-size:18px;font-weight:bold">Total: GHS ${order.total}</p>
      <p>Payment reference: ${order.payment.reference}</p>
    </div>`,
  });
};

const claimConfirmationEmail = async (order) => {
  if (order.payment?.status !== 'paid' || order.payment.confirmationEmailSentAt) {
    return { order, shouldEmail: false };
  }
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, 'payment.status': 'paid', 'payment.confirmationEmailSentAt': { $exists: false } },
    { $set: { 'payment.confirmationEmailSentAt': new Date() } },
    { new: true }
  );
  return { order: claimed || order, shouldEmail: Boolean(claimed) };
};

const updateOrderFromPayment = async ({ event, data }) => {
  const reference = data?.reference;
  if (!reference) throw new Error('Payment reference is missing');
  const metadataOrderId = getOrderId(data?.metadata);
  const orderId = metadataOrderId && mongoose.isValidObjectId(metadataOrderId)
    ? metadataOrderId
    : null;

  const status = event === 'charge.success'
    ? 'paid'
    : event === 'charge.failed'
      ? 'failed'
      : 'pending';
  const filter = {
    ...(orderId ? { _id: orderId } : { 'payment.reference': reference }),
    'payment.status': { $ne: 'paid' },
  };
  const update = {
    $set: {
      'payment.status': status,
      'payment.reference': reference,
      ...(status === 'paid' ? { 'payment.paidAt': new Date() } : {}),
    },
  };

  const order = await Order.findOneAndUpdate(filter, update, { new: true });
  if (!order) {
    const existing = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ 'payment.reference': reference });
    if (!existing) {
      throw new Error(orderId
        ? `Order not found: ${orderId}`
        : `No order found for payment reference: ${reference}`);
    }
    console.log(`Payment event already processed or order is already paid: ${existing.orderNumber}`);
    return event === 'charge.success'
      ? claimConfirmationEmail(existing)
      : { order: existing, shouldEmail: false };
  }

  return claimConfirmationEmail(order);
};

exports.verifyPaystack = async (req, res) => {
  const { reference } = req.body;
  if (!reference) {
    return res.status(400).json({ success: false, message: 'Payment reference is required' });
  }
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(503).json({ success: false, message: 'Paystack is not configured' });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!response.ok || !data.status || data.data?.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: data.message || 'Paystack payment verification failed',
        data: data.data,
      });
    }
    const payment = data.data;
    try {
      const result = await updateOrderFromPayment({ event: 'charge.success', data: payment });
      if (result.shouldEmail) {
        sendPaymentConfirmation(result.order).catch(async (error) => {
          await Order.updateOne(
            { _id: result.order._id, 'payment.confirmationEmailSentAt': { $exists: true } },
            { $unset: { 'payment.confirmationEmailSentAt': 1 } }
          );
          console.error(`Payment confirmation email failed for ${result.order.orderNumber}:`, error.message);
        });
      }
    } catch (orderError) {
      // The current checkout creates the order immediately after verification.
      // Keep verification successful when that order does not exist yet; the
      // order is then created with the verified reference and paid status.
      console.warn(`Verified Paystack payment ${payment.reference} was not linked to an order:`, orderError.message);
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Paystack verification failed:', error.message);
    res.status(502).json({ success: false, message: 'Unable to verify Paystack payment' });
  }
};

exports.paystackWebhook = async (req, res) => {
  const signature = req.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : null);

  if (!secret || !rawBody || !signature) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }

  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  const supplied = Buffer.from(signature, 'utf8');
  const calculated = Buffer.from(expected, 'utf8');
  if (supplied.length !== calculated.length || !crypto.timingSafeEqual(supplied, calculated)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (error) {
    console.error('Paystack webhook JSON parsing failed:', error.message);
    return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }

  if (!['charge.success', 'charge.failed', 'charge.pending'].includes(event.event)) {
    console.log(`Ignoring unsupported Paystack event: ${event.event || 'unknown'}`);
    return res.sendStatus(200);
  }

  try {
    const result = await updateOrderFromPayment({ event: event.event, data: event.data });
    if (result.shouldEmail) {
      sendPaymentConfirmation(result.order).catch(async (error) => {
        await Order.updateOne(
          { _id: result.order._id, 'payment.confirmationEmailSentAt': { $exists: true } },
          { $unset: { 'payment.confirmationEmailSentAt': 1 } }
        );
        console.error(`Payment confirmation email failed for ${result.order.orderNumber}:`, error.message);
      });
    }
    console.log(`Paystack ${event.event} processed for order ${result.order.orderNumber}`);
    return res.sendStatus(200);
  } catch (error) {
    console.error(`Paystack ${event.event} processing failed:`, error.message);
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};
