import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight } from 'lucide-react';

const AIInsights = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/ai/predict-reorder');
            setResults(data);
        } catch (error) {
            console.error(error);
            alert("Analysis failed - ensure you are Admin");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Sparkles size={20} className="text-primary" />
                        AI Forecasting
                    </h1>
                    <p className="page-subtitle">Predict demand and auto-generate orders</p>
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="btn btn-primary"
                >
                    {analyzing ? 'Analyzing...' : 'Run Prediction'}
                    {!analyzing && <ArrowRight size={16} />}
                </button>
            </div>

            {results && (
                <div className="space-y-6">
                    <div className="card border-l-4 border-l-yellow-400">
                        <h2 className="text-lg mb-4">Stock Alerts ({results.alerts.length})</h2>
                        {results.alerts.length === 0 ? (
                            <p className="text-green-600">All stock levels are optimal.</p>
                        ) : (
                            <div className="space-y-3">
                                {results.alerts.map((alert, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
                                        <div>
                                            <span className="font-medium">{alert.product}</span>
                                            <span className="mx-2 text-muted text-sm">Current: {alert.currentStock}</span>
                                        </div>
                                        <div className="text-sm">
                                            Predicted: <strong>{alert.predictedDemand}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card border-l-4 border-l-blue-400">
                        <h2 className="text-lg mb-4">Generated Orders ({results.generatedOrders.length})</h2>
                        {results.generatedOrders.length === 0 ? (
                            <p className="text-muted">No orders needed at this time.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.generatedOrders.map(order => (
                                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between mb-3">
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{order.orderNumber}</span>
                                            <span className="text-xs text-blue-600 font-medium">Auto-Generated</span>
                                        </div>
                                        <div className="mb-3">
                                            <p className="font-medium">{order.items[0].product.name || 'Product'}</p>
                                            <p className="text-sm text-muted">Qty: {order.items[0].quantity} • ${order.totalAmount}</p>
                                        </div>
                                        <button className="w-full py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition">
                                            Review Order
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!results && !analyzing && (
                <div className="card text-center py-16">
                    <Sparkles size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-muted">Run the prediction engine to analyze trends</p>
                </div>
            )}
        </div>
    );
};

export default AIInsights;
