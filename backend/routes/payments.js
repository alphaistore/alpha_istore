const router = require('express').Router();
const { verifyPaystack } = require('../controllers/paymentController');

router.post('/verify-paystack', verifyPaystack);

module.exports = router;
