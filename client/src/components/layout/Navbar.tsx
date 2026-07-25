import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE } from '@/lib/motion';
import { NAV_ITEMS } from '@/lib/site';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';
import { MagneticButton } from '@/components/ui/MagneticButton';

/**
 * Sticky glass navbar. Condenses on scroll and swaps to a full-screen
 * animated panel on mobile.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (latest) => setScrolled(latest > 24));

  // Lock body scroll while the mobile panel is open.
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

  const goPrimary = () => {
    setOpen(false);
    navigate(user ? dashboardPath : '/signup');
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <nav
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8',
            scrolled
              ? 'my-3 rounded-2xl border border-white/10 bg-base-900/70 py-2.5 shadow-glass backdrop-blur-xl sm:mx-6'
              : 'py-5'
          )}
        >
          <Logo withWordmark size={scrolled ? 24 : 28} />

          {/* Desktop links */}
          <div className="hidden items-center gap-9 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                data-active={location.pathname === item.to}
                className="link-underline text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!user && (
              <Link
                to="/login"
                className="hidden text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-white md:block"
              >
                Sign in
              </Link>
            )}
            <MagneticButton
              onClick={goPrimary}
              className="hidden px-5 py-2.5 text-sm md:inline-flex"
            >
              {user ? 'Dashboard' : 'Get started'}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-colors hover:bg-white/10 md:hidden"
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
            className="fixed inset-0 z-[60] flex flex-col bg-base-900/95 px-6 py-5 backdrop-blur-2xl md:hidden"
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: EASE }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-display text-4xl font-medium tracking-tight text-white/90"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + NAV_ITEMS.length * 0.06, duration: 0.6, ease: EASE }}
              className="flex flex-col gap-3 pb-6"
            >
              <MagneticButton onClick={goPrimary} className="w-full">
                {user ? 'Go to dashboard' : 'Get started'}
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-medium text-gray-400 transition-colors hover:text-white"
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
