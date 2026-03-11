import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Package, AlertTriangle, ShoppingBag } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="card">
        <div className="flex items-center justify-between mb-3">
            <div className={`icon-box bg-${color}-50`}>
                <Icon size={20} className={`text-${color}-600`} />
            </div>
        </div>
        <p className="text-muted text-sm">{title}</p>
        <h3 className="text-2xl mt-1">{loading ? '...' : value}</h3>
    </div>
);

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/orders')
            ]);
            setProducts(productsRes.data);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate real stats
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const criticalCount = products.filter(p => p.quantity < 5).length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const totalRevenue = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Calculate weekly sales from actual order data
    const getWeeklySalesData = () => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const salesByDay = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

        // Get orders from the last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        orders
            .filter(order => order.status !== 'Cancelled')
            .forEach(order => {
                const orderDate = new Date(order.createdAt);
                if (orderDate >= sevenDaysAgo) {
                    const dayName = dayNames[orderDate.getDay()];
                    salesByDay[dayName] += order.totalAmount;
                }
            });

        // Return data starting from Monday
        const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return orderedDays.map(day => ({
            name: day,
            sales: Math.round(salesByDay[day] * 100) / 100
        }));
    };

    const chartData = getWeeklySalesData();
    const recentOrders = orders.slice(0, 3);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your inventory and orders</p>
            </div>

            <div className="grid-4 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={IndianRupee}
                    color="blue"
                    loading={loading}
                />
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    icon={Package}
                    color="purple"
                    loading={loading}
                />
                <StatCard
                    title="Critical Items"
                    value={criticalCount}
                    icon={AlertTriangle}
                    color="yellow"
                    loading={loading}
                />
                <StatCard
                    title="Pending Orders"
                    value={pendingOrders}
                    icon={ShoppingBag}
                    color="green"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg mb-4">Weekly Sales</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #f1f5f9',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                    }}
                                />
                                <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg mb-4">Recent Orders</h2>
                    {loading ? (
                        <p className="text-muted text-center py-8">Loading...</p>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-muted text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order._id} className="flex items-center justify-between py-3 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-medium">
                                            {order.customer?.name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{order.customer?.name || 'Customer'}</p>
                                            <p className="text-xs text-muted">{order.items.length} item(s) • {order.status}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
