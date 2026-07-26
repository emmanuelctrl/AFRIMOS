import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';
import { NAV_ITEMS } from '@/lib/site';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

/**
 * Navigation modelled on the reference: a pill group of links on the left, the
 * brand badge centred, and two action buttons on the right.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'supplier'
        ? '/dashboard/supplier'
        : '/dashboard/buyer';

  const links = [{ label: 'Home', to: '/' }, ...NAV_ITEMS];

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
      >
        <nav className="relative mx-auto flex max-w-[110rem] items-center justify-between">
          {/* Left: link pill group */}
          <div className="hidden items-center gap-1 rounded-full border border-cream-200/10 bg-base-900/70 p-1.5 backdrop-blur-xl lg:flex">
            {links.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'rounded-full px-5 py-2 text-xs font-semibold transition-colors duration-300',
                    active
                      ? 'bg-electric-500 text-cream-50 shadow-glow-blue'
                      : 'text-gray-400 hover:text-cream-100'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Centre: brand badge */}
          <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-cream-300/40 bg-cream-50 px-5 py-2.5 shadow-glass">
              <Logo size={24} />
              <span className="leading-none">
                <span className="block font-display text-base font-bold tracking-tight text-base-900">
                  AFRIMOS
                </span>
                <span className="block text-[0.55rem] font-semibold tracking-[0.28em] text-base-900/60">
                  EXPORTS
                </span>
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2.5">
            <Link
              to={user ? dashboardPath : '/login'}
              className="group hidden items-center gap-2 rounded-full bg-cream-100 px-5 py-2.5 text-xs font-semibold text-base-900 transition-transform duration-300 hover:scale-[1.03] sm:flex"
            >
              {user ? 'Dashboard' : 'Track inquiry'}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-base-900 text-cream-50">
                <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => navigate(user ? dashboardPath : '/signup')}
              className="group hidden items-center gap-2 rounded-full bg-electric-500 px-5 py-2.5 text-xs font-semibold text-cream-50 shadow-glow-blue transition-all duration-300 hover:bg-electric-400 hover:text-base-900 sm:flex"
            >
              Get in touch with us
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cream-50/25">
                <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </button>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-200/10 bg-base-900/70 text-cream-50 backdrop-blur-xl transition-colors hover:bg-cream-100/10 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-base-900/95 px-6 py-5 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo withWordmark />
              <motion.button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-200/10 bg-cream-100/[0.06] text-cream-50"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-2">
              {links.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: EASE }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-display text-4xl font-medium tracking-tight text-cream-50"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + links.length * 0.06, duration: 0.6, ease: EASE }}
              className="flex flex-col gap-3 pb-6"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(user ? dashboardPath : '/signup');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-electric-500 px-6 py-3.5 text-sm font-semibold text-cream-50"
              >
                {user ? 'Go to dashboard' : 'Get in touch with us'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-medium text-gray-400 transition-colors hover:text-cream-100"
                >
                  Already have an account? Sign in
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
