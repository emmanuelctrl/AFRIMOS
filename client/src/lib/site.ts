import {
  BadgeCheck,
  ChartBarIncreasing,
  Globe,
  MessagesSquare,
  Ship,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
}

export const STATS: Stat[] = [
  { value: 500, suffix: '+', label: 'Verified exporters', detail: 'Manually vetted before listing' },
  { value: 203, label: 'Buyer countries', detail: 'Global demand coverage' },
  { value: 1200, suffix: '+', label: 'RFQs matched', detail: 'Structured, spec-complete inquiries' },
  { value: 4.2, prefix: '$', suffix: 'B', label: 'Export market', detail: 'Addressable annual trade' },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  accent: string;
}

export const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: 'Verified exporters only',
    body: 'Every supplier passes document, licence and trade-history review before appearing in the directory.',
    accent: 'from-cyan-400/25 to-transparent',
  },
  {
    icon: MessagesSquare,
    title: 'Structured RFQs',
    body: 'Quantity, specs, incoterms and delivery dates arrive normalised — so quotes are comparable at a glance.',
    accent: 'from-neon-purple/25 to-transparent',
  },
  {
    icon: ChartBarIncreasing,
    title: 'Live trade intelligence',
    body: 'Category demand, response rates and inquiry velocity, updated continuously across the marketplace.',
    accent: 'from-neon-blue/25 to-transparent',
  },
  {
    icon: Globe,
    title: 'Direct global reach',
    body: 'Reach qualified importers across 203 countries without brokers taking a cut of every shipment.',
    accent: 'from-neon-indigo/25 to-transparent',
  },
  {
    icon: Ship,
    title: 'Logistics-ready terms',
    body: 'FOB, CIF and DDP terms, MOQs and lead times are captured up front and travel with every listing.',
    accent: 'from-cyan-400/25 to-transparent',
  },
  {
    icon: Sparkles,
    title: 'Intelligent matching',
    body: 'Broadcast an RFQ and it routes automatically to verified suppliers in the right category.',
    accent: 'from-neon-purple/25 to-transparent',
  },
];

export interface Service {
  index: string;
  title: string;
  body: string;
  points: string[];
}

export const SERVICES: Service[] = [
  {
    index: '01',
    title: 'For exporters',
    body: 'Turn a verified profile into a global storefront. List products with full specs, receive structured inquiries, and negotiate directly with importers.',
    points: ['Verified Exporter badge', 'Unlimited product catalogue', 'Inquiry & response analytics'],
  },
  {
    index: '02',
    title: 'For buyers',
    body: 'Source African commodities from suppliers who have already been vetted. Compare offers side by side and issue RFQs in seconds.',
    points: ['Vetted supplier directory', 'One-to-many RFQ broadcast', 'Thread-based negotiation'],
  },
  {
    index: '03',
    title: 'For the trade desk',
    body: 'Operational visibility across the whole pipeline — from first inquiry to closed deal — with exportable reporting.',
    points: ['Pipeline dashboards', 'Response-rate tracking', 'CSV export & audit trail'],
  },
];

export interface Commodity {
  name: string;
  listings: string;
  origin: string;
  demand: number;
}

export const COMMODITIES: Commodity[] = [
  { name: 'Coffee', listings: '180+ listings', origin: 'Yirgacheffe · Sidamo', demand: 92 },
  { name: 'Sesame', listings: '90+ listings', origin: 'Humera · Gondar', demand: 78 },
  { name: 'Pulses', listings: '120+ listings', origin: 'Shewa · Amhara', demand: 71 },
  { name: 'Oilseeds', listings: '70+ listings', origin: 'Wollega', demand: 64 },
  { name: 'Spices', listings: '85+ listings', origin: 'Kaffa', demand: 58 },
  { name: 'Fruits', listings: '40+ listings', origin: 'Rift Valley', demand: 44 },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
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
  {
    quote:
      'We replaced a broker relationship that cost us 8% per shipment. The margin came straight back to the farm gate.',
    name: 'Daniel Girma',
    role: 'Rift Valley Pulses & Spices',
  },
  {
    quote:
      'The analytics tell us which categories buyers are actually asking for. We plan our season around it.',
    name: 'Marta Haile',
    role: 'Addis Export Collective',
  },
];

export interface Listing {
  company: string;
  product: string;
  category: string;
  origin: string;
  moq: string;
  quality: string;
}

export const LISTINGS: Listing[] = [
  {
    company: 'Yirgacheffe Coffee Exporters',
    product: 'Yirgacheffe Grade 1',
    category: 'Coffee',
    origin: 'Yirgacheffe',
    moq: '500 kg',
    quality: 'Specialty',
  },
  {
    company: 'Humera Sesame Trading',
    product: 'Whitish Sesame Seeds',
    category: 'Sesame',
    origin: 'Humera',
    moq: '19 MT',
    quality: 'Premium',
  },
  {
    company: 'Rift Valley Pulses',
    product: 'Desi Chickpeas',
    category: 'Pulses',
    origin: 'Shewa',
    moq: '25 MT',
    quality: 'Standard',
  },
  {
    company: 'Rift Valley Pulses',
    product: 'Korarima (Cardamom)',
    category: 'Spices',
    origin: 'Kaffa',
    moq: '100 kg',
    quality: 'Premium',
  },
  {
    company: 'Humera Sesame Trading',
    product: 'Niger Seed (Noug)',
    category: 'Oilseeds',
    origin: 'Wollega',
    moq: '20 MT',
    quality: 'Standard',
  },
];

export const TRUST_BADGES = ['ISO certified', 'Organic', 'Fair Trade', 'HACCP', 'Global GAP'];
