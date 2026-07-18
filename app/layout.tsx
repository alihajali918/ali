import type { ReactNode } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Tracker from "./components/Tracker";
import { getSiteUrl } from "./lib/site-url";
import "./globals.css";

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-ibm",
  display: "swap",
  preload: true,
});

const site = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Ali Hajali | مبرمج مواقع احترافي",
    template: "%s | Ali Hajali",
  },
  description: "مبرمج مواقع في قطر متخصص بـ Next.js — مواقع تعريفية، متاجر إلكترونية، وأنظمة إدارة مخصصة. من الفكرة للإطلاق، بسرعة وباحترافية.",
  openGraph: {
    type: "website",
    locale: "ar_QA",
    siteName: "Ali Hajali",
    title: "Ali Hajali | مبرمج مواقع احترافي",
    description: "مبرمج مواقع في قطر متخصص بـ Next.js — مواقع تعريفية، متاجر إلكترونية، وأنظمة إدارة مخصصة. من الفكرة للإطلاق، بسرعة وباحترافية.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali Hajali | مبرمج مواقع احترافي",
    description: "مبرمج مواقع في قطر متخصص بـ Next.js — مواقع تعريفية، متاجر إلكترونية، وأنظمة إدارة مخصصة. من الفكرة للإطلاق، بسرعة وباحترافية.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={ibm.variable} style={{ background: "#0A0A0A" }}>
      <body>
        <a
          href="#main-content"
          className="skip-link"
        >
          تخطّي إلى المحتوى الرئيسي
        </a>
        <Analytics />
        <Tracker />
        <div id="main-content" tabIndex={-1} className="outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
