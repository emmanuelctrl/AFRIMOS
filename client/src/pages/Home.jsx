import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';

/* ---- Assets (exact) --------------------------------------------------- */
const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85';
const FRONT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4';
const OVERLAY_IMAGE =
  'https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png';

const LOGO_PATH =
  'M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z';

const NAV_ITEMS = [
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

const EASE = 'cubic-bezier(0.77, 0, 0.18, 1)';
const SPOTLIGHT_RADIUS = 260;

/* ---- Landing data (marketing figures) --------------------------------- */
const STATS = [
  { value: '500+', label: 'Verified exporters' },
  { value: '203', label: 'Buyer countries' },
  { value: '6', label: 'Commodity categories' },
  { value: '1,200+', label: 'RFQs matched' },
];

const FEATURES = [
  {
    title: 'Verified exporters only',
    body: 'Every supplier is manually vetted before appearing in the directory — trade with confidence.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Structured RFQs',
    body: 'Buyers send clear requests with quantity, specs and delivery dates. Suppliers respond in one place.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Direct messaging',
    body: 'Negotiate inside each inquiry thread — no brokers, no lost emails, no missed opportunities.',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
];

const SAMPLE_ROWS = [
  { company: 'Yirgacheffe Coffee Exporters', product: 'Yirgacheffe Grade 1', category: 'Coffee', origin: 'Yirgacheffe', moq: '500 kg' },
  { company: 'Humera Sesame Trading', product: 'Whitish Sesame Seeds', category: 'Sesame', origin: 'Humera', moq: '19 MT' },
  { company: 'Rift Valley Pulses', product: 'Desi Chickpeas', category: 'Pulses', origin: 'Shewa', moq: '25 MT' },
  { company: 'Rift Valley Pulses', product: 'Korarima (Cardamom)', category: 'Spices', origin: 'Kaffa', moq: '100 kg' },
  { company: 'Humera Sesame Trading', product: 'Niger Seed (Noug)', category: 'Oilseeds', origin: 'Wollega', moq: '20 MT' },
];

const CATEGORY_DATA = [
  { name: 'Coffee', inquiries: 320 },
  { name: 'Sesame', inquiries: 210 },
  { name: 'Pulses', inquiries: 175 },
  { name: 'Oilseeds', inquiries: 140 },
  { name: 'Spices', inquiries: 95 },
  { name: 'Fruits', inquiries: 60 },
];

const CATEGORIES = [
  { name: 'Coffee', count: '180+ listings' },
  { name: 'Sesame', count: '90+ listings' },
  { name: 'Pulses', count: '120+ listings' },
  { name: 'Oilseeds', count: '70+ listings' },
  { name: 'Spices', count: '85+ listings' },
  { name: 'Fruits', count: '40+ listings' },
];

const TESTIMONIALS = [
  {
    quote:
      'In our first quarter on AFRIMOS we received inquiries from three new markets we had never reached before.',
    name: 'Abebe Bekele',
    role: 'Yirgacheffe Coffee Exporters',
  },
  {
    quote:
      'Verification status and product specs are upfront. Vetting suppliers now takes minutes, not weeks.',
    name: 'Hans Mueller',
    role: 'Commodity importer, Hamburg',
  },
  {
    quote:
      'Every RFQ arrives with quantity, delivery date and terms already spelled out. We respond in minutes.',
    name: 'Selam Tesfaye',
    role: 'Humera Sesame Trading',
  },
];

const TOOLTIP_STYLE = {
  background: '#101012',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  color: '#e5e7eb',
};

function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 256 256" width="28" height="28" fill="white" className={className} aria-hidden="true">
      <path d={LOGO_PATH} />
    </svg>
  );
}

