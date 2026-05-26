import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { HistoryEntry } from "@/lib/api/voltrex";

export interface Device {
  id: string;
  name: string;
  room: string;
  watts: number;
  status: "on" | "off";
}

export const initialDevices: Device[] = [
  { id: "d1", name: "Main HVAC",       room: "Living Room", watts: 1800, status: "on"  },
  { id: "d2", name: "Smart Lighting",  room: "Whole House", watts: 220,  status: "on"  },
  { id: "d3", name: "EV Charger",      room: "Garage",      watts: 7200, status: "off" },
  { id: "d4", name: "Refrigerator",    room: "Kitchen",     watts: 350,  status: "on"  },
  { id: "d5", name: "Workstation",     room: "Office",      watts: 480,  status: "on"  },
  { id: "d6", name: "Water Heater",    room: "Utility",     watts: 3000, status: "off" },
  { id: "d7", name: "Server Rack",     room: "Office",      watts: 950,  status: "on"  },
  { id: "d8", name: "Solar Inverter",  room: "Roof",        watts: 0,    status: "on"  },
];

export const initialRooms = [
  "Living Room",
  "Whole House",
  "Garage",
  "Kitchen",
  "Office",
  "Utility",
  "Roof"
];

interface DevicesState {
  devices: Device[];
  rooms: string[];
  history: HistoryEntry[];
  
  toggle: (id: string) => void;
  addDevice: (device: Omit<Device, "id" | "status">) => void;
  removeDevice: (id: string) => void;
  addRoom: (room: string) => void;
  removeRoom: (room: string) => void;
  pushHistory: (e: Omit<HistoryEntry, "id" | "ts"> & { ts?: number }) => void;
}

export const useDevices = create<DevicesState>()(
  persist(
    (set, get) => ({
      devices: initialDevices,
      rooms: initialRooms,
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
      addDevice: (deviceData) => {
        const newDevice: Device = {
          id: Math.random().toString(36).slice(2, 10),
          status: "off",
          ...deviceData
        };
        set({ devices: [...get().devices, newDevice] });
      },
      removeDevice: (id) => {
        set({ devices: get().devices.filter((d) => d.id !== id) });
      },
      addRoom: (room) => {
        if (!get().rooms.includes(room)) {
          set({ rooms: [...get().rooms, room] });
        }
      },
      removeRoom: (room) => {
        set({ rooms: get().rooms.filter((r) => r !== room) });
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
    {
      name: "voltrex-devices-v3", // upgraded version to reset cleanly
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as never),
      ),
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<DevicesState>;
        return {
          ...current,
          ...p,
          devices:
            Array.isArray(p.devices) && p.devices.length > 0
              ? p.devices
              : initialDevices,
          rooms:
            Array.isArray(p.rooms) && p.rooms.length > 0
              ? p.rooms
              : initialRooms,
          history: Array.isArray(p.history) ? p.history : [],
        };
      },
    },
  ),
);
