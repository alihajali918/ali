export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { db } from "../lib/db";
import { getSiteUrl } from "../lib/site-url";
import VotingWidget from "./VotingWidget";
import FormSection from "./FormSection";
import { getContrastText } from "../lib/contrast";
import {
  CalendarDays, BookOpen, UserPlus, Instagram, ChevronLeft,
  Info, ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "نادي تميم توستماسترز",
  alternates: { canonical: `${getSiteUrl()}/tamimtoastmasterclub` },
};

function linkStyle(title: string, color: string | null) {
  const t = title.toLowerCase();
  if (color) return { bg: color, text: getContrastText(color), icon: CalendarDays };
  if (t.includes("ملخص") || t.includes("أجندة") || t.includes("اجندة")) {
    return { bg: "#074466", text: "#ffffff", icon: BookOpen };
  }
  if (t.includes("عضوية") || t.includes("طلب") || t.includes("انضمام")) {
    return { bg: "#fcea84", text: "#1c2b39", icon: UserPlus };
  }
  if (t.includes("انستا") || t.includes("انستغرام") || t.includes("instagram") || t.includes("حساب")) {
    return { bg: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", text: "#ffffff", icon: Instagram };
  }
  return { bg: "#ffffff", text: "#1c2b39", icon: CalendarDays };
}

export default async function TamimToastmastersClubPage() {
  const [settings, links, categories, cookieStore] = await Promise.all([
    db.clubSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    db.clubLink.findMany({
      orderBy: { order: "asc" },
      include: { form: { include: { fields: { orderBy: { order: "asc" } } } } },
    }),
    db.clubVoteCategory.findMany({ orderBy: { order: "asc" }, include: { speakers: { orderBy: { createdAt: "asc" } } } }),
    cookies(),
  ]);

  const votingCategories = categories.map(c => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    speakers: c.speakers.map(s => s.name),
  }));

  const alreadyVoted: Record<number, boolean> = {};
  for (const c of categories) {
    alreadyVoted[c.id] = !!cookieStore.get(`voted_${c.id}_${c.votingRound}`);
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen text-white pt-0 pb-8 px-4 md:px-8 lg:px-16 flex flex-col justify-between"
      style={{ background: settings.colorPrimary }}
    >
      <div className="w-full max-w-7xl mx-auto transition-all duration-500" style={{ fontSize: `${settings.bodyFontScale}%` }}>

        {/* header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center justify-between w-full md:w-auto md:contents">
            <div className="w-40 h-40 flex items-center justify-center overflow-hidden md:order-1">
              {settings.logoAltUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoAltUrl} alt="الشعار" className="max-w-full max-h-full object-contain brightness-0 invert" />
              )}
            </div>
            <div
              className="w-20 h-20 md:w-[6.5rem] md:h-[6.5rem] border-[3px] md:border-[4px] rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden p-2 md:p-3 md:order-3"
              style={{ borderColor: settings.colorSecondary, borderStyle: "solid" }}
            >
              {settings.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt="شعار النادي" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>

          <div className="text-center md:order-2 flex-1 px-4 mt-0">
            <h1 className="font-bold text-white tracking-wide">
              {settings.clubName.split(" — ").map((line, i) => (
                <span
                  key={i}
                  className="block"
                  style={{
                    fontSize: i === 0
                      ? `clamp(1.75rem, 6vw, ${settings.titleFontSize}px)`
                      : `clamp(1.1rem, 3vw, ${Math.round(settings.titleFontSize * 0.45)}px)`,
                    color: i === 0 ? undefined : "rgba(255,255,255,0.7)",
                    marginTop: i === 0 ? undefined : "0.25rem",
                  }}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-[0.75em] md:text-[0.875em] font-semibold mt-1.5 max-w-xl mx-auto" style={{ color: settings.colorAccent }}>
              {settings.description}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* dynamic links + forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {links.map(link => {
              if (link.form) {
                if (!link.form.active) return null;
                return (
                  <div key={link.id} className="md:col-span-2">
                    <FormSection form={link.form as any} />
                  </div>
                );
              }
              const style = linkStyle(link.title, link.color);
              const Icon = style.icon;
              const isFile = link.url.startsWith("data:");
              return (
                <div
                  key={link.id}
                  className="rounded-2xl p-5 border border-white/10 shadow-md text-right flex flex-col justify-center min-h-[80px]"
                  style={{ background: style.bg, color: style.text ?? "#ffffff" }}
                >
                  <a
                    href={link.url}
                    {...(isFile ? { download: link.title } : { target: "_blank", rel: "noreferrer" })}
                    className="flex items-center justify-between w-full font-bold text-[1em] md:text-[1.125em]"
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={22} />
                      <span>{link.title}</span>
                    </span>
                    <ChevronLeft size={14} className="opacity-50" />
                  </a>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <VotingWidget categories={votingCategories} alreadyVoted={alreadyVoted} />

            {/* about */}
            <div className="lg:col-span-5">
              <a
                href="https://www.toastmasters.org/"
                target="_blank"
                rel="noreferrer"
                className="block bg-[#567997] hover:bg-[#486782] active:scale-[0.99] rounded-2xl p-6 text-right border border-white/5 transition duration-300 cursor-pointer shadow-lg h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[1.125em] font-bold text-white flex items-center gap-2">
                    <Info size={18} /> {settings.aboutTitle}
                  </h3>
                  <ArrowUpRight size={13} className="text-white/70" />
                </div>
                <p className="text-[0.875em] text-gray-100 leading-relaxed">{settings.aboutText}</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-400">{settings.clubName} © {new Date().getFullYear()}</div>
    </div>
  );
}
