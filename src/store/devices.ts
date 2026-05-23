import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { initialDevices, type Device, type HistoryEntry } from "@/lib/api/voltrex";

interface DevicesState {
  devices: Device[];
  history: HistoryEntry[];
  toggle: (id: string) => void;
  pushHistory: (e: Omit<HistoryEntry, "id" | "ts"> & { ts?: number }) => void;
}

export const useDevices = create<DevicesState>()(
  persist(
    (set, get) => ({
      devices: initialDevices,
      history: [],
      toggle: (id) => {
        const dev = get().devices.find((d) => d.id === id);
        if (!dev) return;
        const next = dev.status === "on" ? "off" : "on";
        set({
          devices: get().devices.map((d) =>
            d.id === id ? { ...d, status: next } : d,
          ),
        });
        get().pushHistory({
          event: `${dev.name} turned ${next.toUpperCase()}`,
          detail: `${dev.room} · ${dev.watts}W`,
          level: "info",
        });
      },
      pushHistory: (e) =>
        set({
          history: [
            {
              id: Math.random().toString(36).slice(2, 10),
              ts: e.ts ?? Date.now(),
              event: e.event,
              detail: e.detail,
              level: e.level,
            },
            ...get().history,
          ].slice(0, 200),
        }),
    }),
    { name: "voltrex-devices" },
  ),
);
