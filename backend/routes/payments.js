const router = require('express').Router();
const { verifyPaystack, paystackWebhook } = require('../controllers/paymentController');

router.post('/verify-paystack', verifyPaystack);
router.post('/webhook', paystackWebhook);

module.exports = router;
