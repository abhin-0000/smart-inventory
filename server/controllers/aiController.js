const Product = require('../models/Product');
const Order = require('../models/Order');
const PurchaseOrder = require('../models/PurchaseOrder');

// ─── HELPER: Weighted Moving Average ───────────────────────────────────────
// Recent months get higher weight: w1=1, w2=2, w3=3, w4=4 (oldest→newest)
const weightedMovingAverage = (monthlySales) => {
    const n = monthlySales.length;
    if (n === 0) return 0;
    let weightedSum = 0;
    let weightTotal = 0;
    monthlySales.forEach((sales, i) => {
        const weight = i + 1;
        weightedSum += sales * weight;
        weightTotal += weight;
    });
    return weightedSum / weightTotal;
};

// ─── HELPER: Standard Deviation ────────────────────────────────────────────
const stdDev = (values) => {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
};

// ─── 4 Monthly Buckets: Nov 2025, Dec 2025, Jan 2026, Feb 2026 ─────────────
const MONTHS = [
    { year: 2025, month: 10, days: 30, label: 'Nov 2025' },
    { year: 2025, month: 11, days: 31, label: 'Dec 2025' },
    { year: 2026, month: 0, days: 31, label: 'Jan 2026' },
    { year: 2026, month: 1, days: 28, label: 'Feb 2026' },
];

// Total days in our observation window
const TOTAL_WINDOW_DAYS = MONTHS.reduce((sum, m) => sum + m.days, 0); // 120 days

// Check which monthly bucket a date falls into
const getMonthIndex = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    return MONTHS.findIndex(b => b.year === y && b.month === m);
};

// @desc    Get reorder predictions for all products using WMA on real order data
// @route   GET /api/ai/reorder-predictions
// @access  Admin
const getReorderPredictions = async (req, res) => {
    try {
        const products = await Product.find();

        // Fetch all orders in our 4-month window
        const windowStart = new Date(2025, 10, 1);          // Nov 1 2025
        const windowEnd = new Date(2026, 1, 28, 23, 59, 59); // Feb 28 2026

        const allOrders = await Order.find({
            createdAt: { $gte: windowStart, $lte: windowEnd },
            status: { $in: ['Delivered', 'Shipped', 'Confirmed', 'Pending'] }
        });

        const predictions = [];

        for (const product of products) {
            // Build 4 monthly sales totals [Nov, Dec, Jan, Feb]
            const monthlySales = [0, 0, 0, 0];

            for (const order of allOrders) {
                const item = order.items.find(i =>
                    i.product && i.product.toString() === product._id.toString()
                );
                if (!item) continue;

                const idx = getMonthIndex(new Date(order.createdAt));
                if (idx >= 0) monthlySales[idx] += item.quantity;
            }

            const totalSold = monthlySales.reduce((a, b) => a + b, 0);

            // ── WMA: weighted-average monthly demand (most recent month = highest weight)
            const predictedMonthlyDemand = weightedMovingAverage(monthlySales);

            // ── Avg Daily Demand
            // Use avg days/month across our 4-month window (120 days / 4 months = 30)
            const AVG_DAYS_PER_MONTH = TOTAL_WINDOW_DAYS / MONTHS.length; // 30
            const avgDailyDemand = predictedMonthlyDemand / AVG_DAYS_PER_MONTH;

            // ── Std dev for safety stock
            const monthlyStdDev = stdDev(monthlySales);
            const dailyStdDev = monthlyStdDev / AVG_DAYS_PER_MONTH;

            // ── Safety Stock (Z=1.65 → 95% service level)
            const leadTimeDays = product.leadTime || 3;
            const Z = 1.65;
            const safetyStock = Math.ceil(Z * dailyStdDev * Math.sqrt(leadTimeDays));

            // ── Days Until Stockout ──────────────────────────────────────
            // qty=0  → already stockout → 0
            // no demand data → null (displayed as "—")
            // normal → floor(qty / avgDailyDemand), capped at 999 to avoid noise
            let daysUntilStockout;
            if (product.quantity === 0) {
                daysUntilStockout = 0;
            } else if (avgDailyDemand <= 0) {
                daysUntilStockout = null;
            } else {
                daysUntilStockout = Math.min(999, Math.floor(product.quantity / avgDailyDemand));
            }

            // ── Recommended Reorder Quantity
            const demandDuringLeadTime = Math.ceil(avgDailyDemand * leadTimeDays);
            let recommendedReorderQty;

            if (totalSold === 0) {
                // No purchase history → fall back to the product's reorder level
                recommendedReorderQty = product.reorderLevel;
            } else {
                // Cover demand during lead time + safety stock, at minimum = reorderLevel
                recommendedReorderQty = Math.max(
                    product.reorderLevel,
                    demandDuringLeadTime + safetyStock
                );
            }

            // ── Urgency
            let urgency = 'ok';
            if (product.quantity === 0) {
                urgency = 'critical';
            } else if (daysUntilStockout !== null && daysUntilStockout <= leadTimeDays) {
                urgency = 'critical'; // will run out before next delivery
            } else if (product.quantity <= product.reorderLevel) {
                urgency = 'low';
            } else if (daysUntilStockout !== null && daysUntilStockout <= leadTimeDays * 2) {
                urgency = 'low';
            }

            predictions.push({
                productId: product._id,
                name: product.name,
                sku: product.sku,
                category: product.category,
                currentStock: product.quantity,
                unit: product.unit,
                reorderLevel: product.reorderLevel,
                leadTimeDays,
                avgDailyDemand: parseFloat(avgDailyDemand.toFixed(2)),
                predictedMonthlyDemand: parseFloat(predictedMonthlyDemand.toFixed(1)),
                safetyStock,
                recommendedReorderQty,
                daysUntilStockout,
                totalSoldLast4Months: totalSold,
                monthlySales,
                urgency,
                hasRealData: totalSold > 0
            });
        }

        // Sort: critical → low → ok; within same urgency by daysUntilStockout asc
        const urgencyOrder = { critical: 0, low: 1, ok: 2 };
        predictions.sort((a, b) => {
            const urgDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            if (urgDiff !== 0) return urgDiff;
            if (a.daysUntilStockout === null && b.daysUntilStockout === null) return 0;
            if (a.daysUntilStockout === null) return 1;
            if (b.daysUntilStockout === null) return -1;
            return a.daysUntilStockout - b.daysUntilStockout;
        });

        const summary = {
            totalProducts: predictions.length,
            needingReorder: predictions.filter(p => p.urgency !== 'ok').length,
            critical: predictions.filter(p => p.urgency === 'critical').length,
            low: predictions.filter(p => p.urgency === 'low').length,
            withSalesData: predictions.filter(p => p.hasRealData).length
        };

        res.json({ summary, predictions });

    } catch (error) {
        console.error('Reorder prediction error:', error);
        res.status(500).json({ message: 'Prediction failed', error: error.message });
    }
};

