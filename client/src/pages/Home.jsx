import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  { label: 'Device', to: '/about' },
  { label: 'Real Stories', to: '/about' },
  { label: 'Science', to: '/about' },
  { label: 'Plans', to: '/pricing' },
  { label: 'Reach Us', to: '/about' },
];

const EASE = 'cubic-bezier(0.77, 0, 0.18, 1)';
const SPOTLIGHT_RADIUS = 260;

function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 256 256" width="28" height="28" fill="white" className={className} aria-hidden="true">
      <path d={LOGO_PATH} />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuShown, setMenuShown] = useState(false);

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
    <div className="bg-white">
      {/* ---- Fixed navigation (z-50) ---------------------------------- */}
      <nav className="fixed inset-x-0 top-0 z-50">
        <div className="relative flex items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" aria-label="Measured home" className="relative z-10">
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
              {user ? 'Enter' : 'Reserve Yours'}
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
              {user ? 'Enter' : 'Reserve Yours'}
            </button>
            {!user && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-white/50 transition-colors hover:text-white/80"
              >
                Already reserved? Sign in
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
                <pattern id="measured-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#measured-grid)" />
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
            Measured
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
      </section>
    </div>
  );
}
