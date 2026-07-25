import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

// `approved` gates a route to accounts an admin has verified (admins always
// pass). Rejected accounts are locked out of every protected route.
export default function ProtectedRoute({ roles, approved = false, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (user.verificationStatus === 'rejected') return <Navigate to="/account-status" replace />;

  if (approved && user.role !== 'admin' && user.verificationStatus !== 'verified') {
    return <Navigate to="/account-status" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'admin' ? '/admin' : user.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';
    return <Navigate to={home} replace />;
  }
  return children;
}
