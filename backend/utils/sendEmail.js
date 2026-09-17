const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
  const fromEmail = process.env.BREVO_EMAIL || process.env.SMTP_EMAIL;
  if (!fromEmail) throw new Error('Email sender is not configured');

  if (apiKey) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Alpha iStore', email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Brevo API');
    }
    console.log('Email sent via Brevo API:', data.messageId);
    return data;
  }

  const smtpPassword = process.env.SMTP_PASSWORD || process.env.BREVO_SMTP_KEY;
  if (!smtpPassword) throw new Error('BREVO_API_KEY or SMTP_PASSWORD is not configured');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: fromEmail, pass: smtpPassword },
  });
  const result = await transporter.sendMail({
    from: `"Alpha iStore" <${fromEmail}>`,
    to,
    subject,
    html,
  });
  console.log('Email sent via SMTP:', result.messageId);
  return result;
};

module.exports = sendEmail;