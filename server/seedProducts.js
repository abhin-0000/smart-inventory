const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const products = [
    // ─── ELECTRONICS ───────────────────────────────────────────────
    { name: 'Laptop - Dell Inspiron 15', sku: 'ELEC-001', category: 'Electronics', description: 'Dell Inspiron 15 inch laptop with Intel i5 processor and 8GB RAM', price: 55000, quantity: 12, unit: 'pcs', reorderLevel: 5, leadTime: 7 },
    { name: 'Smartphone - Samsung Galaxy A54', sku: 'ELEC-002', category: 'Electronics', description: 'Samsung Galaxy A54 5G smartphone with 128GB storage', price: 38000, quantity: 20, unit: 'pcs', reorderLevel: 8, leadTime: 5 },
    { name: 'Wireless Mouse', sku: 'ELEC-003', category: 'Electronics', description: 'Logitech M330 silent wireless mouse', price: 1500, quantity: 45, unit: 'pcs', reorderLevel: 15, leadTime: 3 },
    { name: 'Mechanical Keyboard', sku: 'ELEC-004', category: 'Electronics', description: 'RGB mechanical gaming keyboard with blue switches', price: 3200, quantity: 18, unit: 'pcs', reorderLevel: 8, leadTime: 4 },
    { name: '27" LED Monitor', sku: 'ELEC-005', category: 'Electronics', description: 'Full HD 1080p IPS panel monitor with HDMI port', price: 18000, quantity: 10, unit: 'pcs', reorderLevel: 4, leadTime: 7 },
    { name: 'USB-C Hub 7-in-1', sku: 'ELEC-006', category: 'Electronics', description: 'Multiport USB-C hub with HDMI, USB 3.0, and SD card reader', price: 2800, quantity: 35, unit: 'pcs', reorderLevel: 10, leadTime: 3 },
    { name: 'Bluetooth Headphones', sku: 'ELEC-007', category: 'Electronics', description: 'Sony WH-1000XM4 noise cancelling headphones', price: 22000, quantity: 8, unit: 'pcs', reorderLevel: 4, leadTime: 5 },
    { name: 'Web Camera HD 1080p', sku: 'ELEC-008', category: 'Electronics', description: 'Logitech C920 Full HD webcam for video conferencing', price: 5500, quantity: 25, unit: 'pcs', reorderLevel: 8, leadTime: 3 },
    { name: 'Portable Power Bank 20000mAh', sku: 'ELEC-009', category: 'Electronics', description: 'Fast charging power bank with dual USB output', price: 2200, quantity: 40, unit: 'pcs', reorderLevel: 15, leadTime: 2 },
    { name: 'Smart LED Bulb 9W', sku: 'ELEC-010', category: 'Electronics', description: 'Wi-Fi enabled smart RGB LED bulb compatible with Alexa', price: 850, quantity: 60, unit: 'pcs', reorderLevel: 20, leadTime: 2 },
    { name: 'External SSD 1TB', sku: 'ELEC-011', category: 'Electronics', description: 'Samsung T7 portable SSD with USB 3.2 interface', price: 9500, quantity: 15, unit: 'pcs', reorderLevel: 5, leadTime: 4 },
    { name: 'Wireless Earbuds', sku: 'ELEC-012', category: 'Electronics', description: 'TWS earbuds with 24hr battery life and IPX5 water resistance', price: 3500, quantity: 30, unit: 'pcs', reorderLevel: 10, leadTime: 3 },
    { name: 'Graphics Card RTX 3060', sku: 'ELEC-013', category: 'Electronics', description: 'NVIDIA GeForce RTX 3060 12GB GDDR6 graphics card', price: 32000, quantity: 6, unit: 'pcs', reorderLevel: 3, leadTime: 10 },
    { name: 'HDMI Cable 2m', sku: 'ELEC-014', category: 'Electronics', description: 'High-speed HDMI 2.0 cable supporting 4K 60Hz', price: 450, quantity: 80, unit: 'pcs', reorderLevel: 25, leadTime: 2 },
    { name: 'Laptop Stand Adjustable', sku: 'ELEC-015', category: 'Electronics', description: 'Aluminum ergonomic laptop stand with 6 height levels', price: 1800, quantity: 22, unit: 'pcs', reorderLevel: 8, leadTime: 3 },
    { name: 'Smart Watch Fitness Tracker', sku: 'ELEC-016', category: 'Electronics', description: 'Heart rate monitor, GPS, sleep tracking smartwatch', price: 7500, quantity: 18, unit: 'pcs', reorderLevel: 6, leadTime: 5 },
    { name: 'Inkjet Printer', sku: 'ELEC-017', category: 'Electronics', description: 'HP DeskJet 2775 all-in-one wireless printer', price: 7200, quantity: 9, unit: 'pcs', reorderLevel: 3, leadTime: 6 },
    { name: 'Surge Protector 6-Outlet', sku: 'ELEC-018', category: 'Electronics', description: '6 outlet surge protector with USB charging ports', price: 1200, quantity: 50, unit: 'pcs', reorderLevel: 15, leadTime: 2 },

    // ─── GROCERY ───────────────────────────────────────────────────
    { name: 'Basmati Rice 5kg', sku: 'GROC-001', category: 'Grocery', description: 'Premium long grain Indian basmati rice', price: 450, quantity: 120, unit: 'bags', reorderLevel: 30, leadTime: 2 },
    { name: 'Wheat Flour (Atta) 10kg', sku: 'GROC-002', category: 'Grocery', description: 'Whole wheat flour for chapati and bread', price: 380, quantity: 90, unit: 'bags', reorderLevel: 25, leadTime: 2 },
    { name: 'Toor Dal 1kg', sku: 'GROC-003', category: 'Grocery', description: 'Premium quality pigeon pea lentils', price: 140, quantity: 200, unit: 'packs', reorderLevel: 50, leadTime: 2 },
    { name: 'Refined Sunflower Oil 1L', sku: 'GROC-004', category: 'Grocery', description: 'Fortified refined sunflower cooking oil', price: 180, quantity: 150, unit: 'bottles', reorderLevel: 40, leadTime: 2 },
    { name: 'Sugar (White) 1kg', sku: 'GROC-005', category: 'Grocery', description: 'Fine granulated white sugar', price: 45, quantity: 300, unit: 'packs', reorderLevel: 80, leadTime: 1 },
    { name: 'Salt (Iodized) 1kg', sku: 'GROC-006', category: 'Grocery', description: 'Refined free flow iodized salt', price: 20, quantity: 250, unit: 'packs', reorderLevel: 70, leadTime: 1 },
    { name: 'Tomato Ketchup 500g', sku: 'GROC-007', category: 'Grocery', description: 'Maggi rich tomato sauce and ketchup', price: 110, quantity: 85, unit: 'bottles', reorderLevel: 25, leadTime: 2 },
    { name: 'Whole Milk 1L', sku: 'GROC-008', category: 'Grocery', description: 'Fresh full cream pasteurized milk', price: 68, quantity: 200, unit: 'packets', reorderLevel: 60, leadTime: 1 },
    { name: 'Butter 500g', sku: 'GROC-009', category: 'Grocery', description: 'Amul pasteurized salted butter', price: 275, quantity: 70, unit: 'packs', reorderLevel: 20, leadTime: 2 },
    { name: 'Paneer 200g', sku: 'GROC-010', category: 'Grocery', description: 'Fresh cottage cheese block', price: 90, quantity: 60, unit: 'packs', reorderLevel: 20, leadTime: 1 },
    { name: 'Oats 1kg', sku: 'GROC-011', category: 'Grocery', description: 'Quaker rolled oats for healthy breakfast', price: 180, quantity: 95, unit: 'packs', reorderLevel: 25, leadTime: 2 },
    { name: 'Green Tea 100 bags', sku: 'GROC-012', category: 'Grocery', description: 'Lipton natural green tea bags', price: 220, quantity: 110, unit: 'boxes', reorderLevel: 30, leadTime: 2 },
    { name: 'Coffee Powder 200g', sku: 'GROC-013', category: 'Grocery', description: 'Nescafe classic instant coffee', price: 280, quantity: 75, unit: 'jars', reorderLevel: 20, leadTime: 2 },
    { name: 'Almonds 500g', sku: 'GROC-014', category: 'Grocery', description: 'Raw natural California almonds', price: 450, quantity: 55, unit: 'packs', reorderLevel: 15, leadTime: 3 },
    { name: 'Honey 500g', sku: 'GROC-015', category: 'Grocery', description: 'Dabur 100% pure natural honey', price: 240, quantity: 65, unit: 'bottles', reorderLevel: 20, leadTime: 2 },
    { name: 'Biscuits - Digestive 400g', sku: 'GROC-016', category: 'Grocery', description: 'McVities digestive whole wheat biscuits', price: 115, quantity: 130, unit: 'packs', reorderLevel: 35, leadTime: 2 },
    { name: 'Pasta 500g', sku: 'GROC-017', category: 'Grocery', description: 'Barilla penne pasta made from durum wheat', price: 130, quantity: 100, unit: 'packs', reorderLevel: 30, leadTime: 2 },
    { name: 'Canned Chickpeas 400g', sku: 'GROC-018', category: 'Grocery', description: 'Ready to use boiled and canned chickpeas', price: 95, quantity: 140, unit: 'cans', reorderLevel: 40, leadTime: 2 },

    // ─── STATIONERY ────────────────────────────────────────────────
    { name: 'A4 Paper Ream 500 sheets', sku: 'STAT-001', category: 'Stationery', description: '75 GSM white A4 printer paper', price: 280, quantity: 80, unit: 'reams', reorderLevel: 20, leadTime: 2 },
    { name: 'Ballpoint Pen (Box of 10)', sku: 'STAT-002', category: 'Stationery', description: 'Reynolds Trimax blue ballpoint pens', price: 90, quantity: 200, unit: 'boxes', reorderLevel: 50, leadTime: 1 },
    { name: 'Sticky Notes 3x3', sku: 'STAT-003', category: 'Stationery', description: 'Post-it 3x3 inch self-adhesive notes 100 sheets', price: 120, quantity: 150, unit: 'pads', reorderLevel: 40, leadTime: 1 },
    { name: 'Stapler Heavy Duty', sku: 'STAT-004', category: 'Stationery', description: 'Max HD-12 heavy duty 70-sheet stapler', price: 650, quantity: 30, unit: 'pcs', reorderLevel: 8, leadTime: 2 },
    { name: 'Permanent Marker Set', sku: 'STAT-005', category: 'Stationery', description: 'Camlin permanent markers set of 10 colors', price: 250, quantity: 60, unit: 'sets', reorderLevel: 15, leadTime: 2 },
    { name: 'Spiral Notebook A5', sku: 'STAT-006', category: 'Stationery', description: '200 pages ruled spiral notebook', price: 150, quantity: 110, unit: 'pcs', reorderLevel: 30, leadTime: 2 },

    // ─── FURNITURE ─────────────────────────────────────────────────
    { name: 'Office Chair Ergonomic', sku: 'FURN-001', category: 'Furniture', description: 'Mesh back adjustable lumbar support office chair', price: 12000, quantity: 7, unit: 'pcs', reorderLevel: 3, leadTime: 10 },
    { name: 'Wooden Study Table', sku: 'FURN-002', category: 'Furniture', description: '4x2 feet wooden study desk with drawer', price: 8500, quantity: 5, unit: 'pcs', reorderLevel: 2, leadTime: 14 },
    { name: '3-Shelf Bookcase', sku: 'FURN-003', category: 'Furniture', description: 'Engineered wood open bookcase shelf unit', price: 4500, quantity: 8, unit: 'pcs', reorderLevel: 3, leadTime: 10 },
    { name: 'Filing Cabinet 3-Drawer', sku: 'FURN-004', category: 'Furniture', description: 'Metal lateral filing cabinet with lock', price: 6200, quantity: 6, unit: 'pcs', reorderLevel: 2, leadTime: 12 },

    // ─── CLOTHING ──────────────────────────────────────────────────
    { name: 'Cotton T-Shirt Men (Pack of 3)', sku: 'CLTH-001', category: 'Clothing', description: 'Plain round neck cotton t-shirts assorted colors', price: 699, quantity: 50, unit: 'packs', reorderLevel: 12, leadTime: 5 },
    { name: 'Formal Shirt Men', sku: 'CLTH-002', category: 'Clothing', description: 'Full sleeve slim fit office formal shirt', price: 1299, quantity: 35, unit: 'pcs', reorderLevel: 10, leadTime: 5 },
    { name: 'Sports Sneakers', sku: 'CLTH-003', category: 'Clothing', description: 'Lightweight mesh running sports shoes', price: 2499, quantity: 28, unit: 'pairs', reorderLevel: 8, leadTime: 7 },
    { name: 'Winter Jacket', sku: 'CLTH-004', category: 'Clothing', description: 'Water resistant padded warm winter jacket', price: 3999, quantity: 15, unit: 'pcs', reorderLevel: 5, leadTime: 7 },
    { name: 'Cotton Socks (Pack of 6)', sku: 'CLTH-005', category: 'Clothing', description: 'Ankle length breathable cotton socks', price: 399, quantity: 70, unit: 'packs', reorderLevel: 20, leadTime: 3 },

    // ─── CLEANING & HYGIENE ────────────────────────────────────────
    { name: 'Liquid Hand Wash 500ml', sku: 'CLEN-001', category: 'Cleaning', description: 'Dettol antibacterial liquid hand wash refill', price: 185, quantity: 100, unit: 'bottles', reorderLevel: 30, leadTime: 2 },
    { name: 'Disinfectant Floor Cleaner 1L', sku: 'CLEN-002', category: 'Cleaning', description: 'Lizol pine disinfectant surface cleaner', price: 220, quantity: 75, unit: 'bottles', reorderLevel: 20, leadTime: 2 },
    { name: 'Microfiber Cleaning Cloth', sku: 'CLEN-003', category: 'Cleaning', description: 'Pack of 5 reusable microfiber cleaning cloths', price: 350, quantity: 60, unit: 'packs', reorderLevel: 15, leadTime: 2 },
    { name: 'Garbage Bags 30L (Pack of 20)', sku: 'CLEN-004', category: 'Cleaning', description: 'Heavy duty biodegradable garbage bags', price: 180, quantity: 90, unit: 'packs', reorderLevel: 25, leadTime: 2 },
    { name: 'Hand Sanitizer 500ml', sku: 'CLEN-005', category: 'Cleaning', description: 'Savlon instant hand sanitizer 70% alcohol', price: 175, quantity: 120, unit: 'bottles', reorderLevel: 35, leadTime: 2 },
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-inventory');
        console.log('✅ MongoDB Connected');

        let added = 0;
        let skipped = 0;

        for (const product of products) {
            const exists = await Product.findOne({ sku: product.sku });
            if (exists) {
                console.log(`⏩ Skipped (already exists): ${product.name}`);
                skipped++;
            } else {
                await Product.create(product);
                console.log(`✅ Added: ${product.name}`);
                added++;
            }
        }

        console.log(`\n📦 Seeding complete! Added: ${added}, Skipped: ${skipped}`);
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
