"use client";

import { useEffect, useState, useCallback, use } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { RefreshCw } from "lucide-react";

type QrData = { token: string; remaining: number; step: number };

export default function QrScreen({ params }: { params: Promise<{ org: string }> }) {
  const { org }        = use(params);
  const [data, setData]   = useState<QrData | null>(null);
  const [pulse, setPulse] = useState(false);

  const fetchQr = useCallback(async () => {
    const res = await fetch(`/api/attend/${org}/qr`);
    if (res.ok) {
      const json: QrData = await res.json();
      setData(json);
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }
  }, [org]);

  useEffect(() => {
    fetchQr();
    const iv = setInterval(fetchQr, 5000); // refresh every 5s
    return () => clearInterval(iv);
  }, [fetchQr]);

  const pct = data ? (data.remaining / data.step) * 100 : 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div>
        <h1 className="text-3xl font-black text-white text-center mb-2">رمز الحضور</h1>
        <p className="text-gray-500 text-center text-sm">امسح الكود لتسجيل حضورك — يتجدد كل 30 ثانية</p>
      </div>

      {data ? (
        <div className={`relative transition-all duration-300 ${pulse ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}>
          {/* QR card */}
          <div className="bg-white p-6 rounded-3xl shadow-2xl">
            <QRCode
              value={typeof window !== "undefined" ? `${window.location.origin}/attend/${org}/scan?t=${data.token}` : `/attend/${org}/scan?t=${data.token}`}
              size={280}
              level="H"
            />
          </div>

          {/* token display */}
          <div className="mt-4 text-center">
            <p className="text-4xl font-black tracking-[0.3em] text-neon-cyan">{data.token}</p>
          </div>
        </div>
      ) : (
        <div className="w-72 h-72 rounded-3xl bg-white/5 animate-pulse"/>
      )}

      {/* countdown bar */}
      <div className="w-72">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>يتجدد خلال</span>
          <span className="font-black text-white">{data?.remaining ?? 30}ث</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-neon-cyan transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button onClick={fetchQr}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
        <RefreshCw size={15}/> تحديث يدوي
      </button>
    </div>
  );
}
