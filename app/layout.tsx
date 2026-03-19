// app/layout.js
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Ali Hajali | Design & Development",
  description: "خبير تصميم وبرمجة في قطر",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-white text-gray-900 font-sans">{children}</body>
    </html>
  );
}
