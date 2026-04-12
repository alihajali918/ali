"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "تعذّر الإرسال");
        setLoading(false);
        return;
      }
      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("تعذّر الاتصال بالخادم");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center">
        <CheckCircle className="mx-auto text-neon-cyan mb-4" size={48} strokeWidth={1.5} />
        <p className="text-white font-black text-lg mb-2">تم استلام رسالتك</p>
        <p className="text-gray-500 text-sm mb-6">سأتواصل معك قريباً عبر البريد.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="text-sm font-bold text-neon-cyan hover:underline"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-5">
      {/* حقل خفي ضد السبام — لا تملأه */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      />

      <div>
        <label htmlFor="contact-name" className="text-xs font-bold text-gray-400 mb-1.5 block">
          الاسم
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
          placeholder="اسمك الكامل"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="text-xs font-bold text-gray-400 mb-1.5 block">
          البريد الإلكتروني
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={150}
          dir="ltr"
          className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs font-bold text-gray-400 mb-1.5 block">
          الرسالة
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={3000}
          rows={6}
          className="w-full resize-y min-h-[140px] bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
          placeholder="صف مشروعك أو استفسارك…"
        />
        <p className="text-[10px] text-gray-600 mt-1 text-left" dir="ltr">
          {message.length} / 3000
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm font-bold text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2 px-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-shimmer flex items-center justify-center gap-2 w-full py-3.5 bg-neon-cyan text-dark-bg text-sm font-black rounded-xl glow-cyan-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        {loading ? "جاري الإرسال…" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
