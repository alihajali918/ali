"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Download, ImagePlus, X, Printer, Users, BookOpen, Type, LayoutLandscape, LayoutTemplate } from "lucide-react";

// ─── types ───
type Template    = "classic" | "dark" | "royal" | "minimal" | "bold" | "elegant";
type Orientation = "landscape" | "portrait";

interface CertData {
  recipientName: string;
  courseName:    string;
  certDate:      string;
  directorName:  string;
  centerName:    string;
  description:   string;
}

interface FontOpts {
  family:    string;
  titleSize: number;
  nameSize:  number;
  bodySize:  number;
}

interface DrawOpts {
  data:     CertData;
  template: Template;
  orient:   Orientation;
  accent:   string;
  logoImg:  HTMLImageElement | null;
  fonts:    FontOpts;
}

// ─── Google Fonts ───
const GOOGLE_FONTS = [
  { id: "Cairo",            label: "Cairo",            css: "Cairo:wght@400;600;700;900" },
  { id: "Amiri",            label: "Amiri",            css: "Amiri:wght@400;700" },
  { id: "Tajawal",          label: "Tajawal",          css: "Tajawal:wght@400;500;700;900" },
  { id: "Noto+Kufi+Arabic", label: "Noto Kufi",        css: "Noto+Kufi+Arabic:wght@400;700;900" },
  { id: "Lateef",           label: "Lateef",           css: "Lateef:wght@400;700" },
  { id: "IBM+Plex+Sans+Arabic", label: "IBM Plex Arabic", css: "IBM+Plex+Sans+Arabic:wght@400;600;700" },
];

// ─── canvas sizes ───
function getSize(orient: Orientation): [number, number] {
  return orient === "landscape" ? [1200, 848] : [848, 1200];
}

// ─── helpers ───
function hex2rgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function roundRect(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, family: string, weight="900") {
  let s = size;
  ctx.font = `${weight} ${s}px "${family}"`;
  while (ctx.measureText(text).width > maxW && s > 16) {
    s -= 2; ctx.font = `${weight} ${s}px "${family}"`;
  }
  return ctx.font;
}

function dateStr(d: string) {
  return d ? new Date(d).toLocaleDateString("ar-QA", { year:"numeric", month:"long", day:"numeric" }) : "التاريخ";
}

// ═══════════════════════════════════════════════
// ─── TEMPLATE 1: Classic (landscape) ───
// ═══════════════════════════════════════════════
function drawClassic(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg, fonts } = opts;
  const [W, H] = [ctx.canvas.width, ctx.canvas.height];
  const [ar, ag, ab] = hex2rgb(accent);
  const F = fonts.family;

  ctx.fillStyle = "#FDFAF4"; ctx.fillRect(0,0,W,H);

  // double border
  ctx.strokeStyle = accent; ctx.lineWidth = 5;
  ctx.strokeRect(22,22,W-44,H-44);
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.3)`; ctx.lineWidth = 1.5;
  ctx.strokeRect(34,34,W-68,H-68);

  // corner ornaments
  [[50,50],[W-50,50],[50,H-50],[W-50,H-50]].forEach(([cx,cy]) => {
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=accent; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx,cy,13,0,Math.PI*2); ctx.stroke();
  });

  // header gradient
  const hg = ctx.createLinearGradient(0,0,W,0);
  hg.addColorStop(0,`rgba(${ar},${ag},${ab},0.06)`);
  hg.addColorStop(0.5,`rgba(${ar},${ag},${ab},0.15)`);
  hg.addColorStop(1,`rgba(${ar},${ag},${ab},0.06)`);
  ctx.fillStyle=hg; ctx.fillRect(50,50,W-100,110);

  ctx.textAlign = "center";
  const cy = H/2;

  // center name
  ctx.fillStyle = accent; ctx.font = `700 ${fonts.bodySize}px "${F}"`;
  ctx.fillText(data.centerName || "مركز التدريب", W/2, 105);

  // title
  ctx.fillStyle = "#1a1a1a"; ctx.font = `900 ${fonts.titleSize}px "${F}"`;
  ctx.fillText("شـهـادة تـقـدير", W/2, 195);

  // decorative lines
  ctx.strokeStyle = accent; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W/2-130,215); ctx.lineTo(W/2-25,215);
  ctx.moveTo(W/2+25,215); ctx.lineTo(W/2+130,215); ctx.stroke();

  ctx.fillStyle = "#6b7280"; ctx.font = `600 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText("يُمنح هذه الشهادة إلى", W/2, 260);

  // name
  ctx.font = fitFont(ctx, data.recipientName||"اسم المتدرب", W-220, fonts.nameSize, F);
  ctx.fillStyle = accent;
  ctx.fillText(data.recipientName||"اسم المتدرب", W/2, cy+20);
  const nw = ctx.measureText(data.recipientName||"اسم المتدرب").width;
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.4)`; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(W/2-nw/2-20,cy+36); ctx.lineTo(W/2+nw/2+20,cy+36); ctx.stroke();

  const desc = data.description || `لإتمامه بنجاح دورة "${data.courseName||"اسم الدورة"}"`;
  ctx.fillStyle="#374151"; ctx.font=`600 ${fonts.bodySize}px "${F}"`;
  ctx.fillText(desc, W/2, cy+90);
  if (data.courseName && !data.description) {
    ctx.font = fitFont(ctx, data.courseName, W-240, fonts.bodySize+10, F, "700");
    ctx.fillStyle="#111"; ctx.fillText(data.courseName, W/2, cy+130);
  }

  ctx.fillStyle="#9ca3af"; ctx.font=`500 ${fonts.bodySize-3}px "${F}"`;
  ctx.fillText(`بتاريخ: ${dateStr(data.certDate)}`, W/2, cy+185);

  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.15)`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(100,H-210); ctx.lineTo(W-100,H-210); ctx.stroke();

  // signature
  ctx.strokeStyle="#d1d5db"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-80,H-155); ctx.lineTo(W/2+80,H-155); ctx.stroke();
  ctx.fillStyle="#374151"; ctx.font=`700 ${fonts.bodySize-2}px "${F}"`;
  ctx.fillText(data.directorName||"اسم المدير", W/2, H-132);
  ctx.fillStyle="#9ca3af"; ctx.font=`500 ${fonts.bodySize-4}px "${F}"`;
  ctx.fillText("المدير التنفيذي", W/2, H-112);

  // logo
  if (logoImg) {
    const ls=70; ctx.save();
    roundRect(ctx,W-128,55,ls,ls,10);
    ctx.fillStyle="#fff"; ctx.fill();
    ctx.drawImage(logoImg,W-124,59,ls-8,ls-8);
    ctx.restore();
  }

  ctx.fillStyle="#d1d5db"; ctx.font=`400 10px "${F}"`; ctx.textAlign="right";
  ctx.fillText(`© ${new Date().getFullYear()} — ${data.centerName||"مركز التدريب"}`, W-55, H-45);
  ctx.textAlign="center";
}

