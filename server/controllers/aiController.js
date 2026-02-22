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

            // ── Demand Calculations ──────────────────────────────────────
            // 1. Observed Historical Average (Direct data)
            const historicalDailyDemand = totalSold / TOTAL_WINDOW_DAYS;

            // 2. WMA Predicted Demand (Weighted forecasting)
            const predictedMonthlyDemand = weightedMovingAverage(monthlySales);
            const AVG_DAYS_PER_MONTH = 30;
            const predictedDailyDemand = predictedMonthlyDemand / AVG_DAYS_PER_MONTH;

            // Monthly std dev → daily std dev (for safety stock)
            const monthlyStdDev = stdDev(monthlySales);
            const dailyStdDev = monthlyStdDev / AVG_DAYS_PER_MONTH;

            // ── Safety Stock (Z=1.65 → 95% service level)
            const leadTimeDays = product.leadTime || 3;
            const Z = 1.65;
            const safetyStock = Math.ceil(Z * dailyStdDev * Math.sqrt(leadTimeDays));

            // ── Days Until Stockout ──────────────────────────────────────
            // Based on historical daily demand for the most accurate observation
            let daysUntilStockout;
            if (product.quantity === 0) {
                daysUntilStockout = 0;
            } else if (historicalDailyDemand <= 0) {
                daysUntilStockout = null;
            } else {
                daysUntilStockout = Math.min(999, Math.floor(product.quantity / historicalDailyDemand));
            }


            // ── Urgency (computed first so reorder qty can scale with it)
            // Mirrors Inventory.jsx stock thresholds exactly:
            //   qty = 0 or < 5  → critical
            //   qty < 10        → low
            //   qty >= 10       → ok (unless demand signals escalate it)
            let urgency = 'ok';
            if (product.quantity === 0 || product.quantity < 5) {
                urgency = 'critical';
            } else if (product.quantity < 10) {
                urgency = 'low';
            }
            // Demand-based escalation
            if (urgency !== 'critical' && daysUntilStockout !== null && daysUntilStockout <= leadTimeDays) {
                urgency = 'critical';
            } else if (urgency === 'ok' && daysUntilStockout !== null && daysUntilStockout <= leadTimeDays * 2) {
                urgency = 'low';
            }

            // ── Recommended Reorder Quantity
            // Base target: enough to cover lead time demand + safety stock, min = 2× reorderLevel
            const demandDuringLeadTime = Math.ceil(predictedDailyDemand * leadTimeDays);
            const baseTarget = Math.max(product.reorderLevel * 2, demandDuringLeadTime + safetyStock);

            let recommendedReorderQty;
            if (totalSold === 0) {
                // No purchase history — scale by urgency using the reorder level
                if (urgency === 'critical') {
                    recommendedReorderQty = product.reorderLevel * 3;
                } else if (urgency === 'low') {
                    recommendedReorderQty = product.reorderLevel * 2;
                } else {
                    recommendedReorderQty = 0; // In Stock — no reorder needed
                }
            } else {
                // With real demand data — scale by urgency
                if (urgency === 'critical') {
                    recommendedReorderQty = Math.ceil(baseTarget * 3);
                } else if (urgency === 'low') {
                    recommendedReorderQty = Math.ceil(baseTarget * 2);
                } else {
                    recommendedReorderQty = 0; // In Stock — no reorder needed
                }
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
                avgDailyDemand: parseFloat(historicalDailyDemand.toFixed(2)),
                predictedDailyDemand: parseFloat(predictedDailyDemand.toFixed(2)),
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
