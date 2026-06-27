"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/ui";

/**
 * A delete/destructive button: opens the app's styled confirm modal, then runs
 * a server action (with the given fields as FormData), shows a toast, refreshes.
 */
export function DangerButton({
  action,
  fields,
  confirm,
  toast,
  label,
  className,
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  confirm: string;
  toast?: string;
  label: string;
  className?: string;
}) {
  const ui = useUI();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    void ui.confirm(confirm).then((ok) => {
      if (!ok) return;
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, String(v));
      startTransition(async () => {
        await action(fd);
        if (toast) ui.toast(toast);
        router.refresh();
      });
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={className}
    >
      {label}
    </button>
  );
}
