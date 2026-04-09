import { NextRequest } from "next/server";

// تحليل User Agent
export function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const device =
    /Mobile|Android|iPhone|iPad/i.test(ua)  ? "mobile"  :
    /Tablet|iPad/i.test(ua)                 ? "tablet"  :
    "desktop";

  const browser =
    /Edg\//i.test(ua)     ? "Edge"    :
    /Chrome/i.test(ua)    ? "Chrome"  :
    /Firefox/i.test(ua)   ? "Firefox" :
    /Safari/i.test(ua)    ? "Safari"  :
    /MSIE|Trident/i.test(ua) ? "IE"  :
    "Other";

  const os =
    /Windows/i.test(ua)  ? "Windows" :
    /Mac OS/i.test(ua)   ? "macOS"   :
    /Android/i.test(ua)  ? "Android" :
    /iPhone|iPad/i.test(ua) ? "iOS"  :
    /Linux/i.test(ua)    ? "Linux"   :
    "Other";

  return { device, browser, os };
}

// استخراج IP
export function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// توليد session ID بسيط
export function getSessionId(req: NextRequest): string {
  const cookie = req.cookies.get("sid")?.value;
  if (cookie) return cookie;
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
