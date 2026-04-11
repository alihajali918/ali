"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Download, ImagePlus, X, Printer, Users, BookOpen, Type, LayoutTemplate, Loader2, Sparkles, Bot, Palette, ZoomIn, ZoomOut, FileImage, PenLine } from "lucide-react";

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

// ─── Font type from API ───
interface GFont { family: string; variants: string[]; subsets: string[]; }

// helper: build CSS query string for a font
function fontCss(f: GFont) {
  const weights = f.variants
    .filter(v => /^\d+$/.test(v))
    .map(Number)
    .filter(w => [400,500,600,700,800,900].includes(w));
  const wghts = (weights.length ? weights : [400, 700]).join(";");
  return `${f.family.replace(/ /g, "+")}:wght@${wghts}`;
}

// Arabic subsets list
const ARABIC_SUBSETS = ["arabic", "persian", "urdu"];

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

// ─── load google font via FontFace API (works reliably in Canvas) ───
const loadedFonts = new Set<string>();

async function loadGoogleFont(fontName: string, css: string): Promise<void> {
  if (loadedFonts.has(fontName)) return;

  // 1. inject stylesheet so browser knows the URLs
  const id = `gf-${fontName.replace(/\s/g,"-")}`;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id   = id;
    link.rel  = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${css}&display=swap`;
    document.head.appendChild(link);
    // wait for stylesheet to parse
    await new Promise<void>(r => { link.onload = () => r(); setTimeout(r, 800); });
  }

  // 2. explicitly ask browser to load the font variants Canvas needs
  const weights = ["400", "700", "900"];
  await Promise.allSettled(
    weights.map(w =>
      document.fonts.load(`${w} 16px "${fontName}"`).catch(() => {})
    )
  );

  // 3. small buffer so glyphs are ready
  await new Promise<void>(r => setTimeout(r, 100));
  loadedFonts.add(fontName);
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
  const [fontFamily,   setFontFamily]   = useState("Cairo");
  const [fontSizeIdx,  setFontSizeIdx]  = useState(1);
  const [fontLoading,  setFontLoading]  = useState(false);
  const [fontSearch,   setFontSearch]   = useState("");
  const [previewFonts, setPreviewFonts] = useState<Set<string>>(new Set());
  const [gFonts,       setGFonts]       = useState<GFont[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [aiText,        setAiText]        = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiRemaining,   setAiRemaining]   = useState<number|null>(null);
  const [aiError,       setAiError]       = useState("");
  const [hasDesc,       setHasDesc]       = useState(false);
  const [descLoading,   setDescLoading]   = useState(false);
  const [certHours,     setCertHours]     = useState("");

  const [activeTab,    setActiveTab]    = useState<"ai"|"template"|"design"|"font">("ai");
  const [signatureUrl, setSignatureUrl] = useState<string|null>(null);
  const [signatureImg, setSignatureImg] = useState<HTMLImageElement|null>(null);
  const [bgImageUrl,   setBgImageUrl]   = useState<string|null>(null);
  const [bgImg,        setBgImg]        = useState<HTMLImageElement|null>(null);
  const [zoom,         setZoom]         = useState(1);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const logoRef      = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const bgRef        = useRef<HTMLInputElement>(null);

  // load signature + bg images
  useEffect(() => {
    if (!signatureUrl) { setSignatureImg(null); return; }
    const img = new Image(); img.onload=()=>setSignatureImg(img); img.src=signatureUrl;
  }, [signatureUrl]);
  useEffect(() => {
    if (!bgImageUrl) { setBgImg(null); return; }
    const img = new Image(); img.onload=()=>setBgImg(img); img.src=bgImageUrl;
  }, [bgImageUrl]);

  // fetch fonts from our proxy route on mount
  useEffect(() => {
    setFontsLoading(true);
    fetch("/api/fonts")
      .then(r => r.json())
      .then(d => {
        if (d.fonts) setGFonts(d.fonts);
      })
      .catch(() => {})
      .finally(() => setFontsLoading(false));
  }, []);

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

  // Gemini AI auto-fill
  const fillFromAI = useCallback(async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res  = await fetch("/api/gemini-cert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiText }),
      });
      const json = await res.json();
      if (res.status === 429) {
        setAiError(json.message || "وصلت الحد اليومي.");
      } else if (json.data) {
        setData(d => ({ ...d, ...json.data }));
        if (json.remaining !== undefined) setAiRemaining(json.remaining);
      }
    } catch {
      setAiError("حدث خطأ، حاول مجدداً.");
    }
    setAiLoading(false);
  }, [aiText]);

  // AI-generate description from course info
  const generateDesc = useCallback(async () => {
    if (!data.courseName.trim()) return;
    setDescLoading(true);
    setAiError("");
    try {
      const body = {
        prompt: `اقترح فقرة وصفية قصيرة (جملة واحدة فقط، لا تزيد عن 15 كلمة) تُكتب في شهادة تقدير.
المعلومات:
- اسم الدورة: ${data.courseName}
- اسم المتدرب: ${data.recipientName || "المتدرب"}
- عدد الساعات: ${certHours || "غير محدد"}
- اسم المركز: ${data.centerName || "المركز"}
أعد الجملة فقط بدون أي تفسير أو علامات اقتباس.`,
        mode: "desc",
      };
      const res  = await fetch("/api/gemini-cert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.status === 429) {
        setAiError(json.message || "وصلت الحد اليومي.");
      } else if (json.data?.description) {
        setData(d => ({ ...d, description: json.data.description }));
        if (json.remaining !== undefined) setAiRemaining(json.remaining);
      }
    } catch {
      setAiError("حدث خطأ، حاول مجدداً.");
    }
    setDescLoading(false);
  }, [data.courseName, data.recipientName, data.centerName, certHours]);

  // load font then draw
  useEffect(() => {
    if (!canvasRef.current) return;
    const gfont = gFonts.find(f => f.family === fontFamily);
    const fs    = FONT_SIZES[fontSizeIdx];
    const opts: DrawOpts = {
      data, template, orient, accent, logoImg,
      fonts: { family: fontFamily, titleSize: fs.title, nameSize: fs.name, bodySize: fs.body },
    };

    setFontLoading(true);
    const css = gfont ? fontCss(gfont) : `${fontFamily.replace(/ /g,"+")}:wght@400;700;900`;
    loadGoogleFont(fontFamily, css).then(() => {
      if (canvasRef.current) {
        drawCertificate(canvasRef.current, opts);
        setFontLoading(false);
      }
    });
  }, [data, template, orient, accent, logoImg, fontFamily, fontSizeIdx, gFonts]);

  const downloadPNG = useCallback(() => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `شهادة_${data.recipientName||"مجهول"}.png`;
    a.click();
  }, [data.recipientName]);

  const downloadPDF = useCallback(() => {
    if (!canvasRef.current) return;
    const url  = canvasRef.current.toDataURL("image/png");
    const [W,H] = getSize(orient);
    const isLand = orient === "landscape";
    const win = window.open("","_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>شهادة</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:${isLand?`${W}px ${H}px`:`${W}px ${H}px`};margin:0}
body{width:${W}px;height:${H}px;overflow:hidden}
img{width:${W}px;height:${H}px;display:block}
</style></head><body><img src="${url}"/></body></html>`);
    win.document.close();
    setTimeout(()=>{ win.focus(); win.print(); },500);
  }, [orient]);

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

  const TABS = [
    { id:"ai",       icon:<Bot size={18}/>,           label:"البيانات"  },
    { id:"template", icon:<LayoutTemplate size={18}/>, label:"القالب"   },
    { id:"design",   icon:<Palette size={18}/>,        label:"التصميم"  },
    { id:"font",     icon:<Type size={18}/>,            label:"الخط"     },
  ] as const;

  const uploadHelper = (setter: (u:string)=>void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setter(ev.target!.result as string); r.readAsDataURL(f);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden" style={{paddingTop:"4rem"}}>

      {/* ── top bar ── */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-b border-glass-border bg-dark-surface/80 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-black">صانع <span className="text-gradient">الشهادات</span></h1>
          <p className="text-[11px] text-gray-600">6 قوالب · خطوط Google · AI</p>
        </div>
        <div className="flex items-center gap-2">
          {fontLoading && <span className="text-[11px] text-neon-cyan animate-pulse">جارٍ تحميل الخط...</span>}
          {/* zoom */}
          <button onClick={()=>setZoom(z=>Math.max(0.4,+(z-0.1).toFixed(1)))} className="p-1.5 rounded-lg glass-card hover:border-white/20 text-gray-400"><ZoomOut size={14}/></button>
          <span className="text-xs text-gray-500 w-9 text-center">{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(2,+(z+0.1).toFixed(1)))} className="p-1.5 rounded-lg glass-card hover:border-white/20 text-gray-400"><ZoomIn size={14}/></button>
          <div className="w-px h-5 bg-glass-border mx-1"/>
          <button onClick={downloadPNG} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-cyan text-dark-bg font-black text-xs hover:scale-105 transition-transform">
            <Download size={13}/> PNG
          </button>
          <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-white font-bold text-xs hover:border-white/20 transition-all">
            <FileImage size={13}/> PDF
          </button>
          <button onClick={printCert} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-gray-400 text-xs hover:border-white/20 transition-all">
            <Printer size={13}/>
          </button>
        </div>
      </div>

      {/* ── main area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* tab icons */}
        <div className="shrink-0 w-14 flex flex-col items-center gap-1 py-3 border-l border-glass-border bg-dark-surface/60">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              title={t.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab===t.id?"bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30":"text-gray-600 hover:text-gray-300 hover:bg-white/4"}`}>
              {t.icon}
            </button>
          ))}
        </div>

        {/* tab panel */}
        <div className="shrink-0 w-80 border-l border-glass-border bg-dark-surface/40 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
            style={{scrollbarWidth:"thin",scrollbarColor:"rgba(0,245,212,0.15) transparent"}}>

            {/* ── TAB: AI + DATA ── */}
            {activeTab==="ai" && <>

              {/* AI agent */}
              <div className="rounded-2xl p-3 border border-neon-purple/20" style={{background:"rgba(123,97,255,0.04)"}}>
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><Bot size={12} className="text-neon-purple"/> مساعد الذكاء الاصطناعي</p>
                <textarea value={aiText} onChange={e=>setAiText(e.target.value)}
                  placeholder="مثال: شهادة لمحمد أحمد في دورة البرمجة من مركز الإبداع اليوم"
                  rows={3}
                  className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-purple/40 transition-colors resize-none mb-2"/>
                <button onClick={fillFromAI} disabled={aiLoading||!aiText.trim()||aiRemaining===0}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
                  style={{background:"linear-gradient(135deg,rgba(123,97,255,0.2),rgba(123,97,255,0.1))",border:"1px solid rgba(123,97,255,0.3)",color:"#7B61FF"}}>
                  {aiLoading?<><Loader2 size={12} className="animate-spin"/>جارٍ التحليل...</>:<><Sparkles size={12}/>تعبئة تلقائية</>}
                </button>
                {aiError && <p className="text-[10px] text-red-400 text-center mt-1.5">{aiError}</p>}
                {aiRemaining!==null&&!aiError&&(
                  <p className="text-[10px] text-gray-600 text-center mt-1">
                    باقي <span className={`font-bold ${aiRemaining<=3?"text-yellow-500":"text-gray-500"}`}>{aiRemaining}</span>/10 اليوم
                  </p>
                )}
              </div>

              {/* trainee */}
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><Users size={12}/> المتدرب</p>
                <div className="flex flex-col gap-2">
                  {([{k:"recipientName",ph:"محمد أحمد العلي"},{k:"courseName",ph:"دورة البرمجة المتقدمة"}] as {k:keyof CertData,ph:string}[]).map(({k,ph})=>(
                    <input key={k} value={data[k]} onChange={upd(k)} placeholder={ph}
                      className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"/>
                  ))}
                  <input type="date" value={data.certDate} onChange={upd("certDate")} dir="ltr"
                    className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan/40 transition-colors"/>

                  {/* description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-600">الوصف</span>
                      <div className="flex gap-1">
                        {["بدون","عندي"].map((l,i)=>(
                          <button key={l} onClick={()=>{setHasDesc(i===1);if(i===0)setData(d=>({...d,description:""}));}}
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all ${hasDesc===(i===1)?"border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan":"border-glass-border text-gray-600"}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                    {hasDesc&&(
                      <div className="flex flex-col gap-1.5">
                        <textarea value={data.description} onChange={upd("description")} placeholder="لإتمامه بنجاح..." rows={2}
                          className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 resize-none transition-colors"/>
                        <div className="flex gap-1.5">
                          <input value={certHours} onChange={e=>setCertHours(e.target.value)} placeholder="ساعات (اختياري)"
                            className="flex-1 bg-dark-bg border border-glass-border rounded-xl px-2 py-1.5 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-purple/40 transition-colors"/>
                          <button onClick={generateDesc} disabled={descLoading||!data.courseName.trim()}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all disabled:opacity-40 shrink-0"
                            style={{background:"rgba(123,97,255,0.1)",border:"1px solid rgba(123,97,255,0.3)",color:"#7B61FF"}}>
                            {descLoading?<Loader2 size={11} className="animate-spin"/>:<Sparkles size={11}/>} AI
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* center */}
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><BookOpen size={12}/> المركز</p>
                <div className="flex flex-col gap-2">
                  <input value={data.centerName} onChange={upd("centerName")} placeholder="مركز الإبداع للتدريب"
                    className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"/>
                  <input value={data.directorName} onChange={upd("directorName")} placeholder="م. خالد الدوسري"
                    className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"/>
                </div>
              </div>
            </>}

            {/* ── TAB: TEMPLATE ── */}
            {activeTab==="template" && <>
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><LayoutTemplate size={12}/> القالب</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t=>(
                    <button key={t.id} onClick={()=>setTemplate(t.id)}
                      className={`p-2.5 rounded-xl text-right transition-all border ${template===t.id?"border-neon-cyan/40 bg-neon-cyan/8":"border-glass-border hover:border-white/15"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-4 h-4 rounded shrink-0"
                          style={{background:t.dark?"#0A0A0A":"#fff",border:`1.5px solid ${template===t.id?"#00F5D4":"rgba(255,255,255,0.15)"}`}}/>
                        <p className={`text-[11px] font-black leading-tight ${template===t.id?"text-neon-cyan":"text-white"}`}>{t.label}</p>
                      </div>
                      <p className="text-[9px] text-gray-600">{t.desc}</p>
                      <span className="inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded-full"
                        style={{background:t.preferred==="portrait"?"rgba(123,97,255,0.15)":"rgba(0,245,212,0.1)",color:t.preferred==="portrait"?"#7B61FF":"#00F5D4"}}>
                        {t.preferred==="portrait"?"عمودي":"أفقي"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2">الاتجاه</p>
                <div className="flex gap-2">
                  {(["landscape","portrait"] as Orientation[]).map(o=>(
                    <button key={o} onClick={()=>setOrient(o)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all ${orient===o?"border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan":"border-glass-border text-gray-500"}`}>
                      <div className={`border-2 rounded-sm ${orient===o?"border-neon-cyan":"border-gray-600"}`}
                        style={o==="landscape"?{width:18,height:13}:{width:13,height:18}}/>
                      {o==="landscape"?"أفقي":"عمودي"}
                    </button>
                  ))}
                </div>
              </div>
            </>}

            {/* ── TAB: DESIGN ── */}
            {activeTab==="design" && <>
              {/* accent */}
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2">لون التمييز</p>
                <div className="flex items-center gap-2 mb-2">
                  <label className="relative w-9 h-9 rounded-xl overflow-hidden border border-glass-border cursor-pointer shrink-0">
                    <input type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer"/>
                    <div className="w-full h-full" style={{background:accent}}/>
                  </label>
                  <input type="text" value={accent} onChange={e=>setAccent(e.target.value)} maxLength={7} dir="ltr"
                    className="flex-1 bg-dark-bg border border-glass-border rounded-xl px-2 py-1.5 text-xs font-mono text-gray-300 outline-none focus:border-neon-cyan/40"/>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {ACCENT_PRESETS.map(c=>(
                    <button key={c} onClick={()=>setAccent(c)}
                      className="w-6 h-6 rounded-lg border-2 transition-all hover:scale-110"
                      style={{background:c,borderColor:accent===c?"white":"transparent"}}/>
                  ))}
                </div>
              </div>

              {/* logo */}
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><ImagePlus size={12}/> شعار المركز</p>
                {!logoUrl?(
                  <button onClick={()=>logoRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold">
                    <ImagePlus size={13}/> رفع الشعار
                  </button>
                ):(
                  <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-xl border border-glass-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="logo" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5"/>
                    <span className="flex-1 text-[11px] text-gray-500">تم رفع الشعار</span>
                    <button onClick={()=>setLogoUrl(null)} className="text-gray-600 hover:text-red-400"><X size={13}/></button>
                  </div>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadHelper(setLogoUrl)}/>
              </div>

              {/* signature */}
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><PenLine size={12}/> صورة التوقيع (اختياري)</p>
                {!signatureUrl?(
                  <button onClick={()=>signatureRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold">
                    <PenLine size={13}/> رفع التوقيع
                  </button>
                ):(
                  <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-xl border border-glass-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={signatureUrl} alt="sig" className="w-14 h-9 object-contain rounded bg-white/5"/>
                    <span className="flex-1 text-[11px] text-gray-500">تم رفع التوقيع</span>
                    <button onClick={()=>setSignatureUrl(null)} className="text-gray-600 hover:text-red-400"><X size={13}/></button>
                  </div>
                )}
                <input ref={signatureRef} type="file" accept="image/*" className="hidden" onChange={uploadHelper(setSignatureUrl)}/>
              </div>

              {/* bg image */}
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><FileImage size={12}/> خلفية مخصصة (اختياري)</p>
                {!bgImageUrl?(
                  <button onClick={()=>bgRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold">
                    <FileImage size={13}/> رفع خلفية
                  </button>
                ):(
                  <div className="flex items-center gap-2 p-2 bg-dark-bg rounded-xl border border-glass-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bgImageUrl} alt="bg" className="w-14 h-9 object-cover rounded"/>
                    <span className="flex-1 text-[11px] text-gray-500">تم رفع الخلفية</span>
                    <button onClick={()=>setBgImageUrl(null)} className="text-gray-600 hover:text-red-400"><X size={13}/></button>
                  </div>
                )}
                <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={uploadHelper(setBgImageUrl)}/>
              </div>
            </>}

            {/* ── TAB: FONT ── */}
            {activeTab==="font" && <>
              <div className="glass-card rounded-2xl p-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5"><Type size={12}/> الخط</p>
                <div className="relative mb-2">
                  <input value={fontSearch} onChange={e=>setFontSearch(e.target.value)}
                    placeholder="ابحث... Cairo, Amiri"
                    dir="auto"
                    className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors pr-7"/>
                  {fontSearch&&(
                    <button onClick={()=>setFontSearch("")} className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-600 hover:text-gray-300"><X size={11}/></button>
                  )}
                </div>
                <div className="mb-2 px-2 py-1.5 rounded-xl border border-neon-cyan/20 bg-neon-cyan/4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">الخط الحالي</span>
                  <span className="text-[11px] font-black text-neon-cyan">{fontFamily}</span>
                </div>
                {fontsLoading?(
                  <div className="flex items-center justify-center gap-2 py-5 text-gray-600 text-xs">
                    <Loader2 size={13} className="animate-spin"/> جارٍ التحميل...
                  </div>
                ):(
                  <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto"
                    style={{scrollbarWidth:"thin",scrollbarColor:"rgba(0,245,212,0.2) transparent"}}>
                    {(()=>{
                      const q=fontSearch.toLowerCase();
                      const filtered=gFonts.filter(f=>f.family.toLowerCase().includes(q));
                      const arabic=filtered.filter(f=>f.subsets.some(s=>ARABIC_SUBSETS.includes(s)));
                      const rest=filtered.filter(f=>!f.subsets.some(s=>ARABIC_SUBSETS.includes(s)));
                      const sorted=[...arabic,...rest];
                      if(!sorted.length) return <p className="text-[10px] text-gray-700 text-center py-4">لا نتائج</p>;
                      return sorted.map(f=>{
                        const isSel=fontFamily===f.family;
                        const isPrev=previewFonts.has(f.family);
                        const isAr=f.subsets.some(s=>ARABIC_SUBSETS.includes(s));
                        return (
                          <button key={f.family}
                            onClick={()=>setFontFamily(f.family)}
                            onMouseEnter={()=>{ if(!isPrev) loadGoogleFont(f.family,fontCss(f)).then(()=>setPreviewFonts(p=>new Set([...p,f.family]))); }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all ${isSel?"border-neon-cyan/40 bg-neon-cyan/8":"border-transparent hover:border-glass-border hover:bg-white/3"}`}>
                            <div className="flex items-center gap-1 min-w-0">
                              {isAr&&<span className="text-[8px] text-neon-cyan/60 shrink-0">ع</span>}
                              <span className={`text-[11px] font-bold truncate ${isSel?"text-neon-cyan":"text-gray-400"}`}>{f.family}</span>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0" style={{fontFamily:isPrev?`"${f.family}"`:undefined}}>
                              {isAr?"أبجد":"Abc"}
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-glass-border">
                  <p className="text-[10px] text-gray-600 mb-1.5">حجم الخط</p>
                  <div className="flex gap-1.5">
                    {FONT_SIZES.map((s,i)=>(
                      <button key={i} onClick={()=>setFontSizeIdx(i)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${fontSizeIdx===i?"border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan":"border-glass-border text-gray-500"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>}

          </div>
        </div>

        {/* ── CANVAS PREVIEW ── */}
        <div className="flex-1 flex items-center justify-center bg-[#0d0d0d] overflow-auto p-6">
          <div style={{transform:`scale(${zoom})`,transformOrigin:"center center",transition:"transform 0.2s"}}>
            <canvas ref={canvasRef}
              className="rounded-xl shadow-2xl block"
              style={{imageRendering:"crisp-edges"}}/>
          </div>
        </div>

      </div>

      {/* hidden file inputs */}
      <input ref={logoRef}      type="file" accept="image/*" className="hidden" onChange={uploadHelper(setLogoUrl)}/>
      <input ref={signatureRef} type="file" accept="image/*" className="hidden" onChange={uploadHelper(setSignatureUrl)}/>
      <input ref={bgRef}        type="file" accept="image/*" className="hidden" onChange={uploadHelper(setBgImageUrl)}/>

        <div className="hidden">
          {/* old sidebar removed */}
          <div className="flex flex-col gap-4">
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

            {/* font picker */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Type size={13}/> الخط
              </p>

              {/* search */}
              <div className="relative mb-3">
                <input
                  value={fontSearch}
                  onChange={e => setFontSearch(e.target.value)}
                  placeholder="ابحث عن خط... Cairo, Amiri"
                  dir="auto"
                  className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors pr-8"
                />
                {fontSearch && (
                  <button onClick={() => setFontSearch("")}
                    className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-600 hover:text-gray-300">
                    <X size={12}/>
                  </button>
                )}
              </div>

              {/* selected font display */}
              <div className="mb-3 px-3 py-2 rounded-xl border border-neon-cyan/20 bg-neon-cyan/4 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">الخط الحالي</span>
                <span className="text-xs font-black text-neon-cyan">{fontFamily}</span>
              </div>

              {/* font list */}
              {fontsLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-gray-600 text-xs">
                  <Loader2 size={14} className="animate-spin"/> جارٍ تحميل الخطوط...
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto overflow-x-hidden pl-1"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,245,212,0.2) transparent" }}>
                  {(() => {
                    const q = fontSearch.toLowerCase();
                    const filtered = gFonts.filter(f => f.family.toLowerCase().includes(q));
                    // Arabic-subset fonts first
                    const arabic = filtered.filter(f => f.subsets.some(s => ARABIC_SUBSETS.includes(s)));
                    const rest   = filtered.filter(f => !f.subsets.some(s => ARABIC_SUBSETS.includes(s)));
                    const sorted = [...arabic, ...rest];
                    if (!sorted.length) return <p className="text-[11px] text-gray-700 text-center py-4">لا توجد نتائج</p>;
                    return sorted.map(f => {
                      const isSelected  = fontFamily === f.family;
                      const isPreviewed = previewFonts.has(f.family);
                      const isArabic    = f.subsets.some(s => ARABIC_SUBSETS.includes(s));
                      return (
                        <button key={f.family}
                          onClick={() => setFontFamily(f.family)}
                          onMouseEnter={() => {
                            if (!isPreviewed) {
                              loadGoogleFont(f.family, fontCss(f)).then(() =>
                                setPreviewFonts(p => new Set([...p, f.family]))
                              );
                            }
                          }}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-right border transition-all ${
                            isSelected ? "border-neon-cyan/40 bg-neon-cyan/8" : "border-transparent hover:border-glass-border hover:bg-white/3"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isArabic && <span className="text-[9px] text-neon-cyan/60 shrink-0">ع</span>}
                            <span className={`text-xs font-bold truncate ${isSelected ? "text-neon-cyan" : "text-gray-400"}`}>
                              {f.family}
                            </span>
                          </div>
                          <span className="text-sm text-gray-300 shrink-0"
                            style={{ fontFamily: isPreviewed ? `"${f.family}"` : "inherit" }}>
                            {isArabic ? "أبجد ١٢٣" : "Abc 123"}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}

              {/* font size */}
              <div className="mt-3 pt-3 border-t border-glass-border">
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
            </div>

            {/* AI agent */}
            <div className="glass-card rounded-2xl p-4 border border-neon-purple/20">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Bot size={13} className="text-neon-purple"/> مساعد الذكاء الاصطناعي
              </p>
              <p className="text-[10px] text-gray-600 mb-2.5">
                اكتب وصفاً بالعربي وسيملأ الحقول تلقائياً
              </p>
              <textarea
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                placeholder="مثال: شهادة لمحمد علي في دورة تطوير الويب من مركز الإبداع بتاريخ اليوم"
                rows={3}
                className="w-full bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-purple/40 transition-colors resize-none mb-2.5"
              />
              <button
                onClick={fillFromAI}
                disabled={aiLoading || !aiText.trim() || aiRemaining === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, rgba(123,97,255,0.2), rgba(123,97,255,0.1))", border: "1px solid rgba(123,97,255,0.3)", color: "#7B61FF" }}
              >
                {aiLoading ? <><Loader2 size={13} className="animate-spin"/> جارٍ التحليل...</> : <><Sparkles size={13}/> تعبئة تلقائية</>}
              </button>

              {/* remaining / error */}
              {aiError && (
                <p className="text-[11px] text-red-400 text-center mt-1.5">{aiError}</p>
              )}
              {aiRemaining !== null && !aiError && (
                <p className="text-[11px] text-gray-600 text-center mt-1.5">
                  باقي <span className={`font-bold ${aiRemaining <= 3 ? "text-yellow-500" : "text-gray-500"}`}>{aiRemaining}</span> من 10 طلبات اليوم
                </p>
              )}
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
                {/* description toggle */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] text-gray-500">فقرة وصفية</label>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setHasDesc(false); setData(d=>({...d,description:""})); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${!hasDesc ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-glass-border text-gray-600"}`}>
                        بدون
                      </button>
                      <button onClick={() => setHasDesc(true)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${hasDesc ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-glass-border text-gray-600"}`}>
                        عندي
                      </button>
                    </div>
                  </div>

                  {hasDesc && (
                    <div className="flex flex-col gap-2">
                      <textarea value={data.description} onChange={upd("description")}
                        placeholder="لإتمامه بنجاح متطلبات الدورة التدريبية..."
                        rows={2}
                        className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors resize-none"/>

                      {/* AI suggest */}
                      <div className="flex gap-2">
                        <input
                          value={certHours}
                          onChange={e => setCertHours(e.target.value)}
                          placeholder="عدد الساعات (اختياري)"
                          className="flex-1 bg-dark-bg border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-purple/40 transition-colors"
                        />
                        <button
                          onClick={generateDesc}
                          disabled={descLoading || !data.courseName.trim()}
                          title="اقتراح بالذكاء الاصطناعي"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black border transition-all disabled:opacity-40 shrink-0"
                          style={{ background:"rgba(123,97,255,0.1)", border:"1px solid rgba(123,97,255,0.3)", color:"#7B61FF" }}
                        >
                          {descLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                          اقتراح AI
                        </button>
                      </div>
                    </div>
                  )}
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

          </div>
        </div>
    </main>
  );
}
