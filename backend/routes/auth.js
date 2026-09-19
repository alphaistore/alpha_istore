const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',         ctrl.register);
router.post('/login',            ctrl.login);
router.post('/logout',           ctrl.logout);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.get('/me',       protect, ctrl.getMe);
router.put('/me',       protect, ctrl.updateMe);
router.put('/password', protect, ctrl.changePassword);
router.put('/credentials', protect, ctrl.changeCredentials);
router.put('/wishlist/:productId', protect, ctrl.toggleWishlist);

module.exports = router;
