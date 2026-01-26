import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Package, CheckCircle, Clock, Truck, Home } from 'lucide-react';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/orders');
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Order tracking steps
    const trackingSteps = [
        { key: 'Pending', label: 'Order Placed', icon: Clock },
        { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
        { key: 'Shipped', label: 'Shipped', icon: Truck },
        { key: 'Delivered', label: 'Delivered', icon: Home }
    ];

    const getStepStatus = (orderStatus, stepKey) => {
        const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
        const currentIndex = statusOrder.indexOf(orderStatus);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (orderStatus === 'Cancelled') return 'cancelled';
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Orders</h1>
                <p className="page-subtitle">Track your order history</p>
            </div>

            {loading ? (
                <div className="text-center text-muted py-12">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="card text-center py-12">
                    <ClipboardList size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-muted">No orders yet</p>
                    <p className="text-sm text-muted mt-1">Start shopping to see your orders here</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="card">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                                    <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                                </div>
                                <span className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</span>
                            </div>

                            {/* Order Tracking Timeline */}
                            {order.status !== 'Cancelled' ? (
                                <div className="tracking-timeline mb-6">
                                    {trackingSteps.map((step, index) => {
                                        const status = getStepStatus(order.status, step.key);
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.key} className="tracking-step">
                                                <div className={`tracking-icon ${status}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <p className={`tracking-label ${status}`}>{step.label}</p>
                                                {index < trackingSteps.length - 1 && (
                                                    <div className={`tracking-line ${status === 'completed' ? 'completed' : ''}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
                                    This order has been cancelled
                                </div>
                            )}

                            {/* Order Items */}
                            <div className="border-t pt-4">
                                <p className="text-sm font-medium mb-3">Order Items</p>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                <Package size={16} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-muted">Qty: {item.quantity} × ${item.price}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;
