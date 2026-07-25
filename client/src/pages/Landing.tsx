import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { WhyUs } from '@/components/sections/WhyUs';
import { Stats } from '@/components/sections/Stats';
import { Features } from '@/components/sections/Features';
import { Services } from '@/components/sections/Services';
import { Showcase } from '@/components/sections/Showcase';
import { Testimonials } from '@/components/sections/Testimonials';
import { CallToAction } from '@/components/sections/CallToAction';

/**
 * AFRIMOS marketing experience. Rendered standalone (outside the app shell)
 * so the hero can own the full viewport.
 */
export default function Landing() {
  useSmoothScroll();

  // No background colour on the wrapper: `body` supplies it. An opaque
  // background here would paint over the fixed `-z-10` ambient layer, because a
  // plain `relative` element does not create a stacking context.
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AmbientBackground />
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
        <WhyUs />
        <Stats />
        <Features />
        <Services />
        <Showcase />
        <Testimonials />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
