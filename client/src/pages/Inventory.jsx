import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, X, Pencil, Trash2, Image, Download, Filter, RotateCcw, ScanLine } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);

    // Search & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);
    const [stockAdjustment, setStockAdjustment] = useState({ type: 'add', quantity: '' });

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        description: '',
        image: '',
        price: '',
        quantity: '',
        unit: 'pcs',
        reorderLevel: '10'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories for filter dropdown
    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category))];
        return cats.sort();
    }, [products]);

    // Get stock status for a product - Fixed quantity thresholds
    // Out of Stock: quantity = 0
    // Critical: quantity < 5 (urgent reorder needed)
    // Low Stock: quantity < 10 (needs attention)
    // In Stock: quantity >= 10 (adequate stock)
    const getStockStatus = (product) => {
        if (product.quantity === 0) return 'out';
        if (product.quantity < 5) return 'critical';
        if (product.quantity < 10) return 'low';
        return 'in';
    };

    // Filtered products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search filter
            const matchesSearch = searchTerm === '' ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase());

            // Category filter
            const matchesCategory = filterCategory === '' || product.category === filterCategory;

            // Status filter
            const status = getStockStatus(product);
            const matchesStatus = filterStatus === '' || status === filterStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchTerm, filterCategory, filterStatus]);

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
        setFilterStatus('');
    };

    const hasActiveFilters = searchTerm || filterCategory || filterStatus;

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'SKU', 'Category', 'Price', 'Quantity', 'Unit', 'Reorder Level', 'Status'];
        const statusLabels = { out: 'Out of Stock', critical: 'Critical', low: 'Low Stock', in: 'In Stock' };

        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(p => [
                `"${p.name}"`,
                p.sku,
                p.category,
                p.price,
                p.quantity,
                p.unit,
                p.reorderLevel,
                statusLabels[getStockStatus(p)]
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sku: '',
            category: '',
            description: '',
            image: '',
            price: '',
            quantity: '',
            unit: 'pcs',
            reorderLevel: '10'
        });
        setEditingProduct(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            category: product.category,
            description: product.description || '',
            image: product.image || '',
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            unit: product.unit,
            reorderLevel: product.reorderLevel.toString()
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                sku: formData.sku,
                category: formData.category,
                description: formData.description,
                image: formData.image,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                unit: formData.unit,
                reorderLevel: parseInt(formData.reorderLevel)
            };

            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, payload);
            } else {
                await axios.post('http://localhost:5000/api/products', payload);
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Failed to save product", error);
            alert(error.response?.data?.message || "Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/products/${productId}`);
            fetchProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    // Handle barcode scan
    const handleBarcodeScan = (sku) => {
        setShowScanner(false);
        const product = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
        if (product) {
            setScannedProduct(product);
            setStockAdjustment({ type: 'add', quantity: '' });
        } else {
            alert(`No product found with SKU: ${sku}`);
        }
    };

    // Handle quick stock update
    const handleQuickStockUpdate = async () => {
        if (!stockAdjustment.quantity || parseInt(stockAdjustment.quantity) <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/products/${scannedProduct._id}/stock`, {
                quantity: parseInt(stockAdjustment.quantity),
                type: stockAdjustment.type
            });
            setScannedProduct(null);
            fetchProducts();
        } catch (error) {
            alert('Failed to update stock');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-title">Inventory</h1>
                    <p className="page-subtitle">Manage your products ({filteredProducts.length} of {products.length})</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn" style={{ background: '#f1f5f9' }} onClick={() => setShowScanner(true)}>
                        <ScanLine size={16} />
                        <span>Scan</span>
                    </button>
                    <button className="btn" style={{ background: '#f1f5f9' }} onClick={exportToCSV}>
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={16} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card mb-6">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className={`btn ${showFilters ? 'btn-primary' : ''}`}
                        style={!showFilters ? { background: '#f1f5f9' } : {}}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={16} />
                        Filters
                    </button>
                    {hasActiveFilters && (
                        <button className="btn text-muted" onClick={clearFilters}>
                            <RotateCcw size={16} />
                            Clear
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="flex gap-4 mt-4 pt-4 border-t">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-muted mb-1">Category</label>
                            <select
                                className="input"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-muted mb-1">Stock Status</label>
                            <select
                                className="input"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="in">In Stock</option>
                                <option value="low">Low Stock</option>
                                <option value="critical">Critical</option>
                                <option value="out">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="card p-0 overflow-hidden">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center text-muted">Loading...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="7" className="text-center text-muted">
                                {hasActiveFilters ? 'No products match your filters' : 'No products found'}
                            </td></tr>
                        ) : filteredProducts.map(product => (
                            <tr key={product._id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="product-thumbnail" />
                                        ) : (
                                            <div className="product-thumbnail-placeholder">
                                                <Image size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            {product.description && (
                                                <p className="text-xs text-muted truncate max-w-xs">{product.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="text-muted">{product.sku}</td>
                                <td>
                                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                        {product.category}
                                    </span>
                                </td>
                                <td>₹{product.price}</td>
                                <td className="font-medium">{product.quantity} {product.unit}</td>
                                <td>
                                    {product.quantity === 0 ? (
                                        <span className="badge badge-danger">Out of Stock</span>
                                    ) : product.quantity < 5 ? (
                                        <span className="badge badge-critical">Critical</span>
                                    ) : product.quantity < 10 ? (
                                        <span className="badge badge-warning">Low Stock</span>
                                    ) : (
                                        <span className="badge badge-success">In Stock</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-1">
                                        <button
                                            className="action-btn text-blue-600"
                                            onClick={() => openEditModal(product)}
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="action-btn text-red-500"
                                            onClick={() => handleDelete(product._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Product Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="image-preview" />
                                    ) : (
                                        <div className="image-preview-placeholder">
                                            <Image size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="input text-sm"
                                        />
                                        <p className="text-xs text-muted mt-1">Upload product image (optional)</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    name="description"
                                    className="input"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Product description (optional)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        className="input"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        className="input"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        className="input"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit</label>
                                    <select
                                        name="unit"
                                        className="input"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="g">Grams (g)</option>
                                        <option value="liters">Liters</option>
                                        <option value="ml">Milliliters (ml)</option>
                                        <option value="units">Units</option>
                                        <option value="boxes">Boxes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        className="input"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Reorder Level</label>
                                    <input
                                        type="number"
                                        name="reorderLevel"
                                        className="input"
                                        min="0"
                                        value={formData.reorderLevel}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn flex-1" style={{ background: '#f1f5f9' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                                    {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Barcode Scanner Modal */}
            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {/* Quick Stock Update Modal (after barcode scan) */}
            {scannedProduct && (
                <div className="modal-overlay" onClick={() => setScannedProduct(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg">Quick Stock Update</h2>
                            <button onClick={() => setScannedProduct(null)} className="text-muted">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="font-medium">{scannedProduct.name}</p>
                            <p className="text-sm text-muted">SKU: {scannedProduct.sku}</p>
                            <p className="text-sm mt-2">
                                Current Stock: <span className="font-semibold">{scannedProduct.quantity} {scannedProduct.unit}</span>
                            </p>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="stockType"
                                    checked={stockAdjustment.type === 'add'}
                                    onChange={() => setStockAdjustment(prev => ({ ...prev, type: 'add' }))}
                                />
                                <span className="text-sm">Add Stock</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="stockType"
                                    checked={stockAdjustment.type === 'remove'}
                                    onChange={() => setStockAdjustment(prev => ({ ...prev, type: 'remove' }))}
                                />
                                <span className="text-sm">Remove Stock</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <input
                                type="number"
                                className="input"
                                min="1"
                                value={stockAdjustment.quantity}
                                onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: e.target.value }))}
                                placeholder="Enter quantity"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setScannedProduct(null)} className="btn flex-1" style={{ background: '#f1f5f9' }}>
                                Cancel
                            </button>
                            <button onClick={handleQuickStockUpdate} className="btn btn-primary flex-1">
                                Update Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
