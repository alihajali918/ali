"use client";

import { use, useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, WifiOff } from "lucide-react";

function DisplayContent({ org }: { org: string }) {
  const searchParams = useSearchParams();
  const dk = searchParams.get("dk") ?? "";

  // Stable device ID for this browser session — generated once on mount
  const sidRef = useRef<string>("");
  useEffect(() => {
    sidRef.current = crypto.randomUUID();
  }, []);

  const [url, setUrl]           = useState("");
  const [remaining, setRemaining] = useState(30);
  const [online, setOnline]     = useState(true);
  const [time, setTime]         = useState("");
  const [unauthorized, setUnauthorized]   = useState(false);
  const [takenOver, setTakenOver]         = useState(false);

  const fetchToken = useCallback(async () => {
    try {
      const sid = sidRef.current;
      const qs  = new URLSearchParams();
      if (dk)  qs.set("dk",  dk);
      if (sid) qs.set("sid", sid);
      const res  = await fetch(`/api/attend/${org}/qr/display?${qs}`);
      if (res.status === 401) { setUnauthorized(true); return; }
      if (res.status === 409) { setTakenOver(true); return; }
      const data = await res.json();
      if (data.url) { setUrl(data.url); setOnline(true); setTakenOver(false); setUnauthorized(false); }
    } catch { setOnline(false); }
  }, [org, dk]);

  useEffect(() => {
    fetchToken();
    const tick = setInterval(() => {
      const secs = 30 - (Math.floor(Date.now() / 1000) % 30);
      setRemaining(secs);
      if (secs === 30) fetchToken();
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchToken]);

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-xl font-black mb-2">غير مصرح</p>
          <p className="text-gray-500 text-sm">استخدم الرابط الكامل من إعدادات المؤسسة</p>
        </div>
      </div>
    );
  }

  if (takenOver) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-yellow-400 text-xl font-black mb-2">الشاشة مفتوحة على جهاز آخر</p>
          <p className="text-gray-500 text-sm">لا يمكن فتح شاشة العرض على أكثر من جهاز واحد في نفس الوقت</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 select-none" dir="rtl">
      <div className="text-center">
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">نظام الحضور</p>
        <h1 className="text-4xl font-black text-white capitalize">{org}</h1>
        <p className="text-6xl font-mono text-neon-cyan mt-3 tracking-widest">{time}</p>
      </div>

      <div className="relative">
        <div className="bg-white p-6 rounded-3xl shadow-2xl">
          {url
            ? <QRCodeSVG value={url} size={260} level="H"/>
            : <div className="w-64 h-64 flex items-center justify-center text-gray-400">جارٍ التحميل...</div>
          }
        </div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-dark-bg border-2 border-neon-cyan/40 rounded-full px-5 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"/>
          <span className="text-neon-cyan font-mono font-bold text-sm">{remaining}s</span>
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-white text-xl font-bold">افتح كاميرا هاتفك وسكّن الكود</p>
        <p className="text-gray-500 text-sm mt-1">يتجدد الكود كل 30 ثانية</p>
      </div>

      <div className={`fixed top-4 left-4 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${online ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
        {online ? <Wifi size={14}/> : <WifiOff size={14}/>}
        {online ? "متصل" : "انقطع الاتصال"}
      </div>
    </div>
  );
}

export default function DisplayPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]"/>}>
      <DisplayContent org={org}/>
    </Suspense>
  );
}
