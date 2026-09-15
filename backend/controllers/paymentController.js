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
    res.json({ success: true, data: data.data });
  } catch (error) {
    res.status(502).json({ success: false, message: 'Unable to verify Paystack payment' });
  }
};
