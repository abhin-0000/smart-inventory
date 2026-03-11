const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const PurchaseOrder = require('./models/PurchaseOrder');

dotenv.config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-inventory');
        console.log('--- MongoDB Status Report ---');

        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        const userCount = await User.countDocuments();
        const supplierCount = await Supplier.countDocuments();
        const poCount = await PurchaseOrder.countDocuments();

        console.log(`Products: ${productCount}`);
        console.log(`Orders: ${orderCount}`);
        console.log(`Users: ${userCount}`);
        console.log(`Suppliers: ${supplierCount}`);
        console.log(`Purchase Orders: ${poCount}`);

        if (productCount > 0) {
            const lowStock = await Product.countDocuments({ quantity: { $lt: 10 } });
            const criticalStock = await Product.countDocuments({ quantity: { $lt: 5 } });
            console.log(`Low Stock (< 10): ${lowStock}`);
            console.log(`Critical Stock (< 5): ${criticalStock}`);

            const sampleProduct = await Product.findOne();
            console.log('\nSample Product:');
            console.log(`- Name: ${sampleProduct.name}`);
            console.log(`- SKU: ${sampleProduct.sku}`);
            console.log(`- Price: ${sampleProduct.price}`);
            console.log(`- Quantity: ${sampleProduct.quantity}`);
        }

        if (orderCount > 0) {
            const recentOrder = await Order.findOne().sort({ createdAt: -1 });
            console.log('\nMost Recent Order:');
            console.log(`- Order ID: ${recentOrder._id}`);
            console.log(`- Total: ${recentOrder.totalAmount}`);
            console.log(`- Status: ${recentOrder.status}`);
            console.log(`- Date: ${recentOrder.createdAt}`);
        }

        console.log('\n--- End of Report ---');
        process.exit();
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkStatus();
