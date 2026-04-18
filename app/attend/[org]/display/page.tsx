"use client";

import { use, useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Wifi, WifiOff } from "lucide-react";

export default function DisplayPage({ params }: { params: Promise<{ org: string }> }) {
  const { org }  = use(params);
  const [url, setUrl]         = useState("");
  const [remaining, setRemaining] = useState(15);
  const [online, setOnline]   = useState(true);
  const [time, setTime]       = useState("");

  const fetchToken = useCallback(async () => {
    try {
      const res  = await fetch(`/api/attend/${org}/qr/display`);
      const data = await res.json();
      if (data.url) { setUrl(data.url); setOnline(true); }
    } catch { setOnline(false); }
  }, [org]);

  // Refresh every 30s, countdown every 1s
  useEffect(() => {
    fetchToken();
    const tick = setInterval(() => {
      const secs = 15 - (Math.floor(Date.now() / 1000) % 15);
      setRemaining(secs);
      if (secs === 15) fetchToken();
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchToken]);

  // Clock
  useEffect(() => {
    const clock = setInterval(() => {
      setTime(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 select-none" dir="rtl">

      {/* Header */}
      <div className="text-center">
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">نظام الحضور</p>
        <h1 className="text-4xl font-black text-white capitalize">{org}</h1>
        <p className="text-6xl font-mono text-neon-cyan mt-3 tracking-widest">{time}</p>
      </div>

      {/* QR */}
      <div className="relative">
        <div className="bg-white p-6 rounded-3xl shadow-2xl">
          {url
            ? <QRCodeSVG value={url} size={260} level="H"/>
            : <div className="w-64 h-64 flex items-center justify-center text-gray-400">جارٍ التحميل...</div>
          }
        </div>

        {/* Countdown ring */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-dark-bg border-2 border-neon-cyan/40 rounded-full px-5 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"/>
          <span className="text-neon-cyan font-mono font-bold text-sm">{remaining}s</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mt-4">
        <p className="text-white text-xl font-bold">افتح كاميرا هاتفك وسكّن الكود</p>
        <p className="text-gray-500 text-sm mt-1">يتجدد الكود كل 15 ثانية</p>
      </div>

      {/* Online indicator */}
      <div className={`fixed top-4 left-4 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${online ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
        {online ? <Wifi size={14}/> : <WifiOff size={14}/>}
        {online ? "متصل" : "انقطع الاتصال"}
      </div>
    </div>
  );
}
