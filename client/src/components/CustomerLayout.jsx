import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { ShoppingBag, ClipboardList, LogOut } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const CustomerLayout = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <div className="layout">
            <div
                className="sidebar"
                style={{ height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}
            >
                <div className="px-4 mb-8">
                    <h1 className="text-lg text-primary">SmartInv</h1>
                    <p className="text-xs text-muted">Customer Portal</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <NavLink
                        to="/shop"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <ShoppingBag size={18} />
                        <span>Shop</span>
                    </NavLink>
                    <NavLink
                        to="/my-orders"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <ClipboardList size={18} />
                        <span>My Orders</span>
                    </NavLink>
                </nav>

                {/* User info + Logout — always pinned to bottom */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div className="flex items-center gap-3 px-4 mb-4">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                            style={{ background: '#dbeafe', color: '#2563eb' }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted">Customer</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="nav-item w-full text-danger"
                        style={{ background: 'transparent' }}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default CustomerLayout;
