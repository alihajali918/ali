export const dynamic = "force-static";

import type { Metadata } from "next";
import { getSiteUrl } from "../lib/site-url";
import Hero from "../components/Hero";
import FreeGiftBanner from "../components/FreeGiftBanner";
import ServicesSection from "../components/ServicesSection";
import WorkSection from "../components/WorkSection";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: `${getSiteUrl()}/` },
};

export default function Home() {
  return (
    <main className="scroll-smooth">
      <Hero />
      <FreeGiftBanner />
      <ServicesSection />
      <WorkSection />
      <Footer />
    </main>
  );
}
