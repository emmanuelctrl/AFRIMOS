import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    cta: 'Start Free',
    features: ['Basic supplier listing', 'Up to 3 products', 'Receive RFQs', 'In-platform messaging'],
  },
  {
    name: 'Standard',
    price: '$500',
    period: 'per year',
    cta: 'Upgrade',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited products',
      'Priority placement in search',
      'Analytics dashboard',
      'Verified badge fast-track',
    ],
  },
  {
    name: 'Premium',
    price: '$2,000',
    period: 'per year',
    cta: 'Upgrade',
    features: [
      'Everything in Standard',
      'Featured on homepage',
      'Dedicated account manager',
      'Document generation (proforma, CO)',
      'Buyer matching support',
    ],
  },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-4xl font-bold text-white">Simple pricing for exporters</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-gray-300">
        Buyers always browse and send RFQs for free. Suppliers pay only to stand out.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`card flex flex-col ${t.highlight ? 'border-brand-500 ring-2 ring-brand-500' : ''}`}
          >
            {t.highlight && (
              <span className="mb-3 self-start rounded-full bg-brand-500/20 px-3 py-0.5 text-xs font-semibold text-brand-300">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-semibold text-white">{t.name}</h2>
            <p className="mt-2">
              <span className="text-4xl font-bold text-white">{t.price}</span>
              <span className="text-gray-400"> {t.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-200">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-brand-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/signup?role=supplier"
              className={`mt-8 ${t.highlight ? 'btn-primary' : 'btn-secondary'} w-full`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-gray-400">
        Launch offer: first 3 months free for early suppliers, then 50% off the first year.
      </p>
    </div>
  );
}
