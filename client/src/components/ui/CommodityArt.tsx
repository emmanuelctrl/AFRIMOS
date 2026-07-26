import { useId, useMemo, type ReactElement } from 'react';

/* ------------------------------------------------------------------ *
 *  Drawn product art
 *
 *  Each commodity gets a scatter of the actual goods — beans, seeds,
 *  pods, fruit — laid out on a jittered grid with a seeded RNG, so a
 *  card looks the same on every render and on every machine.
 *
 *  These are stand-ins with a job: a card labelled "Coffee" should show
 *  coffee, not a coloured rectangle. Drop a photograph into
 *  `public/products/<name>.jpg` and it takes over (see ProductImage).
 * ------------------------------------------------------------------ */

/** mulberry32 — small, fast, and identical everywhere. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Item {
  x: number;
  y: number;
  rot: number;
  scale: number;
  variant: number;
}

/** Square canvas: the cards are portrait, so a wide frame gets sliced away. */
const SIZE = 240;
/** Every commodity draws three variants of its item. */
const VARIANTS = 3;

/**
 * Jittered grid rather than pure random: pure random clumps and leaves
 * bald patches, which reads as a mistake at this size.
 */
function scatter(seed: number, cols: number, rows: number, variants: number): Item[] {
  const r = rng(seed);
  const out: Item[] = [];
  const cw = SIZE / cols;
  const ch = SIZE / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      out.push({
        x: cw * (col + 0.5) + (r() - 0.5) * cw * 0.85,
        y: ch * (row + 0.5) + (r() - 0.5) * ch * 0.85,
        rot: r() * 360,
        scale: 0.85 + r() * 0.45,
        variant: Math.floor(r() * variants),
      });
    }
  }
  return out;
}

interface ItemProps {
  variant: number;
  /** Id of the shared top-left sheen gradient for this SVG instance. */
  sheen: string;
}

/* ---- The goods ---------------------------------------------------- */

/** Roasted bean: an oval split by the centre crease. */
function Coffee({ variant, sheen }: ItemProps) {
  const body = ['#5A3618', '#6E4320', '#452711'][variant];
  return (
    <>
      <ellipse rx="13" ry="8.6" fill={body} />
      <ellipse rx="13" ry="8.6" fill={`url(#${sheen})`} />
      <path
        d="M -10.5 0 C -5.5 -3.4, 5.5 3.4, 10.5 0"
        fill="none"
        stroke="#25130A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <ellipse cx="-3.5" cy="-4" rx="4.6" ry="2" fill="#C99A62" opacity="0.28" />
    </>
  );
}

/** Sesame: flat ivory teardrops. */
function Sesame({ variant }: ItemProps) {
  const body = ['#F2E6CB', '#E4D3AF', '#FBF3E2'][variant];
  return (
    <>
      <path
        d="M -7 0 Q -4.5 -4.4, 2 -3.2 Q 7 -2.2, 7 0 Q 7 2.2, 2 3.2 Q -4.5 4.4, -7 0 Z"
        fill={body}
      />
      <path d="M -6 -0.6 Q -3 -2.6, 2 -2.2" fill="none" stroke="#FFFDF6" strokeWidth="1" opacity="0.7" />
      <path d="M 3 2.6 Q 6 1.6, 6.6 0.4" fill="none" stroke="#9C8256" strokeWidth="0.9" opacity="0.5" />
    </>
  );
}

/** Pulses: lentil discs and a chickpea with its little beak. */
function Pulses({ variant, sheen }: ItemProps) {
  if (variant === 2)
    return (
      <>
        <circle r="9.5" fill="#D9BE86" />
        <circle r="9.5" fill={`url(#${sheen})`} />
        <path d="M 6 -6.5 Q 11.5 -8.5, 9 -2" fill="#D9BE86" />
        <circle cx="-3" cy="-3.4" r="3.2" fill="#F0DCB0" opacity="0.55" />
      </>
    );
  const body = ['#A8552B', '#7E8F4A'][variant];
  return (
    <>
      <circle r="8.4" fill={body} />
      <circle r="8.4" fill={`url(#${sheen})`} />
      <path d="M -8 1.5 A 8.4 8.4 0 0 0 8 1.5" fill="#000" opacity="0.16" />
      <ellipse cx="-2.4" cy="-3" rx="3.4" ry="2.2" fill="#FFF" opacity="0.22" />
    </>
  );
}

