"use client";

import { useEffect, useState, use } from "react";
import { Users, UserCheck, UserX, Clock, TrendingUp, Link2, Copy } from "lucide-react";

type Stats = {
  totalEmployees: number;
  presentToday:   number;
  absentToday:    number;
  lateToday:      number;
  totalOvertimeHours: number;
};

export default function AdminDashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org }  = use(params);
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/attend/${org}/analytics`)
      .then(r => r.json())
      .then(d => { if (!d.error) setStats(d); })
      .catch(() => {});
  }, [org]);

  const employeeLink = typeof window !== "undefined"
    ? `${window.location.origin}/attend/${org}/scan`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/attend/${org}/display`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cards = stats ? [
    { label: "إجمالي الموظفين",  value: stats.totalEmployees,     icon: Users,      color: "#00F5D4" },
    { label: "حاضرون اليوم",     value: stats.presentToday,       icon: UserCheck,  color: "#22c55e" },
    { label: "غائبون اليوم",     value: stats.absentToday,        icon: UserX,      color: "#ef4444" },
    { label: "متأخرون اليوم",    value: stats.lateToday,          icon: Clock,      color: "#f59e0b" },
    { label: "ساعات أوفرتايم",   value: stats.totalOvertimeHours, icon: TrendingUp, color: "#7B61FF" },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-500 text-sm">لوحة تحكم</p>
          <h1 className="text-2xl font-black text-white capitalize">{org}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20 transition-colors">
            {copied ? <><Copy size={14}/> تم النسخ!</> : <><Link2 size={14}/> رابط شاشة QR</>}
          </button>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="glass-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">رابط دخول الموظفين</p>
          <p className="text-neon-cyan font-mono text-sm break-all">/attend/{org}/scan</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">شاشة QR للعرض</p>
          <p className="text-neon-cyan font-mono text-sm break-all">/attend/{org}/display</p>
        </div>
      </div>

      {/* stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats === null ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse h-28"/>
          ))
        ) : cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="relative glass-card rounded-2xl p-5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}/>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}15`, color }}>
              <Icon size={20}/>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Today progress */}
      {stats && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-black text-white mb-4">ملخص اليوم</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/5 rounded-xl overflow-hidden h-3">
              <div
                className="h-full rounded-xl bg-neon-cyan transition-all duration-700"
                style={{ width: `${stats.totalEmployees ? (stats.presentToday / stats.totalEmployees) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-400 font-bold whitespace-nowrap">
              {stats.totalEmployees ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}٪ حضور
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="text-green-400 font-black text-lg">{stats.presentToday}</p>
              <p className="text-xs text-gray-500">حاضر</p>
            </div>
            <div>
              <p className="text-yellow-400 font-black text-lg">{stats.lateToday}</p>
              <p className="text-xs text-gray-500">متأخر</p>
            </div>
            <div>
              <p className="text-red-400 font-black text-lg">{stats.absentToday}</p>
              <p className="text-xs text-gray-500">غائب</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
