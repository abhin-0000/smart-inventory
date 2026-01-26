const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
}, { timestamps: true });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    console.log(`[MATCH PASS] Entered: ${enteredPassword}, Hash: ${this.password}`);
    const match = await bcrypt.compare(enteredPassword, this.password);
    console.log(`[MATCH PASS] Result: ${match}`);
    return match;
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    console.log(`[USER SAVE] Hashing password: ${this.password}`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`[USER SAVE] Password hashed: ${this.password}`);
});

module.exports = mongoose.model('User', userSchema);
