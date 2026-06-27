"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error";
interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}
interface ConfirmState {
  msg: string;
  confirmLabel: string;
  resolve: (v: boolean) => void;
}

interface UIContextValue {
  toast: (msg: string, type?: ToastType) => void;
  confirm: (msg: string, confirmLabel?: string) => Promise<boolean>;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const idRef = useRef(0);
  const lastFocused = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const toast = useCallback((msg: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  const confirm = useCallback(
    (msg: string, confirmLabel = "Delete") => {
      lastFocused.current = document.activeElement as HTMLElement | null;
      return new Promise<boolean>((resolve) =>
        setConfirmState({ msg, confirmLabel, resolve })
      );
    },
    []
  );

  const resolveConfirm = useCallback(
    (v: boolean) => {
      confirmState?.resolve(v);
      setConfirmState(null);
      lastFocused.current?.focus?.();
    },
    [confirmState]
  );

  // Focus the dialog's confirm button on open; trap Tab; Escape cancels.
  useEffect(() => {
    if (!confirmState) return;
    const node = dialogRef.current;
    const focusables = node?.querySelectorAll<HTMLElement>("button");
    focusables?.[focusables.length - 1]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        resolveConfirm(false);
      } else if (e.key === "Tab" && focusables && focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmState, resolveConfirm]);

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts — announced to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto rounded-lg border bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft",
              t.type === "success" ? "border-matcha/50" : "border-red/50",
            ].join(" ")}
          >
            <span aria-hidden>{t.type === "success" ? "✓ " : "⚠ "}</span>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => resolveConfirm(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-msg"
            className="w-full max-w-sm rounded-lg border border-ink/10 bg-paper p-5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="confirm-msg" className="text-sm text-ink">
              {confirmState.msg}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => resolveConfirm(false)}
                className="rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className="rounded-md bg-red px-3 py-1.5 text-sm font-medium text-paper hover:bg-red/90"
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIProvider>");
  return ctx;
}
