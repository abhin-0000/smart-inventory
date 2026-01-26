const Order = require('../models/Order');
const Product = require('../models/Product');
const { checkAndAlertLowStock } = require('../utils/emailService');

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// @desc    Create new order (Customer)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    try {
        // Validate stock and calculate total
        let totalAmount = 0;
        const orderItems = [];
        const updatedProducts = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productId}` });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
                });
            }

            // Deduct stock
            product.quantity -= item.quantity;
            await product.save();
            updatedProducts.push(product);

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });

            totalAmount += product.price * item.quantity;
        }

        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            customer: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress || ''
        });

        // Check and send low stock alerts for affected products
        for (const product of updatedProducts) {
            await checkAndAlertLowStock(product);
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

// @desc    Get orders (Admin: all, Customer: own orders)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'admin') {
            // Admin sees all orders
            orders = await Order.find()
                .populate('customer', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // Customer sees only their orders
            orders = await Order.find({ customer: req.user._id })
                .sort({ createdAt: -1 });
        }

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

// @desc    Get order stats for dashboard
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus, getOrderStats };
