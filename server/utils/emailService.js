const nodemailer = require('nodemailer');

// Create transporter - Configure with your email service
// For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

// Admin email to receive notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

/**
 * Send low stock alert email
 * @param {Object} product - Product that reached low stock
 */
const sendLowStockAlert = async (product) => {
    // Skip if email not configured
    if (!process.env.SMTP_USER) {
        console.log(`[EMAIL] Low stock alert for ${product.name} (email not configured)`);
        return;
    }

    try {
        const statusLabel = product.quantity === 0 ? 'OUT OF STOCK' :
            product.quantity < (product.reorderLevel * 0.25) ? 'CRITICAL' : 'LOW STOCK';

        const mailOptions = {
            from: `"Smart Inventory" <${process.env.SMTP_USER}>`,
            to: ADMIN_EMAIL,
            subject: `⚠️ ${statusLabel}: ${product.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${product.quantity === 0 ? '#ef4444' : '#f59e0b'}; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">${statusLabel}</h1>
                    </div>
                    <div style="padding: 30px; background: #f8fafc;">
                        <h2 style="color: #1e293b; margin-top: 0;">${product.name}</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>SKU:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${product.sku}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Current Stock:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: ${product.quantity === 0 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
                                    ${product.quantity} ${product.unit}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;"><strong>Reorder Level:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${product.reorderLevel} ${product.unit}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0;"><strong>Category:</strong></td>
                                <td style="padding: 10px 0;">${product.category}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.APP_URL || 'http://localhost:5173'}/inventory" 
                               style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                View Inventory
                            </a>
                        </div>
                    </div>
                    <div style="padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
                        Smart Inventory Management System
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Low stock alert sent for ${product.name}`);
    } catch (error) {
        console.error('[EMAIL] Failed to send low stock alert:', error.message);
    }
};

/**
 * Check product stock and send alert if low
 * @param {Object} product - Product to check
 */
const checkAndAlertLowStock = async (product) => {
    // Alert when stock is at or below reorder level (industry standard threshold)
    if (product.quantity <= product.reorderLevel) {
        await sendLowStockAlert(product);
    }
};

module.exports = { sendLowStockAlert, checkAndAlertLowStock };
