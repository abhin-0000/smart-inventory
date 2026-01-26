import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { ShoppingBag, ClipboardList, LogOut } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const CustomerLayout = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <div className="layout">
            <div className="sidebar">
                <div className="px-4 mb-8">
                    <h1 className="text-lg text-primary">SmartInv</h1>
                    <p className="text-xs text-muted">Shop</p>
                </div>

                <nav className="flex-1">
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

                <div className="border-t pt-4 mt-auto">
                    <div className="flex items-center gap-3 px-4 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted">Customer</p>
                        </div>
                    </div>
                    <button onClick={logout} className="nav-item w-full text-danger">
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
