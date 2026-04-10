import type { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Tracker from "./components/Tracker";
import { getSessionUser } from "./lib/auth";
import "./globals.css";

export const metadata = {
  title: "Ali Hajali | مبرمج مواقع احترافي",
  description: "متخصص في برمجة مواقع Next.js وتصميم واجهات فخمة في قطر",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const navUser = user ? { name: user.name, role: user.role } : null;

  return (
    <html lang="ar" dir="rtl" style={{ background: "#0A0A0A" }}>
      <head>
        <link rel="preload" href="/IBMPlexSansArabic-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/IBMPlexSansArabic-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body style={{ background: "#0A0A0A" }}>
        <Tracker />
        <Navbar initialUser={navUser} />
        {children}
      </body>
    </html>
  );
}
