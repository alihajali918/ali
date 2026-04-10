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
      <head>
        <link rel="preload" href="/IBMPlexSansArabic-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/IBMPlexSansArabic-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: `
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html,body{background:#0A0A0A;color:#fff;font-family:'IBM Plex Sans Arabic',sans-serif;min-height:100vh}
          body{overflow-x:hidden}
        `}} />
      </head>
      <body style={{ background: "#0A0A0A" }}>
        <Tracker />
        {children}
      </body>
    </html>
  );
}