// ═══════════════════════════════════════════════
// ─── TEMPLATE 2: Dark Neon ───
// ═══════════════════════════════════════════════
function drawDark(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg, fonts } = opts;
  const [W, H] = [ctx.canvas.width, ctx.canvas.height];
  const [ar,ag,ab] = hex2rgb(accent);
  const F = fonts.family;

  ctx.fillStyle="#0A0A0A"; ctx.fillRect(0,0,W,H);

  // glow blobs
  const g1 = ctx.createRadialGradient(W*.25,H*.4,0,W*.25,H*.4,W*.35);
  g1.addColorStop(0,`rgba(${ar},${ag},${ab},0.1)`); g1.addColorStop(1,"transparent");
  ctx.fillStyle=g1; ctx.fillRect(0,0,W,H);
  const g2 = ctx.createRadialGradient(W*.75,H*.6,0,W*.75,H*.6,W*.3);
  g2.addColorStop(0,"rgba(123,97,255,0.08)"); g2.addColorStop(1,"transparent");
  ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);

  // grid overlay
  ctx.strokeStyle="rgba(255,255,255,0.03)"; ctx.lineWidth=1;
  for(let x=0;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0;y<H;y+=40){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // glow border
  ctx.save(); roundRect(ctx,22,22,W-44,H-44,20);
  ctx.strokeStyle=accent; ctx.lineWidth=1.5; ctx.stroke();
  ctx.shadowColor=accent; ctx.shadowBlur=12; ctx.stroke(); ctx.restore();

  ctx.textAlign="center";

  // top bar
  const tb = ctx.createLinearGradient(0,0,W,0);
  tb.addColorStop(0,`rgba(${ar},${ag},${ab},0)`);
  tb.addColorStop(0.5,`rgba(${ar},${ag},${ab},0.12)`);
  tb.addColorStop(1,`rgba(${ar},${ag},${ab},0)`);
  ctx.fillStyle=tb; ctx.fillRect(50,50,W-100,90);

  ctx.fillStyle=accent; ctx.font=`700 ${fonts.bodySize}px "${F}"`;
  ctx.fillText(data.centerName||"مركز التدريب", W/2, 100);

  ctx.fillStyle="#fff"; ctx.font=`900 ${fonts.titleSize}px "${F}"`;
  ctx.fillText("شـهـادة تـقـدير", W/2, H*0.27);

  ctx.shadowColor=accent; ctx.shadowBlur=14;
  ctx.strokeStyle=accent; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(W/2-200,H*0.29); ctx.lineTo(W/2+200,H*0.29); ctx.stroke();
  ctx.shadowBlur=0;

  ctx.fillStyle="rgba(255,255,255,0.38)"; ctx.font=`500 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText("يُمنح هذه الشهادة إلى", W/2, H*0.38);

  ctx.font = fitFont(ctx, data.recipientName||"اسم المتدرب", W-200, fonts.nameSize, F);
  ctx.fillStyle=accent; ctx.shadowColor=accent; ctx.shadowBlur=18;
  ctx.fillText(data.recipientName||"اسم المتدرب", W/2, H*0.5);
  ctx.shadowBlur=0;

  const desc = data.description || `لإتمامه بنجاح دورة "${data.courseName||"اسم الدورة"}"`;
  ctx.fillStyle="rgba(255,255,255,0.65)"; ctx.font=`500 ${fonts.bodySize}px "${F}"`;
  ctx.fillText(desc, W/2, H*0.6);
  if (data.courseName && !data.description) {
    ctx.font = fitFont(ctx, data.courseName, W-240, fonts.bodySize+10, F, "700");
    ctx.fillStyle="#fff"; ctx.fillText(data.courseName, W/2, H*0.66);
  }

  ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.font=`400 ${fonts.bodySize-3}px "${F}"`;
  ctx.fillText(`بتاريخ: ${dateStr(data.certDate)}`, W/2, H*0.74);

  ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(100,H*0.8); ctx.lineTo(W-100,H*0.8); ctx.stroke();

  ctx.strokeStyle="rgba(255,255,255,0.12)";
  ctx.beginPath(); ctx.moveTo(W/2-80,H*0.87); ctx.lineTo(W/2+80,H*0.87); ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,0.75)"; ctx.font=`700 ${fonts.bodySize-2}px "${F}"`;
  ctx.fillText(data.directorName||"اسم المدير", W/2, H*0.9);
  ctx.fillStyle="rgba(255,255,255,0.28)"; ctx.font=`400 ${fonts.bodySize-4}px "${F}"`;
  ctx.fillText("المدير التنفيذي", W/2, H*0.93);

  if (logoImg) {
    const ls=68; ctx.save();
    roundRect(ctx,W-126,56,ls,ls,10);
    ctx.fillStyle="rgba(255,255,255,0.07)"; ctx.fill();
    ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.5)`; ctx.lineWidth=1; ctx.stroke();
    ctx.drawImage(logoImg,W-122,60,ls-8,ls-8); ctx.restore();
  }
}

