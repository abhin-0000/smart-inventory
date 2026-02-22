import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Sparkles, TrendingUp, AlertTriangle, CheckCircle,
    RefreshCw, Package, BarChart2, ShoppingCart, Info
} from 'lucide-react';

const urgencyConfig = {
    critical: {
        label: 'Critical',
        bg: '#fef2f2',
        color: '#dc2626',
        icon: AlertTriangle,
        badgeBg: '#fee2e2',
        badgeColor: '#991b1b'
    },
    low: {
        label: 'Low Stock',
        bg: '#fffbeb',
        color: '#d97706',
        icon: TrendingUp,
        badgeBg: '#fef3c7',
        badgeColor: '#92400e'
    },
    ok: {
        label: 'OK',
        bg: '#f0fdf4',
        color: '#16a34a',
        icon: CheckCircle,
        badgeBg: '#dcfce7',
        badgeColor: '#166534'
    }
};

const AIInsights = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [filterUrgency, setFilterUrgency] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const { data: res } = await axios.get('http://localhost:5000/api/ai/reorder-predictions');
            setData(res);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load predictions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const categories = data
        ? ['all', ...new Set(data.predictions.map(p => p.category))]
        : ['all'];

    const filtered = data ? data.predictions.filter(p => {
        const matchUrgency = filterUrgency === 'all' || p.urgency === filterUrgency;
        const matchCat = filterCategory === 'all' || p.category === filterCategory;
        return matchUrgency && matchCat;
    }) : [];

    // Sparkline bar for weekly sales
    const WeeklySparkline = ({ months }) => {
        const max = Math.max(...months, 1);
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
                {months.map((v, i) => (
                    <div key={i} style={{
                        width: 10,
                        height: `${Math.max(10, (v / max) * 28)}px`,
                        borderRadius: 3,
                        background: i === 3 ? 'var(--primary)' : '#c7d2fe',
                    }} title={['Nov', 'Dec', 'Jan', 'Feb'][i] + ': ' + v + ' units'} />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
                <Sparkles size={36} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Analyzing purchase trends with WMA algorithm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center" style={{ padding: '3rem' }}>
                <AlertTriangle size={36} style={{ color: '#dc2626', margin: '0 auto 12px' }} />
                <p style={{ color: '#dc2626', fontWeight: 600 }}>Prediction failed</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{error}</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => fetchPredictions()}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Sparkles size={22} style={{ color: 'var(--primary)' }} />
                        AI Demand Forecasting
                    </h1>
                    <p className="page-subtitle">
                        Weighted Moving Average on last 28 days of purchase data
                    </p>
                </div>
                <button
                    className="btn"
                    style={{ background: '#f1f5f9' }}
                    onClick={() => fetchPredictions(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* CSS for spin */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {/* Summary — Need Reorder only */}
            {data && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div className="card" style={{
                        padding: '1.75rem 3rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        minWidth: 260,
                        boxShadow: '0 4px 20px rgba(217, 119, 6, 0.12)',
                        border: '1.5px solid #fcd34d'
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: '#fffbeb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <ShoppingCart size={24} style={{ color: '#d97706' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
                                Products Needing Reorder
                            </p>
                            <p style={{ fontSize: 40, fontWeight: 800, color: '#d97706', lineHeight: 1 }}>
                                {data.summary.needingReorder}
                            </p>
                            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                out of {data.summary.totalProducts} total products
                            </p>
                        </div>
                    </div>
                </div>
            )}




            {/* Filters */}
            <div className="card" style={{ marginBottom: 16, padding: '1rem' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Filter:</span>
                    {/* Urgency filter */}
                    {['all', 'critical', 'low', 'ok'].map(u => (
                        <button key={u} onClick={() => setFilterUrgency(u)} style={{
                            padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', border: 'none',
                            background: filterUrgency === u
                                ? (u === 'all' ? 'var(--primary)' : urgencyConfig[u]?.badgeBg || '#e2e8f0')
                                : '#f1f5f9',
                            color: filterUrgency === u
                                ? (u === 'all' ? '#fff' : urgencyConfig[u]?.badgeColor || '#374151')
                                : '#64748b'
                        }}>
                            {u === 'all' ? 'All' : urgencyConfig[u].label}
                        </button>
                    ))}

                    <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

                    {/* Category filter */}
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{
                            padding: '4px 10px', borderRadius: 8, fontSize: 12, border: '1.5px solid #e2e8f0',
                            outline: 'none', background: '#fff', cursor: 'pointer'
                        }}
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                        ))}
                    </select>

                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                        Showing {filtered.length} of {data?.predictions.length} products
                    </span>
                </div>
            </div>

            {/* Predictions Table */}
            <div className="card p-0 overflow-hidden">
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: '#fafbfc' }}>Product</th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: '#fafbfc' }}>Current Stock</th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: '#fafbfc' }}>Avg Daily Demand</th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: '#fafbfc' }}>Days Until Stockout</th>

                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', background: '#fafbfc' }}>Reorder Qty ✦</th>
                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: '#fafbfc' }}>Urgency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No products match the selected filters
                                </td>
                            </tr>
                        ) : filtered.map(p => {
                            const cfg = urgencyConfig[p.urgency];
                            const UrgencyIcon = cfg.icon;
                            return (
                                <tr key={p.productId} style={{ borderTop: '1px solid #f1f5f9', background: p.urgency === 'critical' ? '#fff8f8' : 'white' }}>
                                    {/* Product */}
                                    <td style={{ padding: '14px 16px' }}>
                                        <p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                                            <span style={{ fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '1px 7px', borderRadius: 999, fontWeight: 500 }}>
                                                {p.category}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.sku}</span>
                                        </div>
                                    </td>

                                    {/* Current Stock */}
                                    <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: p.currentStock === 0 ? '#dc2626'      // Out of Stock
                                                : p.currentStock < 5 ? '#991b1b'      // Critical
                                                    : p.currentStock < 10 ? '#d97706'      // Low Stock
                                                        : '#16a34a'                             // In Stock
                                        }}>
                                            {p.currentStock}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{p.unit}</span>
                                        <span style={{
                                            fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                                            color: p.currentStock === 0 ? '#dc2626'
                                                : p.currentStock < 5 ? '#991b1b'
                                                    : p.currentStock < 10 ? '#d97706'
                                                        : '#16a34a'
                                        }}>
                                            {p.currentStock === 0 ? 'Out of Stock'
                                                : p.currentStock < 5 ? 'Critical'
                                                    : p.currentStock < 10 ? 'Low Stock'
                                                        : 'In Stock'}
                                        </span>
                                    </td>


                                    {/* Avg Daily Demand */}
                                    <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                                        {p.hasRealData ? (
                                            <>
                                                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.avgDailyDemand}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>/ day</span>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>No sales data</span>
                                        )}
                                    </td>

                                    {/* Days Until Stockout */}
                                    <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                                        {p.daysUntilStockout === null ? (
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                                        ) : p.daysUntilStockout === 0 ? (
                                            <span style={{
                                                display: 'inline-block', padding: '2px 10px',
                                                background: '#fef2f2', color: '#dc2626',
                                                borderRadius: 999, fontSize: 11, fontWeight: 700
                                            }}>Stockout</span>
                                        ) : (
                                            <span style={{
                                                fontWeight: 700, fontSize: 15,
                                                color: p.daysUntilStockout <= p.leadTimeDays ? '#dc2626'
                                                    : p.daysUntilStockout <= p.leadTimeDays * 2 ? '#d97706'
                                                        : '#16a34a'
                                            }}>
                                                {p.daysUntilStockout === 999 ? '999+ d' : `${p.daysUntilStockout}d`}
                                            </span>
                                        )}
                                    </td>



                                    {/* Recommended Reorder Qty — highlighted */}
                                    <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            background: p.urgency === 'critical' ? '#fef2f2' : p.urgency === 'low' ? '#fffbeb' : '#f0fdf4',
                                            border: `2px solid ${p.urgency === 'critical' ? '#fca5a5' : p.urgency === 'low' ? '#fcd34d' : '#86efac'}`,
                                            borderRadius: 10, padding: '6px 14px',
                                        }}>
                                            <span style={{
                                                fontWeight: 800, fontSize: 18,
                                                color: p.urgency === 'critical' ? '#dc2626' : p.urgency === 'low' ? '#d97706' : '#16a34a'
                                            }}>
                                                {p.recommendedReorderQty}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginTop: 1 }}>{p.unit}</span>
                                        </div>
                                    </td>

                                    {/* Urgency Badge */}
                                    <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                                            background: cfg.badgeBg, color: cfg.badgeColor
                                        }}>
                                            <UrgencyIcon size={12} />
                                            {cfg.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer note */}
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, textAlign: 'right' }}>
                Lead time & safety stock factored in. Predictions auto-refresh on page load.
            </p>
        </div>
    );
};

export default AIInsights;
