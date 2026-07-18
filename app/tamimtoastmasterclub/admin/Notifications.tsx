"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface ToastItem { id: number; message: string; type: "success" | "error" | "info"; }
interface ConfirmState { message: string; resolve: (v: boolean) => void; }

interface Ctx {
  toast: (message: string, type?: "success" | "error" | "info") => void;
  confirmDialog: (message: string) => Promise<boolean>;
}

const NotificationsContext = createContext<Ctx | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const confirmDialog = useCallback((message: string) => {
    return new Promise<boolean>(resolve => setConfirmState({ message, resolve }));
  }, []);

  return (
    <NotificationsContext.Provider value={{ toast, confirmDialog }}>
      {children}

      {/* toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(24rem,92vw)] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-start gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold border pointer-events-auto ${
              t.type === "error" ? "bg-[#3a1414] border-red-500/30 text-red-300" :
              t.type === "success" ? "bg-[#0f2b22] border-emerald-500/30 text-emerald-300" :
              "bg-[#1c2b39] border-white/10 text-white"
            }`}>
            {t.type === "error" ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> :
             t.type === "success" ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> :
             <Info size={16} className="shrink-0 mt-0.5" />}
            <span className="flex-1 leading-relaxed">{t.message}</span>
          </div>
        ))}
      </div>

      {/* confirm modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1c2b39] border border-white/10 rounded-2xl p-5 shadow-2xl">
            <p className="text-sm text-gray-200 leading-relaxed mb-5">{confirmState.message}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { confirmState.resolve(false); setConfirmState(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => { confirmState.resolve(true); setConfirmState(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationsContext.Provider>
  );
}
