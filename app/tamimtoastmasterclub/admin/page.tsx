"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Link2, Mic, Vote, LogOut, Loader2, Trash2, Plus, X, ExternalLink,
} from "lucide-react";

interface Settings {
  clubName: string; description: string; logoUrl: string; logoAltUrl: string;
  aboutTitle: string; aboutText: string;
  colorPrimary: string; colorSecondary: string; colorAccent: string;
}
interface LinkRow { id: number; title: string; url: string; order: number; }
interface SpeakerRow { id: number; category: "PREPARED" | "EVALUATION" | "IMPROMPTU"; name: string; }
interface VoteTally { category: string; candidate: string; votes: number; }

const CATEGORY_LABEL: Record<string, string> = {
  PREPARED: "خطبة معدة", EVALUATION: "خطبة تقييم", IMPROMPTU: "خطبة ارتجالية",
};

const NAV = [
  { id: "settings", label: "الإعدادات", icon: LayoutDashboard },
  { id: "links",    label: "الروابط",   icon: Link2 },
  { id: "speakers", label: "الخطباء",   icon: Mic },
  { id: "votes",    label: "التصويت",   icon: Vote },
];

export default function ClubAdminPage() {
  const router = useRouter();
  const [active, setActive] = useState("settings");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerRow[]>([]);
  const [votes, setVotes] = useState<{ total: number; tally: VoteTally[] }>({ total: 0, tally: [] });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s, l, sp, v] = await Promise.all([
      fetch("/api/tamimtoastmasterclub/admin/settings"),
      fetch("/api/tamimtoastmasterclub/admin/links"),
      fetch("/api/tamimtoastmasterclub/admin/speakers"),
      fetch("/api/tamimtoastmasterclub/admin/votes"),
    ]);
    if (s.status === 401) { router.push("/tamimtoastmasterclub/admin/login"); return; }
    setSettings(await s.json());
    setLinks(await l.json());
    setSpeakers(await sp.json());
    setVotes(await v.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const logout = async () => {
    await fetch("/api/tamimtoastmasterclub/auth/logout", { method: "POST" });
    router.push("/tamimtoastmasterclub/admin/login");
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#1c2b39] flex items-center justify-center">
        <Loader2 size={32} className="text-[#00a3e0] animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#1c2b39] flex flex-col md:flex-row text-white">
      {/* sidebar */}
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-l border-white/10 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-sm font-black">لوحة تحكم النادي</p>
          <a href="/tamimtoastmasterclub" target="_blank" rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[11px] font-bold text-gray-400 border border-white/10 hover:text-[#00a3e0] hover:border-[#00a3e0]/30 transition-colors">
            <ExternalLink size={12} /> عرض صفحة النادي
          </a>
        </div>
        <nav className="flex-1 px-3 py-4 flex md:flex-col gap-1 overflow-x-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`shrink-0 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-right ${
                  isActive ? "bg-[#00a3e0]/15 text-[#00a3e0]" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold">
            <LogOut size={14} /> خروج
          </button>
        </div>
      </aside>

      {/* content */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl">
        {active === "settings" && <SettingsTab settings={settings} onSaved={loadAll} />}
        {active === "links"    && <LinksTab links={links} onChanged={loadAll} />}
        {active === "speakers" && <SpeakersTab speakers={speakers} onChanged={loadAll} />}
        {active === "votes"    && <VotesTab votes={votes} onChanged={loadAll} />}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#00a3e0]/50";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-300">{label}</label>
      {textarea
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} className={cls} />
        : <input value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

function SettingsTab({ settings, onSaved }: { settings: Settings; onSaved: () => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Settings) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/tamimtoastmasterclub/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-black mb-2">إعدادات النادي</h2>
      <Field label="اسم النادي" value={form.clubName} onChange={set("clubName")} />
      <Field label="الوصف" value={form.description} onChange={set("description")} />
      <Field label="رابط الشعار الأبيض (اليمين)" value={form.logoAltUrl} onChange={set("logoAltUrl")} />
      <Field label="رابط شعار النادي المستدير (اليسار)" value={form.logoUrl} onChange={set("logoUrl")} />
      <Field label="عنوان النبذة" value={form.aboutTitle} onChange={set("aboutTitle")} />
      <Field label="نص النبذة" value={form.aboutText} onChange={set("aboutText")} textarea />
      <div className="grid grid-cols-3 gap-3">
        <Field label="اللون الأساسي" value={form.colorPrimary} onChange={set("colorPrimary")} />
        <Field label="اللون الثانوي" value={form.colorSecondary} onChange={set("colorSecondary")} />
        <Field label="لون التمييز" value={form.colorAccent} onChange={set("colorAccent")} />
      </div>
      <button onClick={save} disabled={saving}
        className="self-start mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a3e0] text-[#1c2b39] font-black text-sm disabled:opacity-60">
        {saving ? <Loader2 size={14} className="animate-spin" /> : null} حفظ التغييرات
      </button>
    </div>
  );
}

function LinksTab({ links, onChanged }: { links: LinkRow[]; onChanged: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    setSaving(true);
    await fetch("/api/tamimtoastmasterclub/admin/links", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, url }),
    });
    setTitle(""); setUrl(""); setSaving(false);
    onChanged();
  };

  const remove = async (id: number) => {
    if (!confirm("حذف هذا الرابط؟")) return;
    await fetch("/api/tamimtoastmasterclub/admin/links", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    onChanged();
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-black mb-2">الروابط الديناميكية</h2>
      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="اسم الزر"
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a3e0]/50" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="الرابط" dir="ltr"
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a3e0]/50" />
        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00a3e0] text-[#1c2b39] font-black text-xs rounded-lg disabled:opacity-60">
          <Plus size={14} /> إضافة
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {links.map(l => (
          <div key={l.id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{l.title}</p>
              <p className="text-xs text-gray-500 truncate" dir="ltr">{l.url}</p>
            </div>
            <button onClick={() => remove(l.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {links.length === 0 && <p className="text-gray-500 text-sm text-center py-6">لا توجد روابط بعد</p>}
      </div>
    </div>
  );
}

function SpeakersTab({ speakers, onChanged }: { speakers: SpeakerRow[]; onChanged: () => void }) {
  const [category, setCategory] = useState<SpeakerRow["category"]>("PREPARED");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await fetch("/api/tamimtoastmasterclub/admin/speakers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, name }),
    });
    setName(""); setSaving(false);
    onChanged();
  };

  const remove = async (id: number) => {
    if (!confirm("حذف هذا الخطيب؟")) return;
    await fetch("/api/tamimtoastmasterclub/admin/speakers", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    onChanged();
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h2 className="text-lg font-black mb-2">الخطباء والمقيّمون</h2>
      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
        <select value={category} onChange={e => setCategory(e.target.value as SpeakerRow["category"])}
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none">
          <option value="PREPARED">خطبة معدة</option>
          <option value="EVALUATION">خطبة تقييم</option>
          <option value="IMPROMPTU">خطبة ارتجالية</option>
        </select>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم"
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a3e0]/50" />
        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00a3e0] text-[#1c2b39] font-black text-xs rounded-lg disabled:opacity-60">
          <Plus size={14} /> إضافة
        </button>
      </form>
      {(["PREPARED", "EVALUATION", "IMPROMPTU"] as const).map(cat => (
        <div key={cat}>
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{CATEGORY_LABEL[cat]}</p>
          <div className="flex flex-col gap-2">
            {speakers.filter(s => s.category === cat).map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <p className="text-sm font-semibold">{s.name}</p>
                <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10">
                  <X size={14} />
                </button>
              </div>
            ))}
            {speakers.filter(s => s.category === cat).length === 0 && (
              <p className="text-gray-600 text-xs px-1">لا يوجد أحد بهذه الفئة</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function VotesTab({ votes, onChanged }: { votes: { total: number; tally: VoteTally[] }; onChanged: () => void }) {
  const clear = async () => {
    if (!confirm("مسح كل نتائج التصويت؟ لا يمكن التراجع.")) return;
    await fetch("/api/tamimtoastmasterclub/admin/votes", { method: "DELETE" });
    onChanged();
  };

  const grouped = (["PREPARED", "EVALUATION", "IMPROMPTU"] as const).map(cat => ({
    cat,
    rows: votes.tally.filter(v => v.category === cat).sort((a, b) => b.votes - a.votes),
  }));

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">نتائج التصويت ({votes.total})</h2>
        <button onClick={clear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10">
          <Trash2 size={13} /> مسح النتائج
        </button>
      </div>
      {grouped.map(({ cat, rows }) => (
        <div key={cat}>
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{CATEGORY_LABEL[cat]}</p>
          <div className="flex flex-col gap-2">
            {rows.map(r => (
              <div key={r.candidate} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <p className="text-sm font-semibold">{r.candidate}</p>
                <span className="text-sm font-black text-[#00a3e0]">{r.votes}</span>
              </div>
            ))}
            {rows.length === 0 && <p className="text-gray-600 text-xs px-1">لا توجد أصوات بعد</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