/** Oilseeds: slim niger seeds among striped sunflower kernels. */
function Oilseeds({ variant }: ItemProps) {
  if (variant === 2)
    return (
      <>
        <path d="M 0 -10 Q 6.5 -5, 6 3 Q 4 9.5, 0 10 Q -4 9.5, -6 3 Q -6.5 -5, 0 -10 Z" fill="#E9DCC0" />
        <path d="M 0 -8 L 0 8 M -3 -6 L -3.4 6 M 3 -6 L 3.4 6" stroke="#4B3B22" strokeWidth="1.1" opacity="0.65" />
      </>
    );
  const body = ['#2B231A', '#3E3225'][variant];
  return (
    <>
      <path d="M 0 -9.5 Q 4.6 -3, 4.2 3 Q 3 9, 0 9.5 Q -3 9, -4.2 3 Q -4.6 -3, 0 -9.5 Z" fill={body} />
      <path d="M -1.6 -7 Q -3 0, -1.8 7" fill="none" stroke="#8E7A55" strokeWidth="0.9" opacity="0.5" />
    </>
  );
}

/** Spices: korarima pods, peppercorns, turmeric shards. */
function Spices({ variant, sheen }: ItemProps) {
  if (variant === 0)
    return (
      // Cardamom / korarima pod: ribbed spindle with pointed tips
      <>
        <path d="M 0 -13 Q 6.5 -6, 6.5 1 Q 6.5 9, 0 13 Q -6.5 9, -6.5 1 Q -6.5 -6, 0 -13 Z" fill="#8E7A3C" />
        <path
          d="M 0 -11 L 0 11 M -3.4 -8 Q -4.6 1, -3.2 8 M 3.4 -8 Q 4.6 1, 3.2 8"
          stroke="#5C4C21"
          strokeWidth="1.1"
          fill="none"
          opacity="0.7"
        />
        <ellipse cx="-2.4" cy="-4" rx="2" ry="4" fill="#C4B274" opacity="0.35" />
      </>
    );
  if (variant === 1)
    return (
      // Peppercorn: wrinkled sphere
      <>
        <circle r="7.2" fill="#3A2E22" />
        <circle r="7.2" fill={`url(#${sheen})`} />
        <path
          d="M -5 -2 Q -1 -4, 3 -1 M -4 2.5 Q 0 0.5, 4.6 2"
          stroke="#1C150F"
          strokeWidth="1.1"
          fill="none"
          opacity="0.8"
        />
        <circle cx="-2.4" cy="-2.8" r="2" fill="#FFF" opacity="0.16" />
      </>
    );
  return (
    // Turmeric / ginger shard
    <>
      <path d="M -11 -2 Q -5 -6.5, 2 -4 Q 10 -1.5, 11 2 Q 6 5.5, -2 4.5 Q -9 3.5, -11 -2 Z" fill="#C98A2C" />
      <path d="M -7 -2.5 Q 0 -4.5, 7 -1" fill="none" stroke="#8E5A12" strokeWidth="1" opacity="0.6" />
    </>
  );
}

