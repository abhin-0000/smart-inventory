const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createOrder, getOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/stats', protect, admin, getOrderStats);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
