"use client";

import { useState } from "react";
import { useTripState, type SyncStatus } from "@/lib/state";

const STATUS_META: Record<SyncStatus, { label: string; dot: string }> = {
  idle: { label: "Loading…", dot: "bg-ink/30" },
  local: { label: "Saved on this device", dot: "bg-ink/40" },
  connecting: { label: "Connecting…", dot: "bg-lantern animate-pulse" },
  synced: { label: "Synced across devices", dot: "bg-matcha" },
  error: { label: "Sync error — still saved locally", dot: "bg-red" },
};

function randomCode() {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `trip-${id.replace(/-/g, "").slice(0, 10)}`;
}

export function SyncSettings() {
  const { syncCode, setSyncCode, syncStatus, loaded } = useTripState();
  const [draft, setDraft] = useState("");
  const meta = STATUS_META[syncStatus];
  const active = Boolean(syncCode);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-ink">Cross-device sync</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink/55">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
          {loaded ? meta.label : "Loading…"}
        </span>
      </div>

      {active ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-ink/70">
            Enter this code on another device (phone, laptop) to share the same
            checklist and dates:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="select-all rounded-md bg-ink/5 px-3 py-1.5 text-sm font-semibold tracking-wide text-ink">
              {syncCode}
            </code>
            <button
              onClick={() => navigator.clipboard?.writeText(syncCode ?? "")}
              className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
            >
              Copy
            </button>
            <button
              onClick={() => setSyncCode(null)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-ink/55 hover:text-red hover:underline"
            >
              Stop syncing
            </button>
          </div>
          {syncStatus === "error" && (
            <p className="text-xs text-red">
              Couldn&apos;t reach the sync server. Your data is safe locally;
              it&apos;ll retry on your next change.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-ink/70">
            Optional. By default everything saves in this browser. Turn on sync to
            carry your progress between devices.
          </p>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const code = draft.trim();
              if (code.length >= 4) setSyncCode(code);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter a sync code"
              className="min-w-0 flex-1 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30"
            />
            <button
              type="submit"
              disabled={draft.trim().length < 4}
              className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper disabled:opacity-40"
            >
              Use code
            </button>
            <button
              type="button"
              onClick={() => setSyncCode(randomCode())}
              className="rounded-md border border-ink/15 px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
            >
              Generate
            </button>
          </form>
          <p className="text-xs text-ink/55">
            Anyone with your code can read &amp; edit this trip — pick something
            non-obvious, like a passphrase. Needs the database to be set up on the
            deployment (see the README).
          </p>
        </div>
      )}
    </section>
  );
}
