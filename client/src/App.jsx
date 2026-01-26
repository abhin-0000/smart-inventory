import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';
import CustomerLayout from './components/CustomerLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AIInsights from './pages/AIInsights';
import AdminOrders from './pages/AdminOrders';
import Shop, { CartProvider } from './pages/Shop';
import CustomerOrders from './pages/CustomerOrders';

// Protected Route Wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/shop" />;
  return children;
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/" element={
        <ProtectedRoute adminOnly>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="ai-insights" element={<AIInsights />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/shop" element={
        <ProtectedRoute>
          <CartProvider>
            <CustomerLayout />
          </CartProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Shop />} />
      </Route>

      <Route path="/my-orders" element={
        <ProtectedRoute>
          <CartProvider>
            <CustomerLayout />
          </CartProvider>
        </ProtectedRoute>
      }>
        <Route index element={<CustomerOrders />} />
      </Route>

      {/* Redirect based on role */}
      <Route path="*" element={
        user?.role === 'admin' ? <Navigate to="/" /> : <Navigate to="/shop" />
      } />
    </Routes>
  );
};

export default App;
