import type { Metadata } from "next";
import Footer from "../../components/Footer";
import ContactForm from "./ContactForm";
import { getSiteUrl } from "../../lib/site-url";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "تواصل",
  description: "راسلني لمشروعك، استفسارك، أو طلب عرض سعر — أرد خلال يومي عمل.",
  alternates: { canonical: `${getSiteUrl()}/contact` },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen glow-mesh">
      <div className="pt-40 pb-20 px-4 md:px-8 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-badge mb-6 inline-flex">CONTACT</span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            لنتحدث عن <span className="text-gradient">مشروعك</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
            املأ النموذج أدناه وسأراجع رسالتك وأتواصل معك عبر البريد في أقرب وقت.
          </p>
        </div>

        <ContactForm />

        <p className="mt-8 flex items-center justify-center gap-2 text-gray-600 text-sm">
          <Mail size={14} className="text-neon-cyan/70 shrink-0" />
          <span>للطوارئ التقنية يُفضّل ذكرها في نص الرسالة.</span>
        </p>
      </div>

      <Footer />
    </main>
  );
}
