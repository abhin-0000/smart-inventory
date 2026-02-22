const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

// Generate unique order number
const genOrderNumber = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${ts}-${rand}`;
};

// Random int between min and max (inclusive)
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Random date within last N days
const randDate = (daysAgo) => {
    const now = Date.now();
    const past = now - daysAgo * 24 * 60 * 60 * 1000;
    return new Date(past + Math.random() * (now - past));
};

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Delivered', 'Delivered']; // weight towards Delivered

const ADDRESSES = [
    'Rahul Sharma, 9876543210, 12 MG Road, Bengaluru, Karnataka - 560001',
    'Priya Mehta, 9123456780, 45 Anna Salai, Chennai, Tamil Nadu - 600002',
    'Amit Verma, 9988776655, 78 Park Street, Kolkata, West Bengal - 700016',
    'Sneha Patel, 9871234560, 33 FC Road, Pune, Maharashtra - 411004',
    'Kiran Rao, 9765432100, 21 Jubilee Hills, Hyderabad, Telangana - 500033',
    'Neeraj Singh, 9654321890, 5 Civil Lines, Delhi - 110054',
    'Deepa Nair, 9543210987, 88 Marine Drive, Mumbai, Maharashtra - 400002',
    'Vikram Joshi, 9432109876, 14 Residency Road, Bengaluru, Karnataka - 560025',
];

// Product category → realistic quantity ranges
const qtyRange = (category) => {
    switch (category) {
        case 'Grocery': return [1, 5];
        case 'Electronics': return [1, 2];
        case 'Clothing': return [1, 3];
        case 'Stationery': return [2, 8];
        case 'Furniture': return [1, 1];
        case 'Cleaning': return [2, 6];
        default: return [1, 3];
    }
};

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-inventory');
        console.log('✅ MongoDB Connected');

        // Get all non-admin users
        const users = await User.find({ role: 'user' });
        if (users.length === 0) {
            console.log('❌ No customer users found. Please register at least one non-admin user first.');
            process.exit(1);
        }
        console.log(`👥 Found ${users.length} customer(s): ${users.map(u => u.name).join(', ')}`);

        // Get all products
        const products = await Product.find();
        if (products.length === 0) {
            console.log('❌ No products found. Please seed products first.');
            process.exit(1);
        }
        console.log(`📦 Found ${products.length} products`);

        let created = 0;

        // For each user, create 25-35 orders spread over the last 28 days
        for (const user of users) {
            const numOrders = rand(25, 35);
            console.log(`\n📋 Creating ${numOrders} orders for ${user.name}...`);

            for (let i = 0; i < numOrders; i++) {
                // Each order has 1–4 items, picked from different categories
                const numItems = rand(1, 4);
                const shuffled = [...products].sort(() => Math.random() - 0.5);
                const selectedProducts = shuffled.slice(0, numItems);

                const items = [];
                let totalAmount = 0;

                for (const product of selectedProducts) {
                    const [minQty, maxQty] = qtyRange(product.category);
                    const qty = rand(minQty, maxQty);
                    items.push({
                        product: product._id,
                        name: product.name,
                        quantity: qty,
                        price: product.price
                    });
                    totalAmount += product.price * qty;
                }

                const status = pick(STATUSES);
                const createdAt = randDate(28); // within last 28 days for WMA relevance

                const order = new Order({
                    orderNumber: genOrderNumber(),
                    customer: user._id,
                    items,
                    totalAmount: parseFloat(totalAmount.toFixed(2)),
                    status,
                    shippingAddress: pick(ADDRESSES)
                });

                // Override createdAt so it falls in past
                order.createdAt = createdAt;
                order.updatedAt = createdAt;

                await order.save();
                created++;
                if (created % 10 === 0) console.log(`   ... ${created} orders created so far`);
            }
        }

        console.log(`\n🎉 Done! Created ${created} orders for ${users.length} customer(s).`);
        console.log('📊 AI Insights page will now have real WMA data to work with!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding orders:', error);
        process.exit(1);
    }
};

seedOrders();
