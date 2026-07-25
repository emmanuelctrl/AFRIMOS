import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LOGO_PATH =
  'M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg viewBox="0 0 256 256" width="26" height="26" fill="white" aria-hidden="true">
        <path d={LOGO_PATH} />
      </svg>
      <span className="text-lg font-bold tracking-tight text-white">AFRIMOS</span>
    </Link>
  );
}

/* Fixed dark backdrop with crimson glows that the glass surfaces refract against */
function BackgroundMesh() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-600/25 blur-3xl" />
      <div className="absolute -right-48 top-1/4 h-[34rem] w-[34rem] rounded-full bg-brand-800/30 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-1/4 h-[26rem] w-[26rem] rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/dashboard/supplier' : '/dashboard/buyer';

  const navLink = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-brand-400' : 'text-gray-200 hover:text-white'
    }`;

  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundMesh />

      <header
        className={`sticky top-0 z-20 border-b transition-all duration-200 ${
          scrolled
            ? 'border-white/10 bg-white/10 shadow-glass backdrop-blur-md sm:backdrop-blur-lg'
            : 'border-white/10 bg-white/5 backdrop-blur-sm sm:backdrop-blur-md'
        }`}
      >
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
            className="rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {open && (
          <nav className="space-y-1 border-t border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md md:hidden">
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
                className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-100 transition-colors duration-150 hover:bg-white/10"
              >
                {label}
              </Link>
            ))}
            {user && (
              <button
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-300 transition-colors duration-150 hover:bg-white/10"
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

      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm sm:backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div>
              <Logo />
              <p className="mt-2 max-w-xs text-sm text-gray-300">
                Connecting African commodity exporters with international buyers. No middlemen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold text-white">Platform</p>
                <ul className="mt-2 space-y-1 text-gray-300">
                  <li><Link to="/suppliers" className="hover:text-white">Supplier directory</Link></li>
                  <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link to="/signup" className="hover:text-white">Become a supplier</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Company</p>
                <ul className="mt-2 space-y-1 text-gray-300">
                  <li><Link to="/about" className="hover:text-white">About us</Link></li>
                  <li><a href="mailto:admin@afrimos.et" className="hover:text-white">Contact</a></li>
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
