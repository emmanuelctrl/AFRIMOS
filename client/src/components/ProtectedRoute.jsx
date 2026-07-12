import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'admin' ? '/admin' : user.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';
    return <Navigate to={home} replace />;
  }
  return children;
}