// ═══════════════════════════════════════════════
// ─── TEMPLATE 3: Royal (portrait / landscape) ───
// ═══════════════════════════════════════════════
function drawRoyal(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg, fonts } = opts;
  const [W, H] = [ctx.canvas.width, ctx.canvas.height];
  const [ar,ag,ab] = hex2rgb(accent);
  const F = fonts.family;

  // ivory bg
  ctx.fillStyle="#FFF8EE"; ctx.fillRect(0,0,W,H);

  // full border with shadow
  ctx.save();
  roundRect(ctx,16,16,W-32,H-32,16);
  ctx.strokeStyle=accent; ctx.lineWidth=4; ctx.stroke();
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.2)`; ctx.lineWidth=1.5;
  ctx.strokeRect(28,28,W-56,H-56);
  ctx.restore();

  // top crown area
  const topH = H*0.14;
  const tg = ctx.createLinearGradient(0,0,W,0);
  tg.addColorStop(0,accent); tg.addColorStop(0.5,`rgba(${ar},${ag},${ab},0.8)`); tg.addColorStop(1,accent);
  ctx.fillStyle=tg; ctx.fillRect(30,30,W-60,topH);

  // decorative pattern in top strip
  ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1;
  for(let i=0;i<W;i+=20) {
    ctx.beginPath(); ctx.moveTo(30+i,30); ctx.lineTo(30+i,30+topH); ctx.stroke();
  }

  ctx.textAlign="center";
  ctx.fillStyle="#fff"; ctx.font=`900 ${Math.round(fonts.titleSize*0.45)}px "${F}"`;
  ctx.fillText(data.centerName||"مركز التدريب الاحترافي", W/2, 30+topH*0.45);
  ctx.font=`700 ${Math.round(fonts.titleSize*0.35)}px "${F}"`;
  ctx.fillStyle="rgba(255,255,255,0.8)";
  ctx.fillText("مُعتمد ومُرخّص", W/2, 30+topH*0.75);

  // logo in crown
  if (logoImg) {
    const ls=topH-14;
    ctx.save(); roundRect(ctx,W-40-ls,36,ls,ls,8);
    ctx.fillStyle="rgba(255,255,255,0.15)"; ctx.fill();
    ctx.drawImage(logoImg,W-37-ls,39,ls-6,ls-6); ctx.restore();
  }

  // center medallion
  const mx=W/2, my=30+topH+H*0.16;
  ctx.save();
  ctx.shadowColor=accent; ctx.shadowBlur=30;
  ctx.beginPath(); ctx.arc(mx,my,H*0.09,0,Math.PI*2);
  const mg=ctx.createRadialGradient(mx,my,0,mx,my,H*0.09);
  mg.addColorStop(0,`rgba(${ar},${ag},${ab},0.25)`);
  mg.addColorStop(1,`rgba(${ar},${ag},${ab},0.05)`);
  ctx.fillStyle=mg; ctx.fill();
  ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.stroke();
  ctx.shadowBlur=0; ctx.restore();

  // star in medallion
  ctx.fillStyle=accent; ctx.font=`${Math.round(H*0.07)}px serif`;
  ctx.fillText("★", mx, my+Math.round(H*0.025));

  const bodyTop = my+H*0.13;
  ctx.fillStyle="#6b7280"; ctx.font=`500 ${fonts.bodySize}px "${F}"`;
  ctx.fillText("تشهد إدارة المركز بأن", W/2, bodyTop);

  ctx.font = fitFont(ctx, data.recipientName||"اسم المتدرب", W-180, fonts.nameSize, F);
  ctx.fillStyle=accent; ctx.fillText(data.recipientName||"اسم المتدرب", W/2, bodyTop+H*0.1);
  const nw = ctx.measureText(data.recipientName||"اسم المتدرب").width;
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.5)`; ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(W/2-nw/2-15,bodyTop+H*0.105); ctx.lineTo(W/2+nw/2+15,bodyTop+H*0.105); ctx.stroke();

  const desc = data.description||`قد أتمّ بنجاح متطلبات دورة`;
  ctx.fillStyle="#374151"; ctx.font=`500 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText(desc, W/2, bodyTop+H*0.18);

  // course box
  const boxW=W-180, boxH=H*0.09;
  const bx=(W-boxW)/2, by=bodyTop+H*0.22;
  roundRect(ctx,bx,by,boxW,boxH,12);
  ctx.fillStyle=`rgba(${ar},${ag},${ab},0.07)`; ctx.fill();
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.25)`; ctx.lineWidth=1.5; ctx.stroke();
  ctx.font = fitFont(ctx, data.courseName||"اسم الدورة التدريبية", boxW-40, fonts.bodySize+8, F, "700");
  ctx.fillStyle=accent;
  ctx.fillText(data.courseName||"اسم الدورة التدريبية", W/2, by+boxH*0.62);

  ctx.fillStyle="#9ca3af"; ctx.font=`400 ${fonts.bodySize-4}px "${F}"`;
  ctx.fillText(`تاريخ الإصدار: ${dateStr(data.certDate)}`, W/2, bodyTop+H*0.42);

  // footer strip
  ctx.fillStyle=`rgba(${ar},${ag},${ab},0.08)`; ctx.fillRect(30,H-95,W-60,65);
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.2)`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(30,H-95); ctx.lineTo(W-30,H-95); ctx.stroke();

  const sig1x=W*0.3, sig2x=W*0.7;
  [[sig1x, data.directorName||"المدير التنفيذي","التوقيع"],[sig2x,"ختم المركز","الختم الرسمي"]].forEach(([sx,name,title]) => {
    ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.4)`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(+sx-70,H-85); ctx.lineTo(+sx+70,H-85); ctx.stroke();
    ctx.fillStyle="#374151"; ctx.font=`700 ${fonts.bodySize-3}px "${F}"`;
    ctx.fillText(String(name), +sx, H-66);
    ctx.fillStyle="#9ca3af"; ctx.font=`400 ${fonts.bodySize-5}px "${F}"`;
    ctx.fillText(String(title), +sx, H-50);
  });
}

