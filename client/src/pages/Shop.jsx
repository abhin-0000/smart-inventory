import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, X, Package } from 'lucide-react';

// Simple Cart Context
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product._id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product._id,
                name: product.name,
                price: product.price,
                maxStock: product.quantity,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.productId === productId
                ? { ...item, quantity: Math.min(quantity, item.maxStock) }
                : item
        ));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [ordering, setOrdering] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'address'
    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pinCode: ''
    });
    const [addressErrors, setAddressErrors] = useState({});
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data.filter(p => p.quantity > 0));
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
        if (addressErrors[name]) {
            setAddressErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateAddress = () => {
        const errors = {};
        if (!address.fullName.trim()) errors.fullName = 'Full name is required';
        if (!address.phone.trim()) errors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(address.phone.trim())) errors.phone = 'Enter a valid 10-digit phone number';
        if (!address.street.trim()) errors.street = 'Street address is required';
        if (!address.city.trim()) errors.city = 'City is required';
        if (!address.state.trim()) errors.state = 'State is required';
        if (!address.pinCode.trim()) errors.pinCode = 'PIN code is required';
        else if (!/^\d{6}$/.test(address.pinCode.trim())) errors.pinCode = 'Enter a valid 6-digit PIN code';
        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const placeOrder = async () => {
        if (!validateAddress()) return;
        if (cart.length === 0) return;

        const shippingAddress = `${address.fullName}, ${address.phone}, ${address.street}, ${address.city}, ${address.state} - ${address.pinCode}`;

        setOrdering(true);
        try {
            await axios.post('http://localhost:5000/api/orders', {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                shippingAddress
            });
            clearCart();
            setShowCart(false);
            setCheckoutStep('cart');
            setAddress({ fullName: '', phone: '', street: '', city: '', state: '', pinCode: '' });
            alert('Order placed successfully! Your order will be delivered to the provided address.');
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setOrdering(false);
        }
    };

    const handleCloseCart = () => {
        setShowCart(false);
        setCheckoutStep('cart');
        setAddressErrors({});
    };

    const filteredLimitedStock = products.filter(p => p.quantity > 0 && p.quantity < 10);

    const ProductCard = ({ product, showBadge = false }) => (
        <div key={product._id} className="card product-card">
            {product.image ? (
                <img src={product.image} alt={product.name} className="shop-product-image" />
            ) : (
                <div className="product-icon">
                    <Package size={32} />
                </div>
            )}
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{product.name}</h3>
                {showBadge && (
                    <span className="badge badge-limited">Only {product.quantity} left</span>
                )}
            </div>
            <p className="text-xs text-muted mb-1 text-left">{product.category}</p>
            {product.description && (
                <p className="text-xs text-muted mb-2 truncate text-left">{product.description}</p>
            )}
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">₹{product.price}</span>
                <span className="text-xs text-muted">{product.quantity} {product.unit} left</span>
            </div>
            <button
                className="btn btn-primary w-full mt-auto"
                onClick={() => addToCart(product)}
            >
                <Plus size={16} />
                Add to Cart
            </button>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-title">Shop</h1>
                    <p className="page-subtitle">Browse and order products</p>
                </div>
                <button
                    className="btn btn-primary relative"
                    onClick={() => setShowCart(true)}
                >
                    <ShoppingCart size={18} />
                    <span>Cart</span>
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount}</span>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="text-center text-muted py-12">Loading products...</div>
            ) : (
                <>
                    {/* Limited Stock Section */}
                    {filteredLimitedStock.length > 0 && (
                        <div className="limited-stock-section">
                            <h2 className="limited-stock-title">
                                <span role="img" aria-label="fire">🔥</span> Limited Stock Items
                            </h2>
                            <div className="limited-stock-grid">
                                {filteredLimitedStock.map(product => (
                                    <ProductCard key={product._id} product={product} showBadge={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Products Section */}
                    {products.length === 0 ? (
                        <div className="card text-center py-12">
                            <Package size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-muted">No products available</p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-lg mb-4">All Products</h2>
                            <div className="product-grid">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Cart Sidebar */}
            {showCart && (
                <div className="modal-overlay" onClick={handleCloseCart}>
                    <div className="cart-sidebar" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg">
                                {checkoutStep === 'cart' ? 'Your Cart' : '📦 Delivery Address'}
                            </h2>
                            <button onClick={handleCloseCart} className="text-muted">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        {cart.length > 0 && (
                            <div className="flex items-center gap-2 mb-5">
                                <span style={{
                                    padding: '3px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                    background: checkoutStep === 'cart' ? 'var(--primary)' : '#e2e8f0',
                                    color: checkoutStep === 'cart' ? '#fff' : '#64748b'
                                }}>1. Cart</span>
                                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                                <span style={{
                                    padding: '3px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                    background: checkoutStep === 'address' ? 'var(--primary)' : '#e2e8f0',
                                    color: checkoutStep === 'address' ? '#fff' : '#64748b'
                                }}>2. Address</span>
                            </div>
                        )}

                        {cart.length === 0 ? (
                            <div className="text-center text-muted py-8">
                                <ShoppingCart size={40} className="mx-auto mb-4 text-gray-300" />
                                <p>Your cart is empty</p>
                            </div>

                        ) : checkoutStep === 'cart' ? (
                            /* ── STEP 1: Cart Review ── */
                            <>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.productId} className="cart-item">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-muted">₹{item.price} each</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.maxStock}>
                                                    <Plus size={14} />
                                                </button>
                                                <button className="text-red-500 ml-2" onClick={() => removeFromCart(item.productId)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-footer">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-medium">Total</span>
                                        <span className="text-lg font-semibold">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button className="btn btn-primary w-full" onClick={() => setCheckoutStep('address')}>
                                        Proceed to Address →
                                    </button>
                                </div>
                            </>

                        ) : (
                            /* ── STEP 2: Delivery Address ── */
                            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 100px)' }}>
                                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
                                    {/* Mini order summary */}
                                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                                        <p style={{ fontWeight: 600, marginBottom: 2 }}>
                                            {cart.length} item(s) · <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toFixed(2)}</span>
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: 12 }}>
                                            {cart.map(i => i.name).join(', ').substring(0, 55)}{cart.map(i => i.name).join(', ').length > 55 ? '...' : ''}
                                        </p>
                                    </div>

                                    <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 13, color: '#374151' }}>Enter Delivery Details</p>

                                    {[
                                        { label: 'Full Name *', name: 'fullName', placeholder: 'e.g. Rahul Sharma', type: 'text' },
                                        { label: 'Phone Number *', name: 'phone', placeholder: '10-digit mobile number', type: 'tel' },
                                        { label: 'Street Address *', name: 'street', placeholder: 'House no., Building, Street', type: 'text' },
                                        { label: 'City *', name: 'city', placeholder: 'e.g. Mumbai', type: 'text' },
                                        { label: 'State *', name: 'state', placeholder: 'e.g. Maharashtra', type: 'text' },
                                        { label: 'PIN Code *', name: 'pinCode', placeholder: '6-digit PIN code', type: 'text' },
                                    ].map(field => (
                                        <div key={field.name} style={{ marginBottom: 13 }}>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: '#374151' }}>
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={address[field.name]}
                                                onChange={handleAddressChange}
                                                placeholder={field.placeholder}
                                                style={{
                                                    width: '100%', padding: '8px 12px', borderRadius: 8, boxSizing: 'border-box',
                                                    border: addressErrors[field.name] ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                                                    fontSize: 13, outline: 'none', background: '#fff'
                                                }}
                                            />
                                            {addressErrors[field.name] && (
                                                <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3 }}>{addressErrors[field.name]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ paddingTop: 14, borderTop: '1px solid #e2e8f0', marginTop: 8 }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium text-sm">Order Total</span>
                                        <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, background: '#f1f5f9', color: '#374151' }}
                                            onClick={() => { setCheckoutStep('cart'); setAddressErrors({}); }}
                                            disabled={ordering}
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 2 }}
                                            onClick={placeOrder}
                                            disabled={ordering}
                                        >
                                            {ordering ? 'Placing Order...' : '✓ Confirm Order'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