function Eyebrow({ children }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">{children}</p>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuShown, setMenuShown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const gridRef = useRef(null);

  // Cursor target + smoothed positions (kept in refs so the rAF loop never
  // triggers React re-renders).
  const target = useRef({ x: -9999, y: -9999 });
  const smooth = useRef({ x: -9999, y: -9999 });
  const gridTarget = useRef({ x: 0, y: 0 });
  const gridSmooth = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'supplier'
        ? '/dashboard/supplier'
        : '/dashboard/buyer';

  const goReserve = () => {
    setMenuOpen(false);
    navigate(user ? dashboardPath : '/signup');
  };

  /* -- Spotlight mask + grid parallax loop ----------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');

    const sizeCanvas = () => {
      const r = section.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width));
      canvas.height = Math.max(1, Math.round(r.height));
      drawSpotlight(smooth.current.x, smooth.current.y);
    };

    const drawSpotlight = (x, y) => {
      const mask = maskRef.current;
      if (!mask) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Only paint the reveal once the cursor is actually inside the section;
      // an empty (transparent) mask keeps the video fully hidden.
      if (x > -9000) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, SPOTLIGHT_RADIUS);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.4, 'rgba(255,255,255,1)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.75)');
        g.addColorStop(0.75, 'rgba(255,255,255,0.4)');
        g.addColorStop(0.88, 'rgba(255,255,255,0.12)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(
          x - SPOTLIGHT_RADIUS,
          y - SPOTLIGHT_RADIUS,
          SPOTLIGHT_RADIUS * 2,
          SPOTLIGHT_RADIUS * 2
        );
      }
      const url = canvas.toDataURL();
      mask.style.webkitMaskImage = `url(${url})`;
      mask.style.maskImage = `url(${url})`;
    };

    const tick = () => {
      // Spotlight cursor: lerp toward the target at 0.1.
      smooth.current.x += (target.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (target.current.y - smooth.current.y) * 0.1;
      // Grid parallax: gentler 0.06 lerp toward an offset from the centre.
      gridSmooth.current.x += (gridTarget.current.x - gridSmooth.current.x) * 0.06;
      gridSmooth.current.y += (gridTarget.current.y - gridSmooth.current.y) * 0.06;
      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${gridSmooth.current.x}px, ${gridSmooth.current.y}px, 0)`;
      }
      drawSpotlight(smooth.current.x, smooth.current.y);

      const settled =
        Math.abs(target.current.x - smooth.current.x) < 0.1 &&
        Math.abs(target.current.y - smooth.current.y) < 0.1 &&
        Math.abs(gridTarget.current.x - gridSmooth.current.x) < 0.1 &&
        Math.abs(gridTarget.current.y - gridSmooth.current.y) < 0.1;
      rafRef.current = settled ? 0 : requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      target.current = { x, y };
      // Offset from the centre, normalised to [-1, 1], scaled to ±16px.
      gridTarget.current = {
        x: (x / r.width - 0.5) * 2 * 16,
        y: (y / r.height - 0.5) * 2 * 16,
      };
      kick();
    };

    const onLeave = () => {
      target.current = { x: -9999, y: -9999 };
      gridTarget.current = { x: 0, y: 0 };
      kick();
    };

    sizeCanvas();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', sizeCanvas);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', sizeCanvas);
      document.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* -- Solidify the nav once the hero scrolls away --------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* -- Mobile menu: lock body scroll + drive the entry animation ------- */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      const id = requestAnimationFrame(() => setMenuShown(true));
      return () => cancelAnimationFrame(id);
    }
    document.body.style.overflow = '';
    setMenuShown(false);
    return undefined;
  }, [menuOpen]);

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  return (
    <div className="bg-ink-900 text-gray-200">
      {/* ---- Fixed navigation (z-50) ---------------------------------- */}
      <nav className="fixed inset-x-0 top-0 z-50">
        <div
          className={`relative flex items-center justify-between px-5 py-4 transition-colors duration-300 sm:px-8 ${
            scrolled ? 'border-b border-white/10 bg-ink-900/80 backdrop-blur-md' : ''
          }`}
        >
          <Link to="/" aria-label="AFRIMOS home" className="relative z-10">
            <Logo />
          </Link>

          {/* Desktop centre pill */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="liquid-glass pointer-events-auto flex items-center gap-1 rounded-full p-1.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!user && (
              <Link
                to="/login"
                className="hidden text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white md:block"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={goReserve}
              className="liquid-glass hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white md:flex"
            >
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {user ? 'Enter' : 'Get started'}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="liquid-glass flex flex-col items-center justify-center gap-1.5 rounded-full px-4 py-3 md:hidden"
            >
              <span className="h-[1.5px] w-5 bg-white" />
              <span className="h-[1.5px] w-3.5 bg-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Mobile fullscreen menu (z-55) ---------------------------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-[55] flex flex-col bg-[#0a0a0a] px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="liquid-glass relative flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                transform: menuShown ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.8)',
                opacity: menuShown ? 1 : 0,
                transition: `transform 0.5s ${EASE}, opacity 0.4s ease`,
              }}
            >
              <span className="absolute h-[1.5px] w-5 rotate-45 bg-white" />
              <span className="absolute h-[1.5px] w-5 -rotate-45 bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-medium text-white/90 sm:text-4xl"
                style={{
                  transform: menuShown ? 'translateY(0)' : 'translateY(24px)',
                  opacity: menuShown ? 1 : 0,
                  transition: `transform 0.6s ${EASE}, opacity 0.6s ${EASE}`,
                  transitionDelay: `${100 + i * 60}ms`,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div
            className="flex flex-col items-center gap-4 pb-6"
            style={{
              transform: menuShown ? 'translateY(0)' : 'translateY(24px)',
              opacity: menuShown ? 1 : 0,
              transition: `transform 0.6s ${EASE}, opacity 0.6s ${EASE}`,
              transitionDelay: `${100 + NAV_ITEMS.length * 60}ms`,
            }}
          >
            <button
              type="button"
              onClick={goReserve}
              className="liquid-glass flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium text-white"
            >
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {user ? 'Enter' : 'Get started'}
            </button>
            {!user && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-white/50 transition-colors hover:text-white/80"
              >
                Already have an account? Sign in
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ---- Hero section (100vh) ------------------------------------- */}
      <section
        ref={sectionRef}
        className="font-helvetica-neue relative h-screen w-full overflow-hidden bg-[#0a0a0a]"
      >
        {/* Layer 1 — grid background (z-0) */}
        <div className="absolute inset-0 z-0" style={{ opacity: 0.1 }}>
          <div ref={gridRef} className="absolute -inset-6" style={{ willChange: 'transform' }}>
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="afrimos-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#afrimos-grid)" />
            </svg>
          </div>
        </div>

        {/* Layer 2 — background image (z-10) */}
        <div
          className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
        />

        {/* Layer 3 — hero text (z-20) */}
        <div className="absolute inset-x-0 top-20 z-20 flex justify-center px-4 sm:top-28 md:top-32">
          <h1
            className="select-none text-center text-[4.5rem] uppercase leading-[0.9] text-white xs:text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            AFRIMOS
          </h1>
        </div>

        {/* Layer 4 — overlay image (z-25) */}
        <img
          src={OVERLAY_IMAGE}
          alt=""
          aria-hidden="true"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover"
        />

        {/* Layer 5 — spotlight reveal (z-30): masked video */}
        <div
          ref={maskRef}
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskPosition: '0 0',
            maskPosition: '0 0',
          }}
        >
          <video
            src={FRONT_VIDEO}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: 'inset(40% 0 0 0)' }}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        {/* Off-screen canvas that generates the mask */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
            Scroll to explore
          </span>
        </div>
      </section>

      {/* ---- Stat band ----------------------------------------------- */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-10 text-center">
              <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Features ------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>Why AFRIMOS</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trade intelligence for African commodities
          </h2>
          <p className="mt-4 text-gray-400">
            The direct line between vetted African exporters and international buyers — structured,
            transparent, and broker-free.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-brand-500/15 text-brand-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Live data preview (table + chart) ----------------------- */}
      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>Live marketplace</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Real suppliers, structured data
            </h2>
            <p className="mt-4 text-gray-400">
              Every listing is normalised into the same fields, so buyers can compare offers and send
              a structured RFQ in seconds.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* Table */}
            <div className="card overflow-hidden p-0 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h3 className="text-sm font-semibold text-white">Recent listings</h3>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Live
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="thead-glass">
                    <tr>
                      <th className="px-5 py-3 font-medium">Supplier</th>
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Origin</th>
                      <th className="px-5 py-3 font-medium">MOQ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {SAMPLE_ROWS.map((r, i) => (
                      <tr key={i} className="row-hover">
                        <td className="px-5 py-3 font-medium text-white">{r.company}</td>
                        <td className="px-5 py-3 text-gray-300">{r.product}</td>
                        <td className="px-5 py-3">
                          <span className="chip">{r.category}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-400">{r.origin}</td>
                        <td className="px-5 py-3 text-gray-300">{r.moq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white">Buyer inquiries by category</h3>
              <p className="mb-4 text-xs text-gray-400">Last 90 days</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={64}
                      tick={{ fontSize: 11, fill: '#a1a1aa' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#e5e7eb' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="inquiries" name="Inquiries" fill="#e11d3a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Category coverage --------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>Coverage</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Six commodity categories
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/suppliers"
              className="card card-hover text-center"
            >
              <p className="font-semibold text-white">{c.name}</p>
              <p className="mt-1 text-xs text-gray-400">{c.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Testimonials -------------------------------------------- */}
      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>Trusted by traders</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Exporters and buyers, in their words
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="card flex flex-col">
                <p className="flex-1 text-sm italic text-gray-300">“{t.quote}”</p>
                <footer className="mt-4">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ------------------------------------------------------ */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-80 w-[40rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to trade directly?
          </h2>
          <p className="mt-4 text-gray-400">
            Join the marketplace built for African commodity exports — no middlemen, no commission.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={goReserve} className="btn-primary px-6 py-3 text-base">
              {user ? 'Go to dashboard' : 'Get started free'}
            </button>
            <Link to="/pricing" className="btn-secondary px-6 py-3 text-base">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Footer -------------------------------------------------- */}
      <footer className="border-t border-white/10 bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-xs">
              <Link to="/" className="flex items-center gap-2">
                <Logo />
                <span className="text-lg font-bold tracking-tight text-white">AFRIMOS</span>
              </Link>
              <p className="mt-3 text-sm text-gray-400">
                Connecting African commodity exporters with international buyers. No middlemen.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              <div>
                <p className="font-semibold text-white">Platform</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li><Link to="/suppliers" className="hover:text-white">Suppliers</Link></li>
                  <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link to="/signup" className="hover:text-white">Become a supplier</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Company</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li><Link to="/about" className="hover:text-white">About</Link></li>
                  <li><a href="mailto:admin@afrimos.et" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Account</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
                  <li><Link to="/signup" className="hover:text-white">Create account</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 text-xs text-gray-500">
            © {new Date().getFullYear()} AFRIMOS · Addis Ababa, Ethiopia
          </p>
        </div>
      </footer>
    </div>
  );
}
