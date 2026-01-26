import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, TrendingUp, LogOut, ClipboardList } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);

    const links = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Inventory', path: '/inventory', icon: <Package size={18} /> },
        { name: 'Orders', path: '/orders', icon: <ClipboardList size={18} /> },
    ];

    if (user?.role === 'admin') {
        links.push({ name: 'AI Insights', path: '/ai-insights', icon: <TrendingUp size={18} /> });
    }

    return (
        <div className="sidebar">
            <div className="px-4 mb-8">
                <h1 className="text-lg text-primary">SmartInv</h1>
                <p className="text-xs text-muted">Admin</p>
            </div>

            <nav className="flex-1">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {link.icon}
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="border-t pt-4 mt-auto">
                <div className="flex items-center gap-3 px-4 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted">{user?.role}</p>
                    </div>
                </div>
                <button onClick={logout} className="nav-item w-full text-danger">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
