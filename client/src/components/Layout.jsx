import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
        A
      </span>
      <span className="text-lg font-bold tracking-tight text-gray-900">AFRIMOS</span>
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';

  const navLink = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'}`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 md:flex">
              <NavLink to="/suppliers" className={navLink}>
                Find Suppliers
              </NavLink>
              <NavLink to="/pricing" className={navLink}>
                Pricing
              </NavLink>
              <NavLink to="/about" className={navLink}>
                About
              </NavLink>
            </nav>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn-secondary">
                  Dashboard
                </Link>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
          <button
            className="rounded-lg border border-gray-300 p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {open && (
          <nav className="space-y-1 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
            {[
              ['/suppliers', 'Find Suppliers'],
              ['/pricing', 'Pricing'],
              ['/about', 'About'],
              ...(user ? [[dashboardPath, 'Dashboard']] : [['/login', 'Log in'], ['/signup', 'Sign up']]),
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {label}
              </Link>
            ))}
            {user && (
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-gray-50"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                  navigate('/');
                }}
              >
                Log out
              </button>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div>
              <Logo />
              <p className="mt-2 max-w-xs text-sm text-gray-500">
                Connecting African commodity exporters with international buyers. No middlemen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold text-gray-900">Platform</p>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><Link to="/suppliers" className="hover:text-gray-900">Supplier directory</Link></li>
                  <li><Link to="/pricing" className="hover:text-gray-900">Pricing</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900">Become a supplier</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Company</p>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><Link to="/about" className="hover:text-gray-900">About us</Link></li>
                  <li><a href="mailto:admin@afrimos.et" className="hover:text-gray-900">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-gray-400">
            © {new Date().getFullYear()} AFRIMOS · Addis Ababa, Ethiopia
          </p>
        </div>
      </footer>
    </div>
  );
}
