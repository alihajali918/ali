import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Tracker from "./components/Tracker";
import "./globals.css";

const ibm = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "Ali Hajali | مبرمج مواقع احترافي",
  description: "متخصص في برمجة مواقع Next.js وتصميم واجهات فخمة في قطر",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={ibm.variable} style={{ background: "#0A0A0A" }}>
      <body>
        <Analytics />
        <Tracker />
        {children}
      </body>
    </html>
  );
}