// @desc    Run AI analysis (legacy endpoint)
// @route   POST /api/ai/predict-reorder
// @access  Admin
const predictAndReorder = async (req, res) => {
    try {
        const products = await Product.find().populate('supplier');
        const alerts = [];
        const generatedOrders = [];

        for (const product of products) {
            if (!product.supplier) continue;

            const salesHistory = [
                [1, Math.floor(Math.random() * 5)],
                [2, Math.floor(Math.random() * 5)],
                [3, Math.floor(Math.random() * 5)],
                [4, Math.floor(Math.random() * 5)],
                [5, Math.floor(Math.random() * 5)],
                [6, Math.floor(Math.random() * 6)],
                [7, Math.floor(Math.random() * 8)]
            ];

            const sum = salesHistory.reduce((a, [_, s]) => a + s, 0);
            const prediction = sum / salesHistory.length;
            const predictedConsumptionDuringLeadTime = prediction * product.leadTime;
            const projectedStock = product.quantity - predictedConsumptionDuringLeadTime;

            if (projectedStock < product.reorderLevel) {
                const reorderQty = Math.ceil(product.reorderLevel * 2 - projectedStock);
                alerts.push({
                    product: product.name,
                    currentStock: product.quantity,
                    predictedDemand: prediction.toFixed(2),
                    message: `Stock projected to fall below reorder level (${product.reorderLevel})`
                });
                const order = await PurchaseOrder.create({
                    orderNumber: `ORD-AI-${Date.now()}-${product.sku}`,
                    supplier: product.supplier._id,
                    items: [{ product: product._id, quantity: reorderQty, unitPrice: product.price }],
                    totalAmount: reorderQty * product.price,
                    status: 'Pending',
                    isAutoGenerated: true,
                    createdBy: req.user._id
                });
                generatedOrders.push(order);
            }
        }

        res.json({ success: true, alerts, generatedOrders });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI Analysis Failed' });
    }
};

module.exports = { predictAndReorder, getReorderPredictions };
