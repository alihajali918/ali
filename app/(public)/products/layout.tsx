import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getSiteUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "المنتجات والأدوات",
  description: "أدوات ويب مجانية ومدفوعة: QR، ضغط ملفات، PDF، شهادات، تقارير.",
  alternates: { canonical: `${getSiteUrl()}/products` },
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children;
}