// ═══════════════════════════════════════════════
// ─── TEMPLATE 4: Minimal (portrait-friendly) ───
// ═══════════════════════════════════════════════
function drawMinimal(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg, fonts } = opts;
  const [W, H] = [ctx.canvas.width, ctx.canvas.height];
  const [ar,ag,ab] = hex2rgb(accent);
  const F = fonts.family;

  ctx.fillStyle="#FFFFFF"; ctx.fillRect(0,0,W,H);

  // left accent bar
  const barW=8;
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,accent); bg.addColorStop(1,`rgba(${ar},${ag},${ab},0.3)`);
  ctx.fillStyle=bg; ctx.fillRect(0,0,barW,H);
  ctx.fillRect(W-barW,0,barW,H);

  // logo top
  if (logoImg) {
    const ls=60; ctx.save();
    roundRect(ctx,W/2-ls/2,32,ls,ls,10);
    ctx.fillStyle="#f9fafb"; ctx.fill();
    ctx.drawImage(logoImg,W/2-ls/2+4,36,ls-8,ls-8); ctx.restore();
  }

  ctx.textAlign="center";
  const top = logoImg ? 115 : 60;

  ctx.fillStyle=accent; ctx.font=`700 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText(data.centerName||"مركز التدريب", W/2, top);

  // thin divider
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.2)`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-60,top+14); ctx.lineTo(W/2+60,top+14); ctx.stroke();

  ctx.fillStyle="#111"; ctx.font=`900 ${fonts.titleSize}px "${F}"`;
  ctx.fillText("شهادة تقدير", W/2, top+H*0.12);

  ctx.fillStyle="#9ca3af"; ctx.font=`400 ${fonts.bodySize-2}px "${F}"`;
  ctx.fillText("يُمنح هذه الشهادة إلى السيد / السيدة", W/2, top+H*0.21);

  ctx.font = fitFont(ctx, data.recipientName||"اسم المتدرب", W-160, fonts.nameSize, F);
  ctx.fillStyle=accent; ctx.fillText(data.recipientName||"اسم المتدرب", W/2, top+H*0.31);

  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.3)`; ctx.lineWidth=2;
  const nw=ctx.measureText(data.recipientName||"اسم المتدرب").width;
  ctx.beginPath(); ctx.moveTo(W/2-nw/2,top+H*0.315); ctx.lineTo(W/2+nw/2,top+H*0.315); ctx.stroke();

  const desc = data.description||`تقديرًا لإتمامه بنجاح متطلبات`;
  ctx.fillStyle="#6b7280"; ctx.font=`400 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText(desc, W/2, top+H*0.41);

  // course highlight
  ctx.fillStyle=`rgba(${ar},${ag},${ab},0.05)`;
  const bw=W-160, bh=H*0.08;
  roundRect(ctx,(W-bw)/2,top+H*0.45,bw,bh,10);
  ctx.fill(); ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.15)`; ctx.lineWidth=1; ctx.stroke();
  ctx.font = fitFont(ctx, data.courseName||"اسم الدورة", bw-30, fonts.bodySize+6, F, "700");
  ctx.fillStyle=accent; ctx.fillText(data.courseName||"اسم الدورة", W/2, top+H*0.45+bh*0.62);

  ctx.fillStyle="#bbb"; ctx.font=`400 ${fonts.bodySize-4}px "${F}"`;
  ctx.fillText(`بتاريخ: ${dateStr(data.certDate)}`, W/2, top+H*0.59);

  // signature
  ctx.strokeStyle="#e5e7eb"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-70,H-130); ctx.lineTo(W/2+70,H-130); ctx.stroke();
  ctx.fillStyle="#374151"; ctx.font=`600 ${fonts.bodySize-3}px "${F}"`;
  ctx.fillText(data.directorName||"المدير التنفيذي", W/2, H-108);
  ctx.fillStyle="#bbb"; ctx.font=`400 ${fonts.bodySize-5}px "${F}"`;
  ctx.fillText("التوقيع والختم", W/2, H-90);

  ctx.fillStyle="#e5e7eb"; ctx.font=`400 10px "${F}"`; ctx.textAlign="left";
  ctx.fillText(`${data.centerName||"المركز"} · ${new Date().getFullYear()}`, barW+12, H-20);
  ctx.textAlign="center";
}

// ═══════════════════════════════════════════════
// ─── TEMPLATE 5: Bold Corporate ───
// ═══════════════════════════════════════════════
function drawBold(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg, fonts } = opts;
  const [W, H] = [ctx.canvas.width, ctx.canvas.height];
  const [ar,ag,ab] = hex2rgb(accent);
  const F = fonts.family;

  ctx.fillStyle="#FFFFFF"; ctx.fillRect(0,0,W,H);

  // header block
  const hh = H*0.18;
  ctx.fillStyle=accent; ctx.fillRect(0,0,W,hh);

  // header pattern
  for(let i=0;i<W;i+=30) {
    ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+hh,hh); ctx.stroke();
  }

  ctx.textAlign="center";
  if (logoImg) {
    const ls=hh-20;
    ctx.save(); roundRect(ctx,20,10,ls,ls,8);
    ctx.fillStyle="rgba(255,255,255,0.12)"; ctx.fill();
    ctx.drawImage(logoImg,24,14,ls-8,ls-8); ctx.restore();
  }
  ctx.fillStyle="rgba(255,255,255,0.85)"; ctx.font=`500 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText(data.centerName||"مركز التدريب الاحترافي", W/2, hh*0.38);
  ctx.fillStyle="#fff"; ctx.font=`900 ${fonts.titleSize*0.7}px "${F}"`;
  ctx.fillText("شهادة إتمام وتقدير", W/2, hh*0.75);

  // body
  ctx.fillStyle="#374151"; ctx.font=`400 ${fonts.bodySize}px "${F}"`;
  ctx.fillText("نشهد بأن المتدرب / المتدربة:", W/2, hh+H*0.11);

  ctx.font = fitFont(ctx, data.recipientName||"اسم المتدرب", W-180, fonts.nameSize*0.9, F,"900");
  ctx.fillStyle="#111"; ctx.fillText(data.recipientName||"اسم المتدرب", W/2, hh+H*0.22);
  const nw=ctx.measureText(data.recipientName||"اسم المتدرب").width;
  ctx.strokeStyle=accent; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(W/2-nw/2-8,hh+H*0.225); ctx.lineTo(W/2+nw/2+8,hh+H*0.225); ctx.stroke();

  const desc=data.description||"قد أتمّ بنجاح جميع متطلبات الدورة التدريبية";
  ctx.fillStyle="#6b7280"; ctx.font=`400 ${fonts.bodySize}px "${F}"`;
  ctx.fillText(desc, W/2, hh+H*0.32);

  const bw=W-140,bh=H*0.1;
  roundRect(ctx,(W-bw)/2, hh+H*0.37, bw, bh, 14);
  ctx.fillStyle=`rgba(${ar},${ag},${ab},0.07)`; ctx.fill();
  ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.stroke();
  ctx.font = fitFont(ctx, data.courseName||"اسم الدورة", bw-40, fonts.bodySize+10, F,"700");
  ctx.fillStyle=accent; ctx.fillText(data.courseName||"اسم الدورة التدريبية", W/2, hh+H*0.37+bh*0.62);

  ctx.fillStyle="#9ca3af"; ctx.font=`400 ${fonts.bodySize-3}px "${F}"`;
  ctx.fillText(`تاريخ الإصدار: ${dateStr(data.certDate)}`, W/2, hh+H*0.52);

  ctx.strokeStyle="#e5e7eb"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(60,H-160); ctx.lineTo(W-60,H-160); ctx.stroke();

  [[W*0.28,data.directorName||"المدير التنفيذي","التوقيع"],[W*0.72,"ختم المؤسسة","الختم الرسمي"]].forEach(([sx,name,title]) => {
    ctx.strokeStyle="#d1d5db"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(+sx-75,H-130); ctx.lineTo(+sx+75,H-130); ctx.stroke();
    ctx.fillStyle="#374151"; ctx.font=`700 ${fonts.bodySize-3}px "${F}"`;
    ctx.fillText(String(name),+sx,H-108);
    ctx.fillStyle="#9ca3af"; ctx.font=`400 ${fonts.bodySize-5}px "${F}"`;
    ctx.fillText(String(title),+sx,H-88);
  });

  // footer
  ctx.fillStyle=accent; ctx.fillRect(0,H-50,W,50);
  ctx.fillStyle="rgba(255,255,255,0.65)"; ctx.font=`400 11px "${F}"`;
  ctx.fillText(`${data.centerName||"مركز التدريب"} · جميع الحقوق محفوظة © ${new Date().getFullYear()}`, W/2, H-22);
}

