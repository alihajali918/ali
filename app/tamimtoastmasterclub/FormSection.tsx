"use client";

import { useState } from "react";
import { CircleCheck, Loader2, ChevronDown } from "lucide-react";
import { getClubIcon } from "../lib/club-icons";
import { getContrastText } from "../lib/contrast";

type FieldType =
  | "SHORT_ANSWER" | "PARAGRAPH" | "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN"
  | "FILE_UPLOAD" | "LINEAR_SCALE" | "MC_GRID" | "CHECKBOX_GRID" | "DATE" | "TIME";

interface FieldDef {
  id: number;
  type: FieldType;
  label: string;
  required: boolean;
  config: {
    options?: string[]; allowOther?: boolean;
    min?: number; max?: number; minLabel?: string; maxLabel?: string;
    rows?: string[]; columns?: string[];
  };
}

interface FormDef {
  id: number;
  title: string;
  icon: string;
  color: string;
  fields: FieldDef[];
}

const inputCls = "w-full bg-white/90 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1c2b39] outline-none focus:border-current transition-colors";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FormSection({ form }: { form: FormDef }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [otherActive, setOtherActive] = useState<Record<number, boolean>>({});
  const [otherText, setOtherText] = useState<Record<number, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = getClubIcon(form.icon);

  const set = (fieldId: number, value: unknown) => setAnswers(a => ({ ...a, [fieldId]: value }));

  const setGridCell = (fieldId: number, row: string, value: unknown) => {
    setAnswers(a => ({ ...a, [fieldId]: { ...((a[fieldId] as Record<string, unknown>) || {}), [row]: value } }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const finalAnswers: Record<number, unknown> = { ...answers };
      for (const field of form.fields) {
        if (!field.config.allowOther || !otherActive[field.id]) continue;
        if (field.type === "CHECKBOXES") {
          const arr = (Array.isArray(answers[field.id]) ? answers[field.id] : []) as string[];
          finalAnswers[field.id] = otherText[field.id] ? [...arr, otherText[field.id]] : arr;
        } else {
          finalAnswers[field.id] = otherText[field.id] || "";
        }
      }
      const res = await fetch(`/api/tamimtoastmasterclub/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "حدث خطأ، يرجى المحاولة لاحقاً.");
        return;
      }
      setDone(true);
      setAnswers({});
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setSending(false);
    }
  };

  const textColor = getContrastText(form.color);

  return (
    <div className="rounded-2xl p-6 border border-white/10 shadow-lg" style={{ background: form.color }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between transition font-bold text-[1.125em]" style={{ color: textColor }}>
        <span className="flex items-center gap-3">
          <Icon size={22} />
          <span>{form.title}</span>
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={submit} className="mt-4 bg-white rounded-xl p-4 shadow-inner text-right text-[#1c2b39] flex flex-col gap-4">
          {done ? (
            <p className="text-emerald-700 font-semibold text-sm flex items-center gap-2 justify-center py-4">
              <CircleCheck size={18} /> تم إرسال ردّك، شكراً لك!
            </p>
          ) : (
            <>
              {form.fields.map(field => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "SHORT_ANSWER" && (
                    <input required={field.required} className={inputCls}
                      value={(answers[field.id] as string) || ""} onChange={e => set(field.id, e.target.value)} />
                  )}

                  {field.type === "PARAGRAPH" && (
                    <textarea required={field.required} rows={3} className={inputCls}
                      value={(answers[field.id] as string) || ""} onChange={e => set(field.id, e.target.value)} />
                  )}

                  {field.type === "DATE" && (
                    <input type="date" required={field.required} className={inputCls}
                      value={(answers[field.id] as string) || ""} onChange={e => set(field.id, e.target.value)} />
                  )}

                  {field.type === "TIME" && (
                    <input type="time" required={field.required} className={inputCls}
                      value={(answers[field.id] as string) || ""} onChange={e => set(field.id, e.target.value)} />
                  )}

                  {field.type === "DROPDOWN" && (
                    <div className="flex flex-col gap-1.5">
                      <select required={field.required} className={inputCls}
                        value={otherActive[field.id] ? "__other__" : (answers[field.id] as string) || ""}
                        onChange={e => {
                          if (e.target.value === "__other__") {
                            setOtherActive(a => ({ ...a, [field.id]: true }));
                          } else {
                            setOtherActive(a => ({ ...a, [field.id]: false }));
                            set(field.id, e.target.value);
                          }
                        }}>
                        <option value="" disabled>اختر...</option>
                        {(field.config.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        {field.config.allowOther && <option value="__other__">أخرى...</option>}
                      </select>
                      {field.config.allowOther && otherActive[field.id] && (
                        <input value={otherText[field.id] || ""} placeholder="اكتب إجابتك"
                          onChange={e => setOtherText(t => ({ ...t, [field.id]: e.target.value }))}
                          className={inputCls} />
                      )}
                    </div>
                  )}

                  {field.type === "MULTIPLE_CHOICE" && (
                    <div className="flex flex-col gap-1.5">
                      {(field.config.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={`field-${field.id}`} required={field.required}
                            checked={!otherActive[field.id] && answers[field.id] === opt}
                            onChange={() => { setOtherActive(a => ({ ...a, [field.id]: false })); set(field.id, opt); }} />
                          {opt}
                        </label>
                      ))}
                      {field.config.allowOther && (
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name={`field-${field.id}`}
                            checked={!!otherActive[field.id]}
                            onChange={() => setOtherActive(a => ({ ...a, [field.id]: true }))} />
                          أخرى:
                          <input value={otherText[field.id] || ""} disabled={!otherActive[field.id]}
                            onChange={e => setOtherText(t => ({ ...t, [field.id]: e.target.value }))}
                            className="flex-1 border-b border-gray-300 outline-none text-sm px-1 disabled:opacity-40" />
                        </label>
                      )}
                    </div>
                  )}

                  {field.type === "CHECKBOXES" && (
                    <div className="flex flex-col gap-1.5">
                      {(field.config.options || []).map(opt => {
                        const arr = (answers[field.id] as string[]) || [];
                        return (
                          <label key={opt} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={arr.includes(opt)}
                              onChange={e => set(field.id, e.target.checked ? [...arr, opt] : arr.filter(o => o !== opt))} />
                            {opt}
                          </label>
                        );
                      })}
                      {field.config.allowOther && (
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!otherActive[field.id]}
                            onChange={e => setOtherActive(a => ({ ...a, [field.id]: e.target.checked }))} />
                          أخرى:
                          <input value={otherText[field.id] || ""} disabled={!otherActive[field.id]}
                            onChange={e => setOtherText(t => ({ ...t, [field.id]: e.target.value }))}
                            className="flex-1 border-b border-gray-300 outline-none text-sm px-1 disabled:opacity-40" />
                        </label>
                      )}
                    </div>
                  )}

                  {field.type === "LINEAR_SCALE" && (
                    <div className="flex items-center gap-2">
                      {field.config.minLabel && <span className="text-xs text-gray-500 shrink-0">{field.config.minLabel}</span>}
                      <div className="flex gap-1.5 flex-1 justify-center">
                        {Array.from(
                          { length: (field.config.max ?? 5) - (field.config.min ?? 1) + 1 },
                          (_, i) => (field.config.min ?? 1) + i
                        ).map(n => (
                          <button key={n} type="button" onClick={() => set(field.id, n)}
                            className={`w-8 h-8 rounded-full text-xs font-bold border transition-colors ${
                              answers[field.id] === n ? "bg-[#00a3e0] text-white border-[#00a3e0]" : "border-gray-300 text-gray-600 hover:border-[#00a3e0]"
                            }`}>
                            {n}
                          </button>
                        ))}
                      </div>
                      {field.config.maxLabel && <span className="text-xs text-gray-500 shrink-0">{field.config.maxLabel}</span>}
                    </div>
                  )}

                  {(field.type === "MC_GRID" || field.type === "CHECKBOX_GRID") && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th />
                            {(field.config.columns || []).map(col => (
                              <th key={col} className="px-2 py-1 font-bold text-center whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(field.config.rows || []).map(row => {
                            const cell = (answers[field.id] as Record<string, unknown>)?.[row];
                            return (
                              <tr key={row} className="border-t border-gray-200">
                                <td className="px-2 py-2 font-semibold whitespace-nowrap">{row}</td>
                                {(field.config.columns || []).map(col => (
                                  <td key={col} className="px-2 py-2 text-center">
                                    {field.type === "MC_GRID" ? (
                                      <input type="radio" name={`field-${field.id}-${row}`}
                                        checked={cell === col} onChange={() => setGridCell(field.id, row, col)} />
                                    ) : (
                                      <input type="checkbox"
                                        checked={Array.isArray(cell) && cell.includes(col)}
                                        onChange={e => {
                                          const arr = (Array.isArray(cell) ? cell : []) as string[];
                                          setGridCell(field.id, row, e.target.checked ? [...arr, col] : arr.filter(c => c !== col));
                                        }} />
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {field.type === "FILE_UPLOAD" && (
                    <input type="file" required={field.required} accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,video/*"
                      onChange={async e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 4 * 1024 * 1024) { alert("الملف أكبر من 4 ميغا، اختر ملف أصغر."); e.target.value = ""; return; }
                        set(field.id, await fileToDataUrl(f));
                      }}
                      className="text-xs text-gray-600 file:ml-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#00a3e0]/15 file:text-[#00a3e0] file:text-xs file:font-bold" />
                  )}
                </div>
              ))}

              {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

              <button type="submit" disabled={sending}
                className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a3e0] text-white font-black text-sm disabled:opacity-60">
                {sending ? <Loader2 size={14} className="animate-spin" /> : null} إرسال
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
