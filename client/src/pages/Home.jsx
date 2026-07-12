import { Link } from 'react-router-dom';
import { useState } from 'react';

const BENEFITS = [
  {
    title: 'Direct buyer access',
    body: 'Reach qualified international buyers without brokers taking 5-10% commission on every deal.',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
  {
    title: 'Verified exporters only',
    body: 'Every supplier is manually vetted before appearing in the directory, so buyers can trade with confidence.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Structured RFQs',
    body: 'Buyers send clear requests for quotes with quantity, specs and delivery dates. Suppliers respond in one place.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Built-in messaging',
    body: 'Negotiate directly inside each inquiry thread. No lost emails, no missed opportunities.',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Before AFRIMOS we depended on two repeat buyers and a broker. In our first quarter on the platform we received inquiries from three new markets.',
    name: 'Abebe Bekele',
    role: 'Yirgacheffe Coffee Exporters PLC',
  },
  {
    quote:
      'Vetting Ethiopian suppliers used to take weeks of emails and trade references. Here, verification status and product specs are upfront.',
    name: 'Hans Mueller',
    role: 'Commodity importer, Hamburg',
  },
  {
    quote:
      'The RFQ system means every inquiry arrives with quantity, delivery date and terms already spelled out. We respond in minutes, not days.',
    name: 'Selam Tesfaye',
    role: 'Humera Sesame Trading',
  },
];

const FAQS = [
  {
    q: 'How much does AFRIMOS cost?',
    a: 'Basic listings are free for suppliers. Standard ($500/yr) and Premium ($2,000/yr) plans add priority placement and advanced analytics. Buyers browse and send RFQs for free.',
  },
  {
    q: 'How are suppliers verified?',
    a: 'Our team in Addis Ababa reviews each supplier’s registration documents, export license and trade history before granting the Verified Exporter badge.',
  },
  {
    q: 'Does AFRIMOS handle payments?',
    a: 'Not yet. In the MVP, buyers and suppliers agree terms directly (L/C, wire transfer). Escrow payments and logistics tracking are on the roadmap.',
  },
  {
    q: 'Which products are on the platform?',
    a: 'Coffee, sesame, pulses, oilseeds, spices and fruits from Ethiopian exporters, with expansion to Kenya, Nigeria and Ghana planned.',
  },
];

export default function Home() {
  const [faqOpen, setFaqOpen] = useState(0);
  const [slide, setSlide] = useState(0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-900 to-brand-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
              Ethiopian exports · $4.2B market
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              African trade, <span className="text-accent-400">without the middlemen.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-brand-100">
              AFRIMOS connects vetted Ethiopian commodity exporters with international buyers.
              List products, receive structured inquiries, negotiate directly - coffee, sesame,
              pulses, oilseeds and spices.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup?role=supplier" className="btn bg-accent-500 px-6 py-3 text-base text-white hover:bg-accent-600">
                Sign up as Supplier
              </Link>
              <Link to="/suppliers" className="btn bg-white px-6 py-3 text-base text-brand-800 hover:bg-brand-50">
                Find Suppliers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900">Why AFRIMOS</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{b.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900">Trusted by exporters & buyers</h2>
          <blockquote className="mt-8 min-h-32">
            <p className="text-lg italic text-gray-700">"{TESTIMONIALS[slide].quote}"</p>
            <footer className="mt-4 text-sm">
              <span className="font-semibold text-gray-900">{TESTIMONIALS[slide].name}</span>
              <span className="text-gray-500"> · {TESTIMONIALS[slide].role}</span>
            </footer>
          </blockquote>
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === slide ? 'bg-brand-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-gray-900"
                onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
              >
                {f.q}
                <span className="text-gray-400">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <p className="px-6 pb-5 text-sm text-gray-600">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-800 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to trade directly?</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Join the marketplace built for African commodity exports.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/signup" className="btn bg-accent-500 px-6 py-3 text-white hover:bg-accent-600">
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
