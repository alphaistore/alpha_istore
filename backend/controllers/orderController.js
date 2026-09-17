const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const getUserFromToken = async (req) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.body?.token) {
      token = req.body.token;
    } else if (req.body?.authToken) {
      token = req.body.authToken;
    }
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, delivery, payment, guestInfo, promoCode, discount } = req.body;
    const currentUser = req.user || (await getUserFromToken(req));
    if (currentUser) req.user = currentUser;

    if (!items?.length) return res.status(400).json({ success: false, message: 'No order items' });
    if (!['paystack', 'pay_on_pickup'].includes(payment?.method)) {
      return res.status(400).json({ success: false, message: 'Payment must be Paystack or Pay on Pickup' });
    }
    if (payment.method === 'pay_on_pickup' && delivery?.method !== 'pickup') {
      return res.status(400).json({ success: false, message: 'Pay on Pickup requires a pickup location' });
    }

    // Calculate subtotal from DB prices (never trust client)
    let subtotal = 0;
    const enrichedItems = [];
    
    // Fetch all products in parallel
    const productDocs = await Promise.all(
      items.map(item => Product.findById(item.product))
    );

    for (let i = 0; i < items.length; i++) {
      const product = productDocs[i];
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${items[i].product}` });

      const variant = product.variants.find(v =>
        v.storage === items[i].variant?.storage && v.color?.name === items[i].variant?.color
      ) || product.variants[0];

      const price = variant?.price || product.basePrice;
      subtotal += price * items[i].quantity;

      enrichedItems.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        condition: product.condition,
        image: product.images?.[0]?.url,
        price,
        quantity: items[i].quantity,
        variant: items[i].variant,
      });

      // Decrement stock
      if (variant) {
        variant.stock = Math.max(0, variant.stock - items[i].quantity);
      }
      product.totalSold += items[i].quantity;
    }

    // Save all products in parallel
    await Promise.all(productDocs.filter(Boolean).map(p => p.save()));

    const total = subtotal - (discount || 0);

    // Always save customer info from form (for both auth and guest users)
    const nameParts = guestInfo?.name?.split(' ') || [req.user?.firstName || '', req.user?.lastName || ''];
    const customerInfo = {
      firstName: guestInfo?.firstName || nameParts[0] || req.user?.firstName || '',
      lastName: guestInfo?.lastName || nameParts.slice(1).join(' ') || req.user?.lastName || '',
      email: guestInfo?.email || req.user?.email || '',
      phone: guestInfo?.phone || req.user?.phone || '',
    };

    const order = await Order.create({
      user:     currentUser?._id,
      guestInfo: !currentUser ? { name: guestInfo?.name, email: guestInfo?.email, phone: guestInfo?.phone } : undefined,
      items:    enrichedItems,
      delivery: { ...delivery, fee: 0 },
      payment,
      promoCode,
      discount: discount || 0,
      subtotal,
      total,
      // Store customer info for easy access without population
      customer: customerInfo,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    const customerEmail = req.user?.email || guestInfo?.email;

    // Send emails in background (non-blocking)
    if (customerEmail && payment.method === 'pay_on_pickup') {
      (async () => {
        try {
          const itemsList = order.items.map(item =>
            `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">GHS ${item.price * item.quantity}</td>
            </tr>`
          ).join('');

          await sendEmail({
            to: customerEmail,
            subject: `Order Confirmed — #${order.orderNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                <h2 style="color: #006989;">Alpha iStore</h2>
                <h3 style="color: #0f172a;">Your order is confirmed!</h3>
                <p style="color: #475569;">Thank you for your order. We will contact you shortly to confirm delivery.</p>
                <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <thead>
                    <tr style="background: #f1f5f9;">
                      <th style="padding: 8px; text-align: left;">Item</th>
                      <th style="padding: 8px; text-align: center;">Qty</th>
                      <th style="padding: 8px; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>${itemsList}</tbody>
                </table>
                <p style="font-size: 18px; font-weight: bold; color: #006989;">Total: GHS ${order.total}</p>
                <p style="color: #94a3b8; font-size: 12px;">Alpha iStore · Adum P.Z, Kumasi, Ghana</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Customer email notification failed:', emailErr.message);
        }
      })();

      (async () => {
        try {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `New Order #${order.orderNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                <h2 style="color: #006989;">New Order Received</h2>
                <p><strong>Order:</strong> #${order.orderNumber}</p>
                <p><strong>Customer:</strong> ${customerInfo.firstName || customerInfo.lastName ? `${customerInfo.firstName} ${customerInfo.lastName}`.trim() : 'Guest'}</p>
                <p><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
                <p><strong>Total:</strong> GHS ${order.total}</p>
                <p><strong>Payment:</strong> ${order.payment?.method}</p>
                <p><strong>Delivery:</strong> ${order.delivery?.method} — ${order.delivery?.region || ''}</p>
                <p style="color: #94a3b8; font-size: 12px;">Log in to admin panel to manage this order.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Admin email notification failed:', emailErr.message);
        }
      })();
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my (customer)
exports.getMyOrders = async (req, res) => {
  try {
    // debug logs removed
    const orders = await Order.find({ user: req.user._id })
      .select('-verificationToken')
      .sort('-createdAt')
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email phone');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:orderNumber (public)
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('-verificationToken')
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select('-verificationToken')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'firstName lastName email phone')
        .populate('items.product', 'name brand category condition images description specifications'),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status changed to ${status}` });
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/orders/clear (admin) — delete all orders
exports.clearAllOrders = async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.json({ success: true, message: `Deleted ${result.deletedCount} orders` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/dashboard-stats (admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, delivered, processing, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'processing' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, sold: { $sum: '$items.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        delivered,
        processing,
        revenue: revenue[0]?.total || 0,
        topProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