/** Fruits: whole stone fruit, a leafed one, and a halved avocado. */
function Fruits({ variant, sheen }: ItemProps) {
  if (variant === 2)
    return (
      // Halved avocado
      <>
        <ellipse rx="11" ry="13.5" fill="#3F5A26" />
        <ellipse rx="8.6" ry="11" fill="#CFDE94" />
        <circle r="4.8" fill="#8A6A34" />
        <circle cx="-1.4" cy="-1.6" r="1.8" fill="#A8873F" opacity="0.7" />
      </>
    );
  const body = ['#D98B2B', '#C6612A'][variant];
  return (
    <>
      <ellipse rx="12" ry="13" fill={body} />
      <ellipse rx="12" ry="13" fill={`url(#${sheen})`} />
      <ellipse cx="-4" cy="-5" rx="3.6" ry="2.6" fill="#FFF" opacity="0.3" />
      <path d="M 0 -13 Q 5 -18, 11 -16 Q 7 -11, 0 -12 Z" fill="#4E7A32" />
    </>
  );
}

/* ---- Per-commodity recipe ----------------------------------------- */

interface Recipe {
  seed: number;
  cols: number;
  rows: number;
  /** Radius of the contact shadow — a sesame seed casts less than a mango. */
  shadow: number;
  /** Backdrop the goods sit on — a warm ground for each category. */
  ground: [string, string];
  Item: (p: ItemProps) => ReactElement;
}

const RECIPES: Record<string, Recipe> = {
  coffee: { seed: 11, cols: 8, rows: 8, shadow: 11, ground: ['#5A3A1E', '#2A1A0C'], Item: Coffee },
  sesame: { seed: 23, cols: 15, rows: 15, shadow: 6, ground: ['#6E5B38', '#33290F'], Item: Sesame },
  pulses: { seed: 37, cols: 9, rows: 9, shadow: 9, ground: ['#6A4526', '#2E1C0E'], Item: Pulses },
  oilseeds: { seed: 41, cols: 10, rows: 10, shadow: 8, ground: ['#5C563A', '#25220F'], Item: Oilseeds },
  spices: { seed: 59, cols: 8, rows: 8, shadow: 10, ground: ['#6B4718', '#2C1C09'], Item: Spices },
  fruits: { seed: 71, cols: 5, rows: 5, shadow: 13, ground: ['#4C6428', '#1D280D'], Item: Fruits },
};

export const COMMODITY_SLUGS = Object.keys(RECIPES);

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Drawn stand-in for a product photograph. Falls back to coffee for any
 * name that has no recipe, so a new commodity never renders empty.
 */
export function CommodityArt({ name, className }: { name: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const recipe = RECIPES[slugify(name)] ?? RECIPES.coffee;
  const items = useMemo(
    () => scatter(recipe.seed, recipe.cols, recipe.rows, VARIANTS),
    [recipe]
  );
  const { Item } = recipe;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${name} — product photography placeholder`}
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={recipe.ground[0]} />
          <stop offset="100%" stopColor={recipe.ground[1]} />
        </linearGradient>
        {/* A single top-left sheen, reused by every item so the whole
            scatter appears to be lit from one place. */}
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <radialGradient id={`${uid}-key`} cx="0.3" cy="0.12" r="0.95">
          <stop offset="0%" stopColor="#FFF6E4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFF6E4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-vignette`} cx="0.4" cy="0.35" r="0.85">
          <stop offset="55%" stopColor="#0A141A" stopOpacity="0" />
          <stop offset="100%" stopColor="#0A141A" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      <rect width={SIZE} height={SIZE} fill={`url(#${uid}-ground)`} />

      {items.map((it, i) => (
        <g key={i} transform={`translate(${it.x} ${it.y}) rotate(${it.rot}) scale(${it.scale})`}>
          {/* Contact shadow keeps the pile from looking like flat stickers */}
          <ellipse
            cy={recipe.shadow * 0.3}
            rx={recipe.shadow}
            ry={recipe.shadow * 0.62}
            fill="#000"
            opacity="0.32"
          />
          <Item variant={it.variant} sheen={`${uid}-sheen`} />
        </g>
      ))}

      {/* Key light across the pile, then a cool vignette to seat it */}
      <rect width={SIZE} height={SIZE} fill={`url(#${uid}-key)`} />
      <rect width={SIZE} height={SIZE} fill={`url(#${uid}-vignette)`} />
    </svg>
  );
}
