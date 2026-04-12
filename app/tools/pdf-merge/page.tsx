"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ArrowUp, ArrowDown, FileText, ImageIcon, Download, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";

const MAX_PAGES = 50;

type FileKind = "pdf" | "image";

interface PageItem {
  id:       string;
  kind:     FileKind;
  name:     string;
  size:     number;
  preview:  string;       // data URL (thumbnail for images, blank icon for PDFs)
  data:     ArrayBuffer;  // raw file bytes
  pageCount?: number;     // only for PDFs
}

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function countPdfPages(buf: ArrayBuffer): Promise<number> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch {
    return 1;
  }
}

// Render first page of PDF as image thumbnail
async function pdfThumb(buf: ArrayBuffer): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdf   = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
    const page  = await pdf.getPage(1);
    const vp    = page.getViewport({ scale: 0.4 });
    const canvas = document.createElement("canvas");
    canvas.width  = vp.width;
    canvas.height = vp.height;
    await page.render({ canvas, viewport: vp }).promise;
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return "";
  }
}

function DragHandle({ controls }: { controls: ReturnType<typeof useDragControls> }) {
  return (
    <div
      onPointerDown={e => controls.start(e)}
      className="touch-none cursor-grab active:cursor-grabbing px-1 text-gray-700 hover:text-gray-400 transition-colors shrink-0">
      <GripVertical size={16}/>
    </div>
  );
}

