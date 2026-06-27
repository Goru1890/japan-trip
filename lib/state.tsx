"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { tripMeta } from "@/lib/trip";
import { STATE_KEY, SYNC_CODE_KEY } from "@/lib/constants";

/** The user's editable, syncable state — everything else is static content. */
export interface TripState {
  startDate: string;
  checklist: Record<string, boolean>;
  /** ms epoch of last edit; used for last-write-wins merge across devices. */
  updatedAt: number;
}

export type SyncStatus =
  | "idle" // not yet loaded
  | "local" // loaded, no cloud sync
  | "connecting" // talking to the server
  | "synced" // cloud sync active & up to date
  | "error"; // a sync request failed

interface TripStateContextValue {
  loaded: boolean;
  startDate: string;
  setStartDate: (date: string) => void;
  checklist: Record<string, boolean>;
  toggleChecklistItem: (key: string) => void;
  syncCode: string | null;
  setSyncCode: (code: string | null) => void;
  syncStatus: SyncStatus;
}

const defaultState: TripState = {
  startDate: tripMeta.defaultStartDate,
  checklist: {},
  updatedAt: 0,
};

const TripStateContext = createContext<TripStateContextValue | null>(null);

export function TripStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TripState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [syncCode, setSyncCodeState] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Always-current snapshot so async sync code reads fresh state without deps.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistLocal = useCallback((next: TripState) => {
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable / quota — keep working in memory
    }
  }, []);

  const pushToServer = useCallback(async (code: string, next: TripState) => {
    try {
      const res = await fetch(`/api/state?code=${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: next }),
      });
      const data = await res.json();
      if (!res.ok || data.configured === false) {
        setSyncStatus(data?.configured === false ? "local" : "error");
        return;
      }
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, []);

  // Pull from the server, then either adopt the cloud copy or push ours up.
  const connect = useCallback(
    async (code: string) => {
      setSyncStatus("connecting");
      try {
        const res = await fetch(`/api/state?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (!res.ok) {
          setSyncStatus("error");
          return;
        }
        if (data.configured === false) {
          setSyncStatus("local");
          return;
        }
        const server: TripState | null = data.state ?? null;
        const local = stateRef.current;
        if (server && server.updatedAt >= local.updatedAt) {
          stateRef.current = server;
          setState(server);
          persistLocal(server);
          setSyncStatus("synced");
        } else {
          await pushToServer(code, local);
        }
      } catch {
        setSyncStatus("error");
      }
    },
    [persistLocal, pushToServer]
  );

  // connect can change identity; call the latest from the once-only init effect.
  const connectRef = useRef(connect);
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Initial load (runs once).
  useEffect(() => {
    let parsed = defaultState;
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) parsed = { ...defaultState, ...JSON.parse(raw) };
    } catch {
      // ignore malformed storage
    }
    stateRef.current = parsed;
    setState(parsed);

    let code: string | null = null;
    try {
      code = window.localStorage.getItem(SYNC_CODE_KEY);
    } catch {
      // ignore
    }
    setSyncCodeState(code);
    setLoaded(true);

    if (code) void connectRef.current(code);
    else setSyncStatus("local");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply a change: update memory + localStorage, and debounce a cloud push.
  const update = useCallback(
    (mutate: (prev: TripState) => TripState) => {
      setState((prev) => {
        const next = { ...mutate(prev), updatedAt: Date.now() };
        stateRef.current = next;
        persistLocal(next);
        if (syncCode) {
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(
            () => pushToServer(syncCode, next),
            600
          );
        }
        return next;
      });
    },
    [persistLocal, pushToServer, syncCode]
  );

  const setStartDate = useCallback(
    (date: string) => update((prev) => ({ ...prev, startDate: date })),
    [update]
  );

  const toggleChecklistItem = useCallback(
    (key: string) =>
      update((prev) => ({
        ...prev,
        checklist: { ...prev.checklist, [key]: !prev.checklist[key] },
      })),
    [update]
  );

  const setSyncCode = useCallback(
    (code: string | null) => {
      setSyncCodeState(code);
      try {
        if (code) window.localStorage.setItem(SYNC_CODE_KEY, code);
        else window.localStorage.removeItem(SYNC_CODE_KEY);
      } catch {
        // ignore
      }
      if (code) void connect(code);
      else setSyncStatus("local");
    },
    [connect]
  );

  const value: TripStateContextValue = {
    loaded,
    startDate: state.startDate,
    setStartDate,
    checklist: state.checklist,
    toggleChecklistItem,
    syncCode,
    setSyncCode,
    syncStatus,
  };

  return (
    <TripStateContext.Provider value={value}>
      {children}
    </TripStateContext.Provider>
  );
}

export function useTripState(): TripStateContextValue {
  const ctx = useContext(TripStateContext);
  if (!ctx) {
    throw new Error("useTripState must be used within <TripStateProvider>");
  }
  return ctx;
}
