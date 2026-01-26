const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-inventory');
        console.log('MongoDB Connected');

        // Delete existing admin to be sure
        await User.deleteOne({ email: 'admin@example.com' });
        console.log('Previous admin removed (if any).');

        // Re-create Admin
        const user = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        console.log('Admin user recreated successfully.');
        console.log('Email: admin@example.com');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error('Error fixing admin:', error);
        process.exit(1);
    }
};

fixAdmin();
