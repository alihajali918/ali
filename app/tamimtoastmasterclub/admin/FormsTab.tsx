"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Download, Eye, EyeOff,
  ArrowRight, Loader2, X, Pencil,
} from "lucide-react";
import IconPicker from "./IconPicker";
import ColorPicker from "./ColorPicker";
import { useNotifications } from "./Notifications";
import { getClubIcon } from "../../lib/club-icons";

type FieldType =
  | "SHORT_ANSWER" | "PARAGRAPH" | "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN"
  | "FILE_UPLOAD" | "LINEAR_SCALE" | "MC_GRID" | "CHECKBOX_GRID" | "DATE" | "TIME";

const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  SHORT_ANSWER: "إجابة قصيرة",
  PARAGRAPH: "فقرة",
  MULTIPLE_CHOICE: "اختيار من متعدد",
  CHECKBOXES: "مربعات اختيار",
  DROPDOWN: "قائمة منسدلة",
  FILE_UPLOAD: "رفع ملف",
  LINEAR_SCALE: "مقياس خطي",
  MC_GRID: "شبكة اختيار من متعدد",
  CHECKBOX_GRID: "شبكة مربعات اختيار",
  DATE: "تاريخ",
  TIME: "وقت",
};
const OPTION_TYPES: FieldType[] = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN"];
const GRID_TYPES: FieldType[] = ["MC_GRID", "CHECKBOX_GRID"];

interface FormRow {
  id: number; title: string; icon: string; color: string; textColor: string | null; order: number; active: boolean;
  _count: { fields: number; submissions: number };
}
interface FieldRow {
  id: number; type: FieldType; label: string; required: boolean; order: number;
  config: { options?: string[]; allowOther?: boolean; min?: number; max?: number; minLabel?: string; maxLabel?: string; rows?: string[]; columns?: string[] };
}

function TagListEditor({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...values, draft.trim()]);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#00a3e0]/50" />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-[#00a3e0]/20 text-[#00a3e0] rounded-lg text-xs font-bold shrink-0">
          <Plus size={13} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-red-400">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function FieldConfigEditor({ type, config, onChange }: { type: FieldType; config: FieldRow["config"]; onChange: (c: FieldRow["config"]) => void }) {
  if (OPTION_TYPES.includes(type)) {
    return (
      <div className="flex flex-col gap-2">
        <TagListEditor
          values={config.options || []}
          onChange={options => onChange({ ...config, options })}
          placeholder="أضف خياراً واضغط Enter"
        />
        <label className="flex items-center gap-2 text-xs text-gray-400">
          <input type="checkbox" checked={!!config.allowOther} onChange={e => onChange({ ...config, allowOther: e.target.checked })} />
          السماح بخيار "أخرى" (نص حر)
        </label>
      </div>
    );
  }
  if (type === "LINEAR_SCALE") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="من" value={config.min ?? 1}
          onChange={e => onChange({ ...config, min: Number(e.target.value) })}
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none" />
        <input type="number" placeholder="إلى" value={config.max ?? 5}
          onChange={e => onChange({ ...config, max: Number(e.target.value) })}
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none" />
        <input placeholder="تسمية البداية (اختياري)" value={config.minLabel || ""}
          onChange={e => onChange({ ...config, minLabel: e.target.value })}
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none" />
        <input placeholder="تسمية النهاية (اختياري)" value={config.maxLabel || ""}
          onChange={e => onChange({ ...config, maxLabel: e.target.value })}
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none" />
      </div>
    );
  }
  if (GRID_TYPES.includes(type)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">الصفوف (الأسئلة)</p>
          <TagListEditor values={config.rows || []} onChange={rows => onChange({ ...config, rows })} placeholder="أضف صف" />
        </div>
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">الأعمدة (الخيارات)</p>
          <TagListEditor values={config.columns || []} onChange={columns => onChange({ ...config, columns })} placeholder="أضف عمود" />
        </div>
      </div>
    );
  }
  return null;
}

