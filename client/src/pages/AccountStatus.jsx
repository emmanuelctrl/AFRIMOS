import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Shown to logged-in accounts that are not yet approved (pending) or have been
// rejected. Verified accounts are bounced to their dashboard.
export default function AccountStatus() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const dashboardPath =
    user.role === 'admin' ? '/admin' : user.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';

  if (user.verificationStatus === 'verified' || user.role === 'admin') {
    return <Navigate to={dashboardPath} replace />;
  }

  const rejected = user.verificationStatus === 'rejected';

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="card text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            rejected ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {rejected ? (
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          {rejected ? 'Account not approved' : 'Your account is under review'}
        </h1>

        <p className="mt-3 text-gray-300">
          {rejected ? (
            <>
              Your account was not approved for access to the marketplace. If you believe this is a
              mistake, contact{' '}
              <a href="mailto:admin@afrimos.et" className="font-medium text-brand-400 underline">
                admin@afrimos.et
              </a>
              .
            </>
          ) : (
            <>
              Thanks for signing up, {user.fullName?.split(' ')[0] || 'there'}. An administrator needs
              to approve your account before you can browse suppliers or send inquiries. We&apos;ll
              email you as soon as it&apos;s ready.
            </>
          )}
        </p>

        {!rejected && user.role === 'supplier' && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 backdrop-blur-sm">
            In the meantime you can finish setting up your company profile and product catalogue so
            you&apos;re ready to trade the moment you&apos;re approved.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!rejected && user.role === 'supplier' && (
            <Link to="/dashboard/supplier/profile" className="btn-primary">
              Complete my profile
            </Link>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
