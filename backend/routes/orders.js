const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/',                   ctrl.createOrder);
router.get('/my',    protect,      ctrl.getMyOrders);
router.get('/track/:orderNumber',  ctrl.trackOrder);
router.get('/dashboard-stats', protect, adminOnly, ctrl.getDashboardStats);
router.delete('/:id', protect, adminOnly, ctrl.deleteOrder);
router.get('/', protect, adminOnly, ctrl.getAllOrders);
router.patch('/:id/status', protect, adminOnly, ctrl.updateOrderStatus);
router.patch('/:id/payment', protect, adminOnly, ctrl.updatePaymentStatus);

module.exports = router;
