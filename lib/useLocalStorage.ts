"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persist a JSON-serializable value in localStorage. Returns `loaded` so the UI
 * can avoid hydration flashes by waiting until the stored value is read.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed / unavailable storage
    }
    setLoaded(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore quota / unavailable storage
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set, loaded];
}
