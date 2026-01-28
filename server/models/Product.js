const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' }, // URL or base64 image
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g., kg, pcs, liters
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    reorderLevel: { type: Number, default: 10 }, // Industry standard threshold - products at or below this level trigger low stock alerts
    leadTime: { type: Number, default: 1 }, // Days to deliver
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
