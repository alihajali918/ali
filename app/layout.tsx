import type { ReactNode } from "react";
import Tracker from "./components/Tracker";
import "./globals.css";

export const metadata = {
  title: "Ali Hajali | مبرمج مواقع احترافي",
  description: "متخصص في برمجة مواقع Next.js وتصميم واجهات فخمة في قطر",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" style={{ background: "#0A0A0A" }}>
      <body style={{ background: "#0A0A0A" }}>
        <Tracker />
        {children}
      </body>
    </html>
  );
}
