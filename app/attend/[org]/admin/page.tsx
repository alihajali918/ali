"use client";

import { useEffect, useState, use } from "react";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";

type Stats = {
  totalEmployees: number;
  presentToday:   number;
  absentToday:    number;
  lateToday:      number;
  totalOvertimeHours: number;
};

export default function AdminDashboard({ params }: { params: Promise<{ org: string }> }) {
  const { org }    = use(params);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`/api/attend/${org}/analytics`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [org]);

  const cards = stats ? [
    { label: "إجمالي الموظفين",  value: stats.totalEmployees,    icon: Users,     color: "#00F5D4" },
    { label: "حاضرون اليوم",     value: stats.presentToday,      icon: UserCheck, color: "#22c55e" },
    { label: "غائبون اليوم",     value: stats.absentToday,       icon: UserX,     color: "#ef4444" },
    { label: "متأخرون اليوم",    value: stats.lateToday,         icon: Clock,     color: "#f59e0b" },
    { label: "ساعات أوفرتايم",   value: stats.totalOvertimeHours, icon: TrendingUp, color: "#7B61FF" },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-8">لوحة التحكم</h1>

      {/* stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {stats === null ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse h-28"/>
          ))
        ) : cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label}
            className="relative glass-card rounded-2xl p-5 overflow-hidden">
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

      {/* today summary */}
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
        </div>
      )}
    </div>
  );
}
