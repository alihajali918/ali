"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, QrCode, ArrowLeft } from "lucide-react";

export default function FreeGiftBanner() {
  return (
    <section id="hadaya" className="px-4 md:px-8 py-6 scroll-mt-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden p-1 bg-gradient-to-l from-neon-cyan/30 via-neon-purple/20 to-transparent"
      >
        <div className="relative bg-dark-card rounded-[1.4rem] px-6 py-7 md:px-10 md:py-8 flex flex-col sm:flex-row items-center gap-5 md:gap-8">
          <div aria-hidden className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center shrink-0 relative">
            <Gift size={26} className="text-neon-cyan" />
          </div>

          <div className="flex-1 text-center sm:text-right relative">
            <span className="section-badge mb-2 inline-flex">هدية مجانية</span>
            <h2 className="text-xl md:text-2xl font-black text-white mb-1.5">
              أداة توليد <span className="text-gradient">QR Code</span> مجانية للجميع
            </h2>
            <p className="text-gray-400 text-sm">
              اصنع رمز QR احترافي لأي رابط، نص، أو بطاقة تعريف بضغطة واحدة — بدون تسجيل ومجاناً بالكامل.
            </p>
          </div>

          <Link
            href="/tools/qrcode"
            className="btn-shimmer flex items-center gap-2 px-6 py-3.5 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan-sm hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0 relative"
          >
            <QrCode size={16} /> جرّب الأداة <ArrowLeft size={14} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
