const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-inventory');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'admin@example.com' });
        if (!user) {
            console.log('User NOT FOUND');
            process.exit();
        }

        console.log('User Found:', user.email);
        console.log('Stored Role:', user.role);
        console.log('Stored Hash:', user.password);

        const isMatch = await bcrypt.compare('password123', user.password);
        console.log('Manual Bcrypt Compare ("password123"):', isMatch);

        const isMethodMatch = await user.matchPassword('password123');
        console.log('Model Method .matchPassword("password123"):', isMethodMatch);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debug();