// ═══════════════════════════════════════════════
// ─── TEMPLATE 6: Elegant (portrait) ───
// ═══════════════════════════════════════════════
function drawElegant(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg, fonts } = opts;
  const [W, H] = [ctx.canvas.width, ctx.canvas.height];
  const [ar,ag,ab] = hex2rgb(accent);
  const F = fonts.family;

  // gradient bg
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#0f0f14"); bg.addColorStop(0.5,"#14101e"); bg.addColorStop(1,"#0a0a10");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // border glow
  ctx.save(); roundRect(ctx,18,18,W-36,H-36,20);
  ctx.strokeStyle=accent; ctx.lineWidth=1;
  ctx.shadowColor=accent; ctx.shadowBlur=20; ctx.stroke();
  ctx.shadowBlur=0; ctx.restore();

  roundRect(ctx,30,30,W-60,H-60,14);
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.2)`; ctx.lineWidth=1; ctx.stroke();

  // top gold bar
  const tg=ctx.createLinearGradient(0,0,W,0);
  tg.addColorStop(0,`rgba(${ar},${ag},${ab},0)`);
  tg.addColorStop(0.35,accent); tg.addColorStop(0.65,accent);
  tg.addColorStop(1,`rgba(${ar},${ag},${ab},0)`);
  ctx.fillStyle=tg; ctx.fillRect(60,55,W-120,2);

  ctx.textAlign="center";
  if (logoImg) {
    const ls=64; ctx.save();
    ctx.beginPath(); ctx.arc(W/2,90,ls/2,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.05)"; ctx.fill();
    ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.5)`; ctx.lineWidth=1.5; ctx.stroke();
    ctx.clip(); ctx.drawImage(logoImg,W/2-ls/2+4,90-ls/2+4,ls-8,ls-8); ctx.restore();
  }

  const bodyStart = logoImg ? H*0.19 : H*0.12;
  ctx.fillStyle=accent; ctx.font=`700 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText(data.centerName||"مركز التدريب", W/2, bodyStart);

  ctx.fillStyle="#fff"; ctx.font=`900 ${fonts.titleSize}px "${F}"`;
  ctx.fillText("شـهـادة تـقـدير", W/2, bodyStart+H*0.1);

  // ornamental divider
  ctx.fillStyle=accent; ctx.font="22px serif";
  ctx.fillText("✦", W/2, bodyStart+H*0.15);
  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.4)`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-130,bodyStart+H*0.147); ctx.lineTo(W/2-22,bodyStart+H*0.147); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+22,bodyStart+H*0.147); ctx.lineTo(W/2+130,bodyStart+H*0.147); ctx.stroke();

  ctx.fillStyle="rgba(255,255,255,0.4)"; ctx.font=`400 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText("يُمنح هذه الشهادة إلى", W/2, bodyStart+H*0.22);

  ctx.font = fitFont(ctx, data.recipientName||"اسم المتدرب", W-160, fonts.nameSize, F);
  ctx.fillStyle=accent; ctx.shadowColor=accent; ctx.shadowBlur=15;
  ctx.fillText(data.recipientName||"اسم المتدرب", W/2, bodyStart+H*0.32);
  ctx.shadowBlur=0;

  const desc=data.description||`لإتمامه بنجاح دورة`;
  ctx.fillStyle="rgba(255,255,255,0.55)"; ctx.font=`400 ${fonts.bodySize-1}px "${F}"`;
  ctx.fillText(desc, W/2, bodyStart+H*0.41);

  ctx.font = fitFont(ctx, data.courseName||"اسم الدورة", W-200, fonts.bodySize+10, F,"700");
  ctx.fillStyle="#fff"; ctx.fillText(data.courseName||"اسم الدورة التدريبية", W/2, bodyStart+H*0.48);

  ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.font=`400 ${fonts.bodySize-4}px "${F}"`;
  ctx.fillText(`بتاريخ: ${dateStr(data.certDate)}`, W/2, bodyStart+H*0.56);

  ctx.fillStyle=tg; ctx.fillRect(60,H-55,W-120,1.5);

  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.25)`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-80,H-120); ctx.lineTo(W/2+80,H-120); ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.font=`600 ${fonts.bodySize-3}px "${F}"`;
  ctx.fillText(data.directorName||"المدير التنفيذي", W/2, H-98);
  ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.font=`400 ${fonts.bodySize-5}px "${F}"`;
  ctx.fillText("التوقيع", W/2, H-78);
}

