const nodemailer = require('nodemailer');
const siteConfig = require('../../frontend/config').default;
const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || '').replace(/\/+$/, '');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

const sendOrderConfirmation = async (order, customerEmail) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('Email not configured — skipping order confirmation email');
    return;
  }

  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}${item.variant?.color ? ` (${item.variant.color})` : ''}${item.variant?.storage ? ` - ${item.variant.storage}` : ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"${siteConfig.name}" <${process.env.SMTP_EMAIL}>`,
    to: customerEmail,
    subject: `Order Confirmation — ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #0F172A;">
        <h1 style="color: #006989; font-size: 24px;">Thank you for your order!</h1>
        <p>Hi ${order.user?.firstName || order.guestInfo?.firstName || 'Customer'},</p>
        <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f7;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        <p style="font-size: 18px; font-weight: bold; text-align: right;">Total: GHS ${order.total}</p>
        <p style="margin-top: 20px;">Delivery: ${order.delivery?.method || 'standard'} — ${order.delivery?.address || 'TBD'}</p>
        <p style="margin-top: 30px; color: #64748B; font-size: 12px;">© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to', customerEmail);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

const sendAdminNotification = async (order, adminEmail) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return;
  }
  if (!adminEmail) return;

  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">GHS ${item.price}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"${siteConfig.name} Store" <${process.env.SMTP_EMAIL}>`,
    to: adminEmail,
    subject: `New Order Received — ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #0F172A;">
        <h1 style="color: #006989; font-size: 24px;">New Order Alert</h1>
        <p>A new order has been placed on your store.</p>
        <p><strong>Order #:</strong> ${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.user ? `${order.user.firstName} ${order.user.lastName}` : (order.guestInfo?.firstName || 'Guest')}</p>
        <p><strong>Email:</strong> ${order.user?.email || order.guestInfo?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.user?.phone || order.guestInfo?.phone || 'N/A'}</p>
        <p><strong>Total:</strong> GHS ${order.total}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <h2 style="margin-top: 20px;">Order Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f7;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        <p style="margin-top: 20px;"><a href="${frontendUrl}/portal/orders" style="color: #006989;">View in Admin Panel</a></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
};

const sendResetPasswordEmail = async (user, resetUrl) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('Email not configured — skipping reset password email');
    return;
  }

  const mailOptions = {
    from: `"${siteConfig.name}" <${process.env.SMTP_EMAIL}>`,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #0F172A;">
        <h1 style="color: #006989; font-size: 24px;">Password Reset</h1>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #006989; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748B; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #64748B; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p style="margin-top: 30px; color: #64748B; font-size: 12px;">© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent to', user.email);
  } catch (error) {
    console.error('Failed to send reset password email:', error);
  }
};

const sendWelcomeEmail = async (user) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    return;
  }

  const mailOptions = {
    from: `"${siteConfig.name}" <${process.env.SMTP_EMAIL}>`,
    to: user.email,
    subject: `Welcome to ${siteConfig.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #0F172A;">
        <h1 style="color: #006989; font-size: 24px;">Welcome, ${user.firstName}!</h1>
        <p>Thank you for creating an account with <strong>${siteConfig.name}</strong>.</p>
        <p>You can now shop our latest phones, track orders, and enjoy exclusive deals.</p>
        <p style="margin: 30px 0;">
          <a href="${frontendUrl}/shop" style="display: inline-block; padding: 14px 28px; background: #006989; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Start Shopping
          </a>
        </p>
        <p style="margin-top: 30px; color: #64748B; font-size: 12px;">© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to', user.email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendAdminNotification,
  sendResetPasswordEmail,
  sendWelcomeEmail,
};
