import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Package, CheckCircle, Truck, XCircle, Download } from 'lucide-react';

const AdminOrders = () => {
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

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status });
            fetchOrders();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'badge-warning';
            case 'Confirmed': return 'badge-info';
            case 'Shipped': return 'badge-info';
            case 'Delivered': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Export orders to CSV
    const exportToCSV = () => {
        const headers = ['Order Number', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'];

        const csvContent = [
            headers.join(','),
            ...orders.map(o => [
                o.orderNumber,
                `"${o.customer?.name || 'N/A'}"`,
                o.customer?.email || 'N/A',
                o.items.length,
                o.totalAmount.toFixed(2),
                o.status,
                formatDate(o.createdAt)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-title">Customer Orders</h1>
                    <p className="page-subtitle">Manage and track orders ({orders.length} total)</p>
                </div>
                <button className="btn" style={{ background: '#f1f5f9' }} onClick={exportToCSV}>
                    <Download size={16} />
                    <span>Export CSV</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center text-muted py-12">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="card text-center py-12">
                    <ClipboardList size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-muted">No orders yet</p>
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>
                                        <span className="font-mono text-xs">{order.orderNumber}</span>
                                    </td>
                                    <td>
                                        <p className="font-medium text-sm">{order.customer?.name || 'N/A'}</p>
                                        <p className="text-xs text-muted">{order.customer?.email}</p>
                                    </td>
                                    <td>
                                        <p className="text-sm">{order.items.length} item(s)</p>
                                        <p className="text-xs text-muted">
                                            {order.items.map(i => i.name).join(', ').substring(0, 30)}...
                                        </p>
                                    </td>
                                    <td className="font-semibold">${order.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-sm text-muted">{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            {order.status === 'Pending' && (
                                                <button
                                                    className="action-btn text-green-600"
                                                    title="Confirm"
                                                    onClick={() => updateStatus(order._id, 'Confirmed')}
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            {order.status === 'Confirmed' && (
                                                <button
                                                    className="action-btn text-blue-600"
                                                    title="Ship"
                                                    onClick={() => updateStatus(order._id, 'Shipped')}
                                                >
                                                    <Truck size={16} />
                                                </button>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <button
                                                    className="action-btn text-green-600"
                                                    title="Mark Delivered"
                                                    onClick={() => updateStatus(order._id, 'Delivered')}
                                                >
                                                    <Package size={16} />
                                                </button>
                                            )}
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <button
                                                    className="action-btn text-red-500"
                                                    title="Cancel"
                                                    onClick={() => updateStatus(order._id, 'Cancelled')}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