// ─── dispatcher ───
function drawCertificate(canvas: HTMLCanvasElement, opts: DrawOpts) {
  const [W,H] = getSize(opts.orient);
  canvas.width=W; canvas.height=H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0,0,W,H);
  if (opts.template==="classic")   drawClassic(ctx,opts);
  else if (opts.template==="dark") drawDark(ctx,opts);
  else if (opts.template==="royal") drawRoyal(ctx,opts);
  else if (opts.template==="minimal") drawMinimal(ctx,opts);
  else if (opts.template==="bold")  drawBold(ctx,opts);
  else                              drawElegant(ctx,opts);
}

// ═══════════════════════════════════════════════
// ─── UI DATA ───
// ═══════════════════════════════════════════════
const TEMPLATES: { id: Template; label: string; desc: string; dark: boolean; preferred: Orientation }[] = [
  { id:"classic",  label:"كلاسيكي ذهبي",  desc:"إطار مزدوج · خلفية كريمية",       dark:false, preferred:"landscape" },
  { id:"dark",     label:"داكن نيون",       desc:"إضاءة نيون · أسلوب عصري",        dark:true,  preferred:"landscape" },
  { id:"royal",    label:"ملكي فاخر",       desc:"ميدالية وسط · شريط ذهبي",         dark:false, preferred:"landscape" },
  { id:"minimal",  label:"مينيمال نظيف",   desc:"بسيط · أبيض أنيق",               dark:false, preferred:"portrait"  },
  { id:"bold",     label:"مؤسسي جريء",     desc:"رأس ملوّن · توقيعات مزدوجة",      dark:false, preferred:"landscape" },
  { id:"elegant",  label:"إليجانت داكن",   desc:"ذهبي على أسود · لمعة فاخرة",     dark:true,  preferred:"portrait"  },
];

