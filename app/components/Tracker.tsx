"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    // لا نتتبع صفحات الأدمن
    if (pathname.startsWith("/admin")) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page:     pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
