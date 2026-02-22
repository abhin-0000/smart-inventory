const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config();

// Random date within a given month (year, month 0-indexed)
const randDateInMonth = (year, month) => {
    const start = new Date(year, month, 1).getTime();
    const end = new Date(year, month + 1, 0, 23, 59, 59).getTime();
    return new Date(start + Math.random() * (end - start));
};

// The 4 target months
const months = [
    { year: 2025, month: 10, label: 'November 2025' },
    { year: 2025, month: 11, label: 'December 2025' },
    { year: 2026, month: 0, label: 'January 2026' },
    { year: 2026, month: 1, label: 'February 2026' },
];

const redistributeDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-inventory');
        console.log('✅ MongoDB Connected');

        const orders = await Order.find().sort({ createdAt: 1 });
        console.log(`📋 Found ${orders.length} orders to update`);

        const perMonth = Math.ceil(orders.length / months.length);

        for (let i = 0; i < orders.length; i++) {
            const monthIndex = Math.min(Math.floor(i / perMonth), months.length - 1);
            const { year, month } = months[monthIndex];
            const newDate = randDateInMonth(year, month);

            // Use raw collection update to bypass Mongoose auto-timestamps
            await Order.collection.updateOne(
                { _id: orders[i]._id },
                { $set: { createdAt: newDate, updatedAt: newDate } }
            );
        }

        // Verify counts
        const allOrders = await Order.find();
        const counts = [0, 0, 0, 0];
        for (const o of allOrders) {
            const d = new Date(o.createdAt);
            const y = d.getFullYear();
            const m = d.getMonth();
            if (y === 2025 && m === 10) counts[0]++;
            else if (y === 2025 && m === 11) counts[1]++;
            else if (y === 2026 && m === 0) counts[2]++;
            else if (y === 2026 && m === 1) counts[3]++;
        }

        console.log(`\n✅ Updated ${orders.length} orders:`);
        months.forEach((mo, i) => console.log(`   ${mo.label}: ${counts[i]} orders`));
        console.log('\n📊 AI Insights now has 4 months of historical data!');
        process.exit();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

redistributeDates();
