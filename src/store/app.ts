import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Language } from "@/lib/i18n";

export type Theme = "light" | "dark" | "system";
export type PowerSource = "grid" | "solar" | "generator" | "off";

export interface AppNotification {
  id: string;
  ts: number;
  title: string;
  message: string;
  level: "info" | "warning" | "critical";
  read: boolean;
}

interface AppState {
  theme: Theme;
  language: Language;
  powerSource: PowerSource;
  energyUnits: number;
  notifications: AppNotification[];
  
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setPowerSource: (source: PowerSource) => void;
  setEnergyUnits: (units: number | ((prev: number) => number)) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "ts" | "read">) => void;
  markNotificationRead: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "dark", // default to dark
      language: "en",
      powerSource: "grid",
      energyUnits: 150.0, // Starting units
      notifications: [],

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setPowerSource: (powerSource) => set({ powerSource }),
      setEnergyUnits: (units) =>
        set({
          energyUnits: typeof units === "function" ? units(get().energyUnits) : units,
        }),
      pushNotification: (n) =>
        set({
          notifications: [
            {
              id: Math.random().toString(36).slice(2, 10),
              ts: Date.now(),
              read: false,
              ...n,
            },
            ...get().notifications,
          ].slice(0, 50),
        }),
      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }),
    }),
    {
      name: "voltrex-app-settings",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as never)
      ),
    }
  )
);
