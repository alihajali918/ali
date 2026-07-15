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
  { path: "/contact", changeFrequency: "monthly", priority: 0.95 },
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
