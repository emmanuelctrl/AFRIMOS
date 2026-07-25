import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import SuppliersDirectory from './pages/SuppliersDirectory';
import SupplierDetail from './pages/SupplierDetail';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import AccountStatus from './pages/AccountStatus';
import NotFound from './pages/NotFound';

import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProfile from './pages/supplier/SupplierProfile';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierAnalytics from './pages/supplier/SupplierAnalytics';

import BuyerDashboard from './pages/buyer/BuyerDashboard';
import CreateRfq from './pages/buyer/CreateRfq';

import RfqList from './pages/shared/RfqList';
import RfqDetail from './pages/shared/RfqDetail';
import Messages from './pages/shared/Messages';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Fullscreen landing hero — rendered standalone, no shared chrome */}
          <Route path="/" element={<Home />} />

          <Route element={<Layout />}>
            {/* Marketplace data — real info, approved accounts only */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute approved>
                  <SuppliersDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/:id"
              element={
                <ProtectedRoute approved>
                  <SupplierDetail />
                </ProtectedRoute>
              }
            />

            {/* Public */}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/account-status" element={<AccountStatus />} />

            {/* Supplier dashboard */}
            <Route
              path="/dashboard/supplier"
              element={
                <ProtectedRoute roles={['supplier']}>
                  <DashboardLayout role="supplier" />
                </ProtectedRoute>
              }
            >
              <Route index element={<SupplierDashboard />} />
              <Route path="profile" element={<SupplierProfile />} />
              <Route path="products" element={<SupplierProducts />} />
              <Route path="rfqs" element={<RfqList base="/dashboard/supplier/rfqs" />} />
              <Route path="rfqs/:rfqId" element={<RfqDetail />} />
              <Route path="messages" element={<Messages base="/dashboard/supplier/rfqs" />} />
              <Route path="analytics" element={<SupplierAnalytics />} />
            </Route>

            {/* Buyer dashboard */}
            <Route
              path="/dashboard/buyer"
              element={
                <ProtectedRoute roles={['buyer']} approved>
                  <DashboardLayout role="buyer" />
                </ProtectedRoute>
              }
            >
              <Route index element={<BuyerDashboard />} />
              <Route path="search" element={<SuppliersDirectory />} />
              <Route path="rfqs" element={<RfqList base="/dashboard/buyer/rfqs" />} />
              <Route path="rfqs/new" element={<CreateRfq />} />
              <Route path="rfqs/:rfqId" element={<RfqDetail />} />
              <Route path="messages" element={<Messages base="/dashboard/buyer/rfqs" />} />
            </Route>

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout role="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="suppliers" element={<AdminSuppliers />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
