import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GitHubIcon, LinkedInIcon, XIcon } from '@/components/ui/BrandIcons';

const LINK_GROUPS = [
  {
    title: 'Platform',
    links: [
      { label: 'Suppliers', to: '/suppliers' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Become a supplier', to: '/signup?role=supplier' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/about' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/signup' },
    ],
  },
];

const SOCIALS = [
  { icon: XIcon, label: 'X', href: 'https://x.com' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: GitHubIcon, label: 'GitHub', href: 'https://github.com' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <footer className="relative border-t border-espresso-900/10 bg-base-900">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Brand + newsletter */}
          <div className="max-w-md">
            <Logo withWordmark />
            <p className="mt-4 text-sm leading-relaxed text-espresso-600">
              The intelligent trade marketplace connecting verified African commodity exporters with
              international buyers.
            </p>

            <form onSubmit={onSubmit} className="mt-7">
              <label htmlFor="newsletter" className="text-xs font-medium uppercase tracking-[0.18em] text-espresso-500">
                Market briefing
              </label>
              <div className="mt-3 flex gap-2">
                <input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-full border border-espresso-900/15 bg-white/55 px-4 py-2.5 text-sm text-espresso-900 transition-all duration-300 placeholder:text-espresso-500 focus:border-electric-300/60 focus:outline-none focus:ring-2 focus:ring-electric-300/25"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Subscribe"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-base-600"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-electric-500"
                >
                  Thanks — you're on the list.
                </motion.p>
              )}
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-espresso-900">{group.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="link-underline text-sm text-espresso-600 transition-colors duration-300 hover:text-espresso-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact strip */}
        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-espresso-900/10 pt-8 text-sm text-espresso-600">
          <a
            href="mailto:admin@afrimos.et"
            className="flex items-center gap-2 transition-colors hover:text-espresso-900"
          >
            <Mail className="h-4 w-4 text-electric-500" />
            admin@afrimos.et
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-electric-500" />
            Addis Ababa, Ethiopia
          </span>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-espresso-900/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-espresso-500">
            © {new Date().getFullYear()} AFRIMOS. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <StatusBadge />
            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    whileHover={{ y: -3, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso-900/10 bg-white/55 text-espresso-600 transition-colors hover:border-electric-300/40 hover:text-espresso-900"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
