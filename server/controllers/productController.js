const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
    const { name, sku, category, description, image, price, quantity, unit, supplier, reorderLevel, leadTime } = req.body;

    try {
        const product = await Product.create({
            name, sku, category, description, image, price, quantity, unit, supplier, reorderLevel, leadTime
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({ message: 'Invalid product data' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
    const { name, sku, category, description, image, price, quantity, unit, reorderLevel } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        product.name = name || product.name;
        product.sku = sku || product.sku;
        product.category = category || product.category;
        product.description = description !== undefined ? description : product.description;
        product.image = image !== undefined ? image : product.image;
        product.price = price !== undefined ? price : product.price;
        product.quantity = quantity !== undefined ? quantity : product.quantity;
        product.unit = unit || product.unit;
        product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ message: 'Failed to update product' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private
const updateStock = async (req, res) => {
    const { quantity, type } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (type === 'add') {
            product.quantity += Number(quantity);
        } else {
            product.quantity -= Number(quantity);
        }
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock };
