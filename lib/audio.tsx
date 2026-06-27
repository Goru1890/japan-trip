"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type SoundName = "tap" | "complete" | "soft-open" | "ambient-loop";

const FILES: Record<SoundName, string> = {
  tap: "/assets/audio/tap.wav",
  complete: "/assets/audio/complete.wav",
  "soft-open": "/assets/audio/soft-open.wav",
  "ambient-loop": "/assets/audio/ambient-loop.wav",
};

// Quiet by design (frontend-guidelines: audio defaults off / very quiet).
const VOLUME: Record<SoundName, number> = {
  tap: 0.3,
  complete: 0.4,
  "soft-open": 0.35,
  "ambient-loop": 0.15,
};

const SOUND_KEY = "japan-trip:sound";

interface AudioContextValue {
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  play: (name: SoundName) => void;
  loaded: boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cache = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});

  useEffect(() => {
    try {
      setEnabledState(window.localStorage.getItem(SOUND_KEY) === "1");
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      try {
        let el = cache.current[name];
        if (!el) {
          el = new Audio(FILES[name]);
          el.volume = VOLUME[name];
          if (name === "ambient-loop") el.loop = true;
          cache.current[name] = el;
        }
        el.currentTime = 0;
        void el.play().catch(() => {
          // autoplay/user-gesture restrictions — ignore silently
        });
      } catch {
        // Audio unsupported — no-op
      }
    },
    [enabled]
  );

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    try {
      window.localStorage.setItem(SOUND_KEY, on ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  return (
    <AudioCtx.Provider value={{ enabled, setEnabled, play, loaded }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within <AudioProvider>");
  return ctx;
}