function FileRow({
  item, idx, total, onRemove, onMove,
}: {
  item: PageItem;
  idx: number;
  total: number;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 p-3 rounded-2xl border border-white/6 bg-[#111] select-none">

      <DragHandle controls={controls}/>

      {/* thumbnail */}
      <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-[#0a0a0a] flex items-center justify-center border border-white/5">
        {item.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.preview} alt={item.name} className="w-full h-full object-cover"/>
        ) : item.kind === "pdf" ? (
          <FileText size={22} className="text-red-400/60"/>
        ) : (
          <ImageIcon size={22} className="text-neon-cyan/40"/>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            item.kind === "pdf"
              ? "bg-red-500/10 text-red-400"
              : "bg-neon-cyan/10 text-neon-cyan"
          }`}>
            {item.kind === "pdf" ? `PDF · ${item.pageCount ?? "?"} صفحة` : "صورة"}
          </span>
          <span className="text-[10px] text-gray-600">{fmt(item.size)}</span>
        </div>
      </div>

      {/* page index */}
      <div className="shrink-0 w-7 h-7 rounded-lg bg-white/4 flex items-center justify-center text-[10px] font-black text-gray-500">
        {idx + 1}
      </div>

      {/* up/down */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => onMove(-1)} disabled={idx === 0}
          className="w-6 h-6 rounded-lg bg-white/4 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all">
          <ArrowUp size={11}/>
        </button>
        <button onClick={() => onMove(1)} disabled={idx === total - 1}
          className="w-6 h-6 rounded-lg bg-white/4 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all">
          <ArrowDown size={11}/>
        </button>
      </div>

      {/* remove */}
      <button onClick={onRemove}
        className="w-8 h-8 rounded-xl flex items-center justify-center glass-card text-gray-600 hover:text-red-400 transition-all shrink-0">
        <X size={14}/>
      </button>
    </Reorder.Item>
  );
}

export default function PdfMergePage() {
  const [items,     setItems]     = useState<PageItem[]>([]);
  const [building,  setBuilding]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [outputName, setOutputName] = useState("merged");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalPages = items.reduce((s, i) => s + (i.pageCount ?? 1), 0);
  const canAdd     = totalPages < MAX_PAGES;

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/") && f.type !== "application/pdf") continue;

      const buf = await f.arrayBuffer();

      if (f.type === "application/pdf") {
        const pageCount = await countPdfPages(buf);
        const thumb     = await pdfThumb(buf);
        setItems(prev => {
          const curPages = prev.reduce((s, i) => s + (i.pageCount ?? 1), 0);
          if (curPages + pageCount > MAX_PAGES) return prev;
          return [...prev, {
            id: Math.random().toString(36).slice(2),
            kind: "pdf", name: f.name, size: f.size,
            preview: thumb, data: buf, pageCount,
          }];
        });
      } else {
        // image
        const reader = new FileReader();
        reader.onload = e => {
          setItems(prev => {
            const curPages = prev.reduce((s, i) => s + (i.pageCount ?? 1), 0);
            if (curPages + 1 > MAX_PAGES) return prev;
            return [...prev, {
              id: Math.random().toString(36).slice(2),
              kind: "image", name: f.name, size: f.size,
              preview: e.target!.result as string, data: buf, pageCount: 1,
            }];
          });
        };
        reader.readAsDataURL(f);
      }
    }
  };

  const remove = (id: string) =>
    setItems(p => p.filter(i => i.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const to   = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  const buildPDF = useCallback(async () => {
    if (!items.length) return;
    setBuilding(true);
    setProgress(0);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(Math.round(((i + 0.5) / items.length) * 100));

        if (item.kind === "pdf") {
          const src   = await PDFDocument.load(item.data, { ignoreEncryption: true });
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach(p => merged.addPage(p));

        } else {
          // image
          const ext  = item.name.split(".").pop()?.toLowerCase() ?? "";
          const isJpg = ["jpg","jpeg"].includes(ext);
          const isPng = ext === "png";

          let embeddedImg;
          if (isPng) {
            embeddedImg = await merged.embedPng(item.data);
          } else {
            // For webp or other formats, convert via canvas first
            if (!isJpg) {
              const blob   = new Blob([item.data], { type: `image/${ext}` });
              const bmpUrl = URL.createObjectURL(blob);
              const img    = new Image();
              await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = bmpUrl; });
              const canvas = document.createElement("canvas");
              canvas.width  = img.width;
              canvas.height = img.height;
              canvas.getContext("2d")!.drawImage(img, 0, 0);
              URL.revokeObjectURL(bmpUrl);
              const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
              const base64 = jpgDataUrl.split(",")[1];
              const jpgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
              embeddedImg = await merged.embedJpg(jpgBytes);
            } else {
              embeddedImg = await merged.embedJpg(item.data);
            }
          }

          const { width, height } = embeddedImg;
          const page = merged.addPage([width, height]);
          page.drawImage(embeddedImg, { x: 0, y: 0, width, height });
        }

        setProgress(Math.round(((i + 1) / items.length) * 100));
      }

      const bytes = await merged.save();
      const blob  = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement("a");
      a.href      = url;
      a.download  = (outputName.trim() || "merged") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBuilding(false);
      setProgress(0);
    }
  }, [items, outputName]);

  return (
    <main className="h-screen flex flex-col overflow-hidden" style={{ paddingTop: "4rem" }}>

      {/* top bar */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-b border-white/6 bg-[#111]/80 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-black">دمج <span className="text-gradient">PDF</span></h1>
          <p className="text-[11px] text-gray-600">ارفع صور وملفات PDF · رتّبها · حمّل الملف النهائي</p>
        </div>
        <div className="flex items-center gap-3">
          {/* filename input */}
          <div className="relative">
            <input
              value={outputName}
              onChange={e => setOutputName(e.target.value)}
              placeholder="اسم الملف"
              className="bg-[#0a0a0a] border border-white/8 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan/40 transition-colors w-36 text-right"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600">.pdf</span>
          </div>
          <button onClick={buildPDF} disabled={!items.length || building}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-neon-cyan text-dark-bg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40">
            <Download size={15}/>
            {building ? `${progress}%` : "تحميل PDF"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* sidebar stats */}
        <div className="shrink-0 w-64 border-l border-white/6 bg-[#0d0d0d] flex flex-col overflow-y-auto p-4 gap-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>

          {/* stats */}
          <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-[11px] font-bold text-gray-500">إحصاءات</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
                <p className="text-xl font-black text-white">{items.length}</p>
                <p className="text-[10px] text-gray-600">ملف</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl p-2.5 text-center">
                <p className={`text-xl font-black ${totalPages >= MAX_PAGES ? "text-red-400" : "text-neon-cyan"}`}>
                  {totalPages}
                </p>
                <p className="text-[10px] text-gray-600">صفحة / {MAX_PAGES}</p>
              </div>
            </div>

            {/* progress bar */}
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (totalPages / MAX_PAGES) * 100)}%`,
                  background: totalPages >= MAX_PAGES
                    ? "rgba(239,68,68,0.8)"
                    : "linear-gradient(90deg, #00F5D4, #7B61FF)",
                }}/>
            </div>
            <p className="text-[10px] text-gray-600 text-center">
              {MAX_PAGES - totalPages > 0
                ? `${MAX_PAGES - totalPages} صفحة متاحة`
                : "وصلت للحد الأقصى"}
            </p>
          </div>

          {/* file types */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-2.5">الأنواع المدعومة</p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "ملفات PDF", color: "text-red-400", icon: "📄", desc: "تُضاف صفحاتها كاملةً" },
                { label: "صور JPG / PNG", color: "text-neon-cyan", icon: "🖼", desc: "كل صورة = صفحة واحدة" },
                { label: "صور WebP", color: "text-neon-cyan", icon: "🌐", desc: "تُحوَّل تلقائياً" },
              ].map(t => (
                <div key={t.label} className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{t.icon}</span>
                  <div>
                    <p className={`text-[11px] font-bold ${t.color}`}>{t.label}</p>
                    <p className="text-[10px] text-gray-600">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* tip */}
          <div className="px-3 py-2.5 rounded-xl border border-white/5 bg-neon-cyan/3">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              اسحب العناصر بالمقبض <span className="text-neon-cyan">⣿</span> لإعادة الترتيب، أو استخدم أسهم الأعلى والأسفل
            </p>
          </div>

          {items.length > 0 && (
            <button onClick={() => setItems([])}
              className="text-center py-2 rounded-xl border border-red-500/15 text-red-500 text-xs font-bold hover:bg-red-500/8 transition-all">
              مسح الكل
            </button>
          )}
        </div>

        {/* main area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">

          {/* drop zone */}
          <div
            onClick={() => canAdd && inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className={`mx-6 mt-6 shrink-0 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 py-5 transition-all
              ${canAdd
                ? "border-white/8 cursor-pointer hover:border-neon-cyan/30 hover:bg-neon-cyan/2"
                : "border-red-500/20 bg-red-500/3 cursor-not-allowed opacity-60"}`}>
            <Upload size={18} className={canAdd ? "text-neon-cyan" : "text-red-400"}/>
            <div>
              <p className="text-sm font-bold text-gray-400">
                {canAdd ? "اسحب ملفات PDF أو صور، أو اضغط للرفع" : `وصلت للحد الأقصى (${MAX_PAGES} صفحة)`}
              </p>
              <p className="text-[11px] text-gray-700">PDF · JPG · PNG · WEBP</p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple className="hidden"
            onChange={e => addFiles(e.target.files)}/>

          {/* building progress bar */}
          {building && (
            <div className="mx-6 mt-3 shrink-0">
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #00F5D4, #7B61FF)" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}/>
              </div>
              <p className="text-[10px] text-gray-600 mt-1 text-center">جارٍ البناء... {progress}%</p>
            </div>
          )}

          {/* list */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-neon-cyan/5 flex items-center justify-center">
                  <FileText size={26} className="text-neon-cyan/30"/>
                </div>
                <p className="text-gray-700 text-sm">ارفع ملفات PDF أو صور للبدء</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={setItems}
                className="flex flex-col gap-2.5">
                <AnimatePresence initial={false}>
                  {items.map((item, idx) => (
                    <FileRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      total={items.length}
                      onRemove={() => remove(item.id)}
                      onMove={dir => move(item.id, dir)}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
