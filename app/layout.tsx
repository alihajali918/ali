import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import Tracker from "./components/Tracker";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "Ali Hajali | مبرمج مواقع احترافي",
  description: "متخصص في برمجة مواقع Next.js وتصميم واجهات فخمة في قطر",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} style={{ background: "#0A0A0A" }}>
      <body style={{ background: "#0A0A0A" }}>
        <Tracker />
        {children}
      </body>
    </html>
  );
}
