import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";

const paths: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/portfolio", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/products", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.95 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/register", changeFrequency: "yearly", priority: 0.3 },
  { path: "/tools/qrcode", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tools/compress", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tools/img2pdf", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tools/pdf-merge", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tools/certs", changeFrequency: "weekly", priority: 0.85 },
  { path: "/tools/reports", changeFrequency: "weekly", priority: 0.85 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return paths.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path || "/"}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
