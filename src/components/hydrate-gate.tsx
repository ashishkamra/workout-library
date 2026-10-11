import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

export function HydrateGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      useAppStore.getState().setHydrated();
      applyTheme(useAppStore.getState().settings.darkMode);
    });
    void useAppStore.persist.rehydrate();
    if (useAppStore.persist.hasHydrated()) {
      useAppStore.getState().setHydrated();
      applyTheme(useAppStore.getState().settings.darkMode);
    }
    return unsub;
  }, []);

  useEffect(() => {
    return useAppStore.subscribe((s, prev) => {
      if (s.settings.darkMode !== prev.settings.darkMode) {
        applyTheme(s.settings.darkMode);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return children;
}

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  if (dark) root.classList.remove("light");
  else root.classList.add("light");
}
