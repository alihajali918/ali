import { NextResponse } from "next/server";

export const revalidate = 86400; // cache 24h

export async function GET() {
  try {
    // Public Google Fonts metadata endpoint — no API key needed
    const res = await fetch("https://fonts.google.com/metadata/fonts", {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error("upstream");

    const text = await res.text();
    // Google prefixes their JSON with ")]}'\n" to prevent XSSI
    const json = JSON.parse(text.replace(/^\)\]\}'\n/, ""));

    const fonts = (json.familyMetadataList as any[]).map((f: any) => ({
      family:   f.family as string,
      variants: (f.fonts ? Object.keys(f.fonts) : ["400", "700"]) as string[],
      subsets:  (f.subsets ?? []) as string[],
    }));

    return NextResponse.json({ fonts });
  } catch {
    // Fallback to bundled list if upstream fails
    const { FONTS_LIST } = await import("./google-fonts-list");
    return NextResponse.json({ fonts: FONTS_LIST });
  }
}