function FieldsEditor({ form, onBack }: { form: FormRow; onBack: () => void }) {
  const { confirmDialog } = useNotifications();
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [type, setType] = useState<FieldType>("SHORT_ANSWER");
  const [label, setLabel] = useState("");
  const [required, setRequired] = useState(false);
  const [config, setConfig] = useState<FieldRow["config"]>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tamimtoastmasterclub/admin/forms/${form.id}/fields`);
    setFields(await res.json());
    setLoading(false);
  }, [form.id]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setEditingFieldId(null); setLabel(""); setRequired(false); setConfig({}); setType("SHORT_ANSWER");
  };

  const startEdit = (f: FieldRow) => {
    setEditingFieldId(f.id);
    setType(f.type);
    setLabel(f.label);
    setRequired(f.required);
    setConfig(f.config || {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;
    setSaving(true);
    if (editingFieldId) {
      await fetch(`/api/tamimtoastmasterclub/admin/forms/${form.id}/fields`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingFieldId, type, label, required, config }),
      });
    } else {
      await fetch(`/api/tamimtoastmasterclub/admin/forms/${form.id}/fields`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, label, required, config }),
      });
    }
    resetForm(); setSaving(false);
    load();
  };

  const remove = async (id: number) => {
    if (!await confirmDialog("حذف هذا الحقل؟")) return;
    await fetch(`/api/tamimtoastmasterclub/admin/forms/${form.id}/fields`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const reordered = [...fields];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await fetch(`/api/tamimtoastmasterclub/admin/forms/${form.id}/fields`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map(f => f.id) }),
    });
    load();
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white w-fit">
        <ArrowRight size={14} /> رجوع للنماذج
      </button>
      <h2 className="text-lg font-black">حقول: {form.title}</h2>

      <form onSubmit={save} className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
        {editingFieldId && (
          <p className="text-xs font-bold text-[#00a3e0]">تعديل حقل موجود</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select value={type} onChange={e => { setType(e.target.value as FieldType); setConfig({}); }}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none">
            {(Object.keys(FIELD_TYPE_LABEL) as FieldType[]).map(t => (
              <option key={t} value={t} style={{ background: "#0a1520", color: "#fff" }}>{FIELD_TYPE_LABEL[t]}</option>
            ))}
          </select>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="عنوان الحقل / السؤال"
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a3e0]/50" />
        </div>

        <FieldConfigEditor type={type} config={config} onChange={setConfig} />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
            حقل إلزامي
          </label>
          <div className="flex items-center gap-2">
            {editingFieldId && (
              <button type="button" onClick={resetForm} className="px-3 py-2 text-xs font-bold text-gray-400 hover:text-white">
                إلغاء
              </button>
            )}
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00a3e0] text-[#1c2b39] font-black text-xs rounded-lg disabled:opacity-60">
              <Plus size={14} /> {editingFieldId ? "حفظ التعديل" : "إضافة الحقل"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-[#00a3e0]" /></div>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((f, i) => (
            <div key={f.id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex flex-col shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === fields.length - 1}
                  className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20">
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{f.label} {f.required && <span className="text-red-400">*</span>}</p>
                <p className="text-[11px] text-gray-500">{FIELD_TYPE_LABEL[f.type]}</p>
              </div>
              <button onClick={() => startEdit(f)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#00a3e0] hover:bg-[#00a3e0]/10 shrink-0">
                <Pencil size={14} />
              </button>
              <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-gray-500 text-sm text-center py-6">لا توجد حقول بعد</p>}
        </div>
      )}
    </div>
  );
}

export default function FormsTab() {
  const { confirmDialog } = useNotifications();
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [metaEditId, setMetaEditId] = useState<number | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaIcon, setMetaIcon] = useState("ClipboardList");
  const [metaColor, setMetaColor] = useState("#00a3e0");
  const [metaTextColor, setMetaTextColor] = useState("#ffffff");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("ClipboardList");
  const [color, setColor] = useState("#00a3e0");
  const [textColor, setTextColor] = useState("#ffffff");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/tamimtoastmasterclub/admin/forms");
    setForms(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    await fetch("/api/tamimtoastmasterclub/admin/forms", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, icon, color, textColor }),
    });
    setTitle(""); setIcon("ClipboardList"); setColor("#00a3e0"); setTextColor("#ffffff"); setSaving(false);
    load();
  };

  const toggleActive = async (f: FormRow) => {
    await fetch("/api/tamimtoastmasterclub/admin/forms", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: f.id, active: !f.active }),
    });
    load();
  };

  const startMetaEdit = (f: FormRow) => {
    setMetaEditId(f.id); setMetaTitle(f.title); setMetaIcon(f.icon); setMetaColor(f.color); setMetaTextColor(f.textColor || "#ffffff");
  };

  const saveMeta = async () => {
    if (!metaEditId) return;
    setSaving(true);
    await fetch("/api/tamimtoastmasterclub/admin/forms", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: metaEditId, title: metaTitle, icon: metaIcon, color: metaColor, textColor: metaTextColor }),
    });
    setMetaEditId(null); setSaving(false);
    load();
  };

  const remove = async (id: number) => {
    if (!await confirmDialog("حذف هذا النموذج مع كل حقوله وردوده؟ لا يمكن التراجع.")) return;
    await fetch("/api/tamimtoastmasterclub/admin/forms", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= forms.length) return;
    const reordered = [...forms];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await fetch("/api/tamimtoastmasterclub/admin/forms", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map(f => f.id) }),
    });
    load();
  };

  const wipe = async (id: number) => {
    if (!await confirmDialog("مسح كل ردود هذا النموذج نهائياً؟ يفضّل تصدّرها لإكسل أول.")) return;
    await fetch(`/api/tamimtoastmasterclub/admin/forms/${id}/submissions`, { method: "DELETE" });
    load();
  };

  const editing = forms.find(f => f.id === editingId);
  if (editing) return <FieldsEditor form={editing} onBack={() => setEditingId(null)} />;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-lg font-black mb-2">النماذج المخصصة</h2>

      <form onSubmit={add} className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان النموذج"
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a3e0]/50" />
        <IconPicker value={icon} onChange={setIcon} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ColorPicker label="لون البوكس" value={color} onChange={setColor} />
          <ColorPicker label="لون الخط" value={textColor} onChange={setTextColor} />
        </div>
        <button type="submit" disabled={saving}
          className="self-start flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00a3e0] text-[#1c2b39] font-black text-xs rounded-lg disabled:opacity-60">
          <Plus size={14} /> إضافة نموذج
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-[#00a3e0]" /></div>
      ) : (
        <div className="flex flex-col gap-2">
          {forms.map((f, i) => {
            const Icon = getClubIcon(f.icon);
            if (metaEditId === f.id) {
              return (
                <div key={f.id} className="flex flex-col gap-3 bg-white/5 border border-[#00a3e0]/30 rounded-xl p-3">
                  <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00a3e0]/50" />
                  <IconPicker value={metaIcon} onChange={setMetaIcon} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ColorPicker label="لون البوكس" value={metaColor} onChange={setMetaColor} />
                    <ColorPicker label="لون الخط" value={metaTextColor} onChange={setMetaTextColor} />
                  </div>
                  <div className="flex items-center gap-2 self-end">
                    <button onClick={() => setMetaEditId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white">إلغاء</button>
                    <button onClick={saveMeta} disabled={saving}
                      className="px-4 py-1.5 bg-[#00a3e0] text-[#1c2b39] font-black text-xs rounded-lg disabled:opacity-60">حفظ</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={f.id} className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => move(i, 1)} disabled={i === forms.length - 1} className="p-0.5 rounded text-gray-500 hover:text-white disabled:opacity-20">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${f.color}20`, color: f.color }}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{f.title}</p>
                    <p className="text-[11px] text-gray-500">{f._count.fields} حقل · {f._count.submissions} رد</p>
                  </div>
                  <button onClick={() => startMetaEdit(f)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#00a3e0] hover:bg-[#00a3e0]/10 shrink-0">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => toggleActive(f)} title={f.active ? "إخفاء من الصفحة" : "إظهار بالصفحة"}
                    className={`p-1.5 rounded-lg shrink-0 ${f.active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-gray-600 hover:bg-white/5"}`}>
                    {f.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setEditingId(f.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#00a3e0] bg-[#00a3e0]/10 hover:bg-[#00a3e0]/20">
                    إدارة الحقول
                  </button>
                  <a href={`/api/tamimtoastmasterclub/admin/forms/${f.id}/export`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 bg-white/5 hover:bg-white/10">
                    <Download size={12} /> تصدير Excel
                  </a>
                  <button onClick={() => wipe(f.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10">
                    <Trash2 size={12} /> مسح الردود
                  </button>
                </div>
              </div>
            );
          })}
          {forms.length === 0 && <p className="text-gray-500 text-sm text-center py-6">لا توجد نماذج بعد</p>}
        </div>
      )}
    </div>
  );
}
