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
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data.filter(p => p.quantity > 0)); // Only show in-stock products
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;

        setOrdering(true);
        try {
            await axios.post('http://localhost:5000/api/orders', {
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            });
            clearCart();
            setShowCart(false);
            alert('Order placed successfully!');
            fetchProducts(); // Refresh to update stock
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order');
        } finally {
            setOrdering(false);
        }
    };

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
            ) : products.length === 0 ? (
                <div className="card text-center py-12">
                    <Package size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-muted">No products available</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product._id} className="card product-card">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="shop-product-image" />
                            ) : (
                                <div className="product-icon">
                                    <Package size={32} />
                                </div>
                            )}
                            <h3 className="font-medium mb-1">{product.name}</h3>
                            <p className="text-xs text-muted mb-1">{product.category}</p>
                            {product.description && (
                                <p className="text-xs text-muted mb-2 truncate">{product.description}</p>
                            )}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-semibold">${product.price}</span>
                                <span className="text-xs text-muted">{product.quantity} {product.unit} left</span>
                            </div>
                            <button
                                className="btn btn-primary w-full"
                                onClick={() => addToCart(product)}
                            >
                                <Plus size={16} />
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Cart Sidebar */}
            {showCart && (
                <div className="modal-overlay" onClick={() => setShowCart(false)}>
                    <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg">Your Cart</h2>
                            <button onClick={() => setShowCart(false)} className="text-muted">
                                <X size={20} />
                            </button>
                        </div>

                        {cart.length === 0 ? (
                            <div className="text-center text-muted py-8">
                                <ShoppingCart size={40} className="mx-auto mb-4 text-gray-300" />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.productId} className="cart-item">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-muted">${item.price} each</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.maxStock}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    className="text-red-500 ml-2"
                                                    onClick={() => removeFromCart(item.productId)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="cart-footer">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-medium">Total</span>
                                        <span className="text-lg font-semibold">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={placeOrder}
                                        disabled={ordering}
                                    >
                                        {ordering ? 'Placing Order...' : 'Place Order'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
