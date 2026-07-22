import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import Sales from './pages/Sales';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/products/new" element={<ProtectedRoute roles={['SELLER']}><ProductForm /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/products/:id/edit" element={<ProtectedRoute roles={['SELLER']}><ProductForm /></ProtectedRoute>} />

        <Route path="/orders" element={<ProtectedRoute roles={['USER']}><Orders /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute roles={['SELLER']}><Sales /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute roles={['SELLER']}><Users /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute roles={['SELLER']}><UserDetail /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
}
