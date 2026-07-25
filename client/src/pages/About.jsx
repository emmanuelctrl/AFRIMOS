export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold text-white">About AFRIMOS</h1>

      <section className="prose mt-8 max-w-none text-gray-200">
        <h2 className="text-xl font-semibold text-white">Our mission</h2>
        <p className="mt-2">
          Democratize international trade by connecting African commodity exporters with global
          buyers - reducing friction, cutting out middlemen, and enabling SMEs to scale globally.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Why we exist</h2>
        <p className="mt-2">
          Ethiopia exported $4.2B in goods in 2024, yet roughly 70% of exporters are small and
          medium businesses stuck with two or three repeat buyers while brokers take 5-10% of
          every transaction. On the other side, international importers struggle to verify
          suppliers, compare quotes and check quality. AFRIMOS solves both problems with a
          vetted supplier directory, a structured RFQ system and direct messaging.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Team</h2>
        <p className="mt-2">
          AFRIMOS was founded by Emmanuel, a full-stack engineer raised in an Ethiopian export
          family business - combining first-hand knowledge of export pain points with the
          technical ability to ship fast. The team is growing in Addis Ababa across engineering,
          business development and customer success.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Vision</h2>
        <p className="mt-2">
          Start with Ethiopian coffee, sesame, pulses, oilseeds and spices. Expand to Kenya,
          Nigeria and Ghana. Add escrow payments, logistics tracking and trade financing - the
          full operating system for African trade.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">Contact</h2>
        <p className="mt-2">
          Addis Ababa, Ethiopia ·{' '}
          <a href="mailto:admin@afrimos.et" className="text-brand-400 underline">
            admin@afrimos.et
          </a>
        </p>
      </section>
    </div>
  );
}
