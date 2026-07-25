import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteFallback from './components/RouteFallback';

// The marketing experience is the entry point, so it ships in the main chunk.
import Landing from './pages/Landing';

// Everything behind the marketing page is code-split: visitors who only see
// the landing page never download the app shell, dashboards or charts.
const Layout = lazy(() => import('./components/Layout'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

const SuppliersDirectory = lazy(() => import('./pages/SuppliersDirectory'));
const SupplierDetail = lazy(() => import('./pages/SupplierDetail'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AccountStatus = lazy(() => import('./pages/AccountStatus'));
const NotFound = lazy(() => import('./pages/NotFound'));

const SupplierDashboard = lazy(() => import('./pages/supplier/SupplierDashboard'));
const SupplierProfile = lazy(() => import('./pages/supplier/SupplierProfile'));
const SupplierProducts = lazy(() => import('./pages/supplier/SupplierProducts'));
const SupplierAnalytics = lazy(() => import('./pages/supplier/SupplierAnalytics'));

const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const CreateRfq = lazy(() => import('./pages/buyer/CreateRfq'));

const RfqList = lazy(() => import('./pages/shared/RfqList'));
const RfqDetail = lazy(() => import('./pages/shared/RfqDetail'));
const Messages = lazy(() => import('./pages/shared/Messages'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSuppliers = lazy(() => import('./pages/admin/AdminSuppliers'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Marketing experience — rendered standalone, no shared chrome */}
            <Route path="/" element={<Landing />} />

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

              {/* Admin (password-only login) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']} loginPath="/admin/login">
                    <DashboardLayout role="admin" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="/dashboard" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
