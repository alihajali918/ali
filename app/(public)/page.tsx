export const dynamic = "force-static";

import type { Metadata } from "next";
import { getSiteUrl } from "../lib/site-url";
import Hero from "../components/Hero";
import ServicesSection from "../components/ServicesSection";
import WorkSection from "../components/WorkSection";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: `${getSiteUrl()}/` },
};

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