const ACCENT_PRESETS = ["#C9A84C","#00F5D4","#7B61FF","#3B82F6","#10B981","#EF4444","#F59E0B","#EC4899","#14B8A6","#8B5CF6"];

const FONT_SIZES = [
  { label:"صغير",  title:42, name:52, body:16 },
  { label:"متوسط", title:50, name:62, body:18 },
  { label:"كبير",  title:58, name:72, body:20 },
];

// ─── load google font ───
function loadGoogleFont(family: string, css: string): Promise<void> {
  return new Promise((resolve) => {
    const id = `gf-${family}`;
    if (document.getElementById(id)) { resolve(); return; }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${css}&display=swap`;
    link.onload = () => setTimeout(resolve, 600);
    document.head.appendChild(link);
  });
}

// ─── Page ───
export default function CertsPage() {
  const [data, setData] = useState<CertData>({
    recipientName:"", courseName:"",
    certDate: new Date().toISOString().split("T")[0],
    directorName:"", centerName:"", description:"",
  });
  const [template,    setTemplate]    = useState<Template>("classic");
  const [orient,      setOrient]      = useState<Orientation>("landscape");
  const [accent,      setAccent]      = useState("#C9A84C");
  const [logoUrl,     setLogoUrl]     = useState<string|null>(null);
  const [logoImg,     setLogoImg]     = useState<HTMLImageElement|null>(null);
  const [fontFamily,  setFontFamily]  = useState("Cairo");
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [fontLoading, setFontLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef   = useRef<HTMLInputElement>(null);

  // load logo
  useEffect(() => {
    if (!logoUrl) { setLogoImg(null); return; }
    const img = new Image(); img.onload=()=>setLogoImg(img); img.src=logoUrl;
  }, [logoUrl]);

  // set orientation when template changes
  useEffect(() => {
    const t = TEMPLATES.find(t=>t.id===template);
    if (t) setOrient(t.preferred);
    if (template==="classic") setAccent("#C9A84C");
    else if (template==="dark"||template==="elegant") setAccent("#00F5D4");
    else if (template==="royal") setAccent("#C9A84C");
    else setAccent("#3B82F6");
  }, [template]);

  // load font then draw
  useEffect(() => {
    if (!canvasRef.current) return;
    const fo = GOOGLE_FONTS.find(f=>f.id===fontFamily||f.label===fontFamily);
    const fs = FONT_SIZES[fontSizeIdx];
    const opts: DrawOpts = { data, template, orient, accent, logoImg, fonts:{ family: fo?.label||fontFamily, titleSize:fs.title, nameSize:fs.name, bodySize:fs.body } };

    setFontLoading(true);
    const familyToLoad = fo ? fo.id : fontFamily;
    const cssToLoad    = fo ? fo.css : `${familyToLoad}:wght@400;700;900`;
    loadGoogleFont(familyToLoad, cssToLoad).then(() => {
      if (canvasRef.current) {
        document.fonts.ready.then(() => {
          drawCertificate(canvasRef.current!, opts);
          setFontLoading(false);
        });
      }
    });
  }, [data, template, orient, accent, logoImg, fontFamily, fontSizeIdx]);

  const downloadPNG = useCallback(() => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `شهادة_${data.recipientName||"مجهول"}.png`;
    a.click();
  }, [data.recipientName]);

  const printCert = useCallback(() => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const win = window.open("","_blank","width=1300,height=950");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>شهادة</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f0f0}
img{max-width:98vw;max-height:96vh;object-fit:contain;box-shadow:0 6px 32px rgba(0,0,0,0.25)}
@media print{body{background:white}img{box-shadow:none;width:100%;height:auto}}</style>
</head><body><img src="${url}"/></body></html>`);
    win.document.close();
    setTimeout(()=>{ win.focus(); win.print(); },700);
  }, []);

  const upd = (k: keyof CertData) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setData(d=>({...d,[k]:e.target.value}));

  const inputCls = "w-full bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors";

  return (
    <main className="min-h-screen">
      <div className="pt-28 pb-20 px-4 max-w-[1400px] mx-auto">

        {/* header */}
        <div className="mb-6 text-center">
          <span className="section-badge mb-3 inline-flex">صانع الشهادات</span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">
            شهادات <span className="text-gradient">احترافية</span>
          </h1>
          <p className="text-gray-500 text-sm">6 قوالب · خطوط Google · أفقي وعمودي</p>
        </div>

        <div className="grid xl:grid-cols-[380px_1fr] gap-6 items-start">

          {/* ── SIDEBAR ── */}
          <div className="flex flex-col gap-4">

            {/* templates */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <LayoutTemplate size={13}/> القالب
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t=>(
                  <button key={t.id} onClick={()=>setTemplate(t.id)}
                    className={`p-3 rounded-xl text-right transition-all border ${
                      template===t.id ? "border-neon-cyan/40 bg-neon-cyan/8" : "border-glass-border hover:border-white/15"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-md shrink-0"
                        style={{ background: t.dark?"#0A0A0A":"#fff", border:`1.5px solid ${template===t.id?"#00F5D4":"rgba(255,255,255,0.15)"}` }}/>
                      <p className={`text-xs font-black leading-tight ${template===t.id?"text-neon-cyan":"text-white"}`}>{t.label}</p>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-tight">{t.desc}</p>
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: t.preferred==="portrait"?"rgba(123,97,255,0.15)":"rgba(0,245,212,0.1)", color: t.preferred==="portrait"?"#7B61FF":"#00F5D4" }}>
                      {t.preferred==="portrait"?"عمودي":"أفقي"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* orientation */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3">الاتجاه</p>
              <div className="flex gap-2">
                {(["landscape","portrait"] as Orientation[]).map(o=>(
                  <button key={o} onClick={()=>setOrient(o)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      orient===o ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-glass-border text-gray-500 hover:border-white/15"
                    }`}>
                    <div className={`border-2 rounded-sm ${orient===o?"border-neon-cyan":"border-gray-600"}`}
                      style={ o==="landscape" ? {width:22,height:15} : {width:15,height:22} }/>
                    {o==="landscape"?"أفقي":"عمودي"}
                  </button>
                ))}
              </div>
            </div>

            {/* font */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Type size={13}/> الخط
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {GOOGLE_FONTS.map(f=>(
                  <button key={f.id} onClick={()=>setFontFamily(f.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-right ${
                      fontFamily===f.id ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-glass-border text-gray-400 hover:border-white/15"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mb-2">حجم الخط</p>
              <div className="flex gap-2">
                {FONT_SIZES.map((s,i)=>(
                  <button key={i} onClick={()=>setFontSizeIdx(i)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      fontSizeIdx===i ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-glass-border text-gray-500"
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* trainee data */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Users size={13}/> بيانات المتدرب
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  {k:"recipientName", label:"اسم المتدرب *",    ph:"محمد أحمد العلي"},
                  {k:"courseName",    label:"اسم الدورة *",     ph:"دورة البرمجة المتقدمة"},
                ].map(({k,label,ph})=>(
                  <div key={k}>
                    <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
                    <input value={(data as any)[k]} onChange={upd(k as keyof CertData)}
                      placeholder={ph} className={inputCls}/>
                  </div>
                ))}
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">وصف مخصص (اختياري)</label>
                  <textarea value={data.description} onChange={upd("description")}
                    placeholder="لإتمامه بنجاح..." rows={2}
                    className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors resize-none"/>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">التاريخ</label>
                  <input type="date" value={data.certDate} onChange={upd("certDate")} dir="ltr" className={inputCls}/>
                </div>
              </div>
            </div>

            {/* center data */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <BookOpen size={13}/> بيانات المركز
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم المركز</label>
                  <input value={data.centerName} onChange={upd("centerName")} placeholder="مركز الإبداع للتدريب" className={inputCls}/>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم المدير</label>
                  <input value={data.directorName} onChange={upd("directorName")} placeholder="م. خالد الدوسري" className={inputCls}/>
                </div>
                {!logoUrl ? (
                  <button onClick={()=>logoRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold">
                    <ImagePlus size={14}/> رفع شعار المركز
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-glass rounded-xl border border-glass-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="logo" className="w-10 h-10 object-contain rounded-lg bg-white p-1"/>
                    <span className="flex-1 text-xs text-gray-400">تم رفع الشعار</span>
                    <button onClick={()=>setLogoUrl(null)} className="text-gray-600 hover:text-red-400 transition-colors"><X size={14}/></button>
                  </div>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={e=>e.target.files?.[0]&&(()=>{const r=new FileReader();r.onload=ev=>setLogoUrl(ev.target!.result as string);r.readAsDataURL(e.target.files![0])})()}/>
              </div>
            </div>

            {/* accent color */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3">لون التمييز</p>
              <div className="flex items-center gap-3 mb-3">
                <label className="relative w-10 h-10 rounded-xl overflow-hidden border border-glass-border cursor-pointer shrink-0">
                  <input type="color" value={accent} onChange={e=>setAccent(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"/>
                  <div className="w-full h-full" style={{background:accent}}/>
                </label>
                <input type="text" value={accent} onChange={e=>setAccent(e.target.value)}
                  maxLength={7} dir="ltr"
                  className="flex-1 bg-glass border border-glass-border rounded-xl px-3 py-2 text-xs font-mono text-gray-300 outline-none focus:border-neon-cyan/40"/>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_PRESETS.map(c=>(
                  <button key={c} onClick={()=>setAccent(c)}
                    className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                    style={{background:c, borderColor:accent===c?"white":"transparent"}}/>
                ))}
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-col gap-2">
              <button onClick={downloadPNG}
                className="flex items-center justify-center gap-2 py-3 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl hover:scale-105 active:scale-95 transition-transform">
                <Download size={16}/> تحميل PNG
              </button>
              <button onClick={printCert}
                className="flex items-center justify-center gap-2 py-3 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/20 transition-all">
                <Printer size={16}/> طباعة
              </button>
            </div>
          </div>

          {/* ── PREVIEW ── */}
          <div className="sticky top-24">
            <div className="glass-card rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-400">معاينة مباشرة</p>
                {fontLoading && (
                  <span className="text-[11px] text-neon-cyan animate-pulse">جارٍ تحميل الخط...</span>
                )}
              </div>
              <div className="w-full overflow-auto flex items-center justify-center bg-[#111] rounded-xl p-3"
                style={{ minHeight: orient==="portrait"?"600px":"400px" }}>
                <canvas ref={canvasRef}
                  className="max-w-full rounded-lg shadow-2xl"
                  style={{ imageRendering:"crisp-edges", maxHeight: orient==="portrait"?"800px":"500px" }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
