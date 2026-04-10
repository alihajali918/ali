export const dynamic = "force-static";

import Hero from "../components/Hero";
import ServicesSection from "../components/ServicesSection";
import WorkSection from "../components/WorkSection";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="scroll-smooth">
      <Hero />
      <ServicesSection />
      <WorkSection />
      <Testimonials />
      <Footer />
    </main>
  );
}
