"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Power, Lightbulb, Refrigerator, Car, Server, Cpu, Droplets, Sun, MapPin } from "lucide-react";
import { useDevices, type Device } from "@/store/devices";
import { useTranslation } from "@/lib/i18n";
import { useAppStore } from "@/store/app";

export const Route = createFileRoute("/_app/devices")({
  component: DevicesPage,
  head: () => ({ meta: [{ title: "Devices — VOLTREX" }] }),
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  d1: Power,
  d2: Lightbulb,
  d3: Car,
  d4: Refrigerator,
  d5: Cpu,
  d6: Droplets,
  d7: Server,
  d8: Sun,
};

function DevicesPage() {
  const devices = useDevices((s) => s.devices);
  const toggle = useDevices((s) => s.toggle);
  const [mounted, setMounted] = useState(false);
  
  const lang = useAppStore((s) => s.language);
  const t = useTranslation(lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCount = devices.filter((d) => d.status === "on").length;
  const totalWatts  = devices.filter((d) => d.status === "on").reduce((s, d) => s + d.watts, 0);

  // Group devices by room
  const roomsMap = devices.reduce((acc, device) => {
    const room = device.room || "Unassigned";
    if (!acc[room]) acc[room] = [];
    acc[room].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  const roomsList = Object.entries(roomsMap).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("connectedDevices")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle, monitor, and orchestrate every node on the grid.
          </p>
        </div>

        {mounted && (
          <div className="flex gap-3">
            <StatBadge label="Active" value={`${activeCount} / ${devices.length}`} />
            <StatBadge label="Load" value={`${totalWatts.toLocaleString()} W`} accent />
          </div>
        )}
      </motion.div>

      {/* Grouped by Room */}
      <div className="space-y-10">
        {roomsList.map(([room, roomDevices], index) => (
          <motion.div
            key={room}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">{room}</h3>
              <span className="ml-auto text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                {roomDevices.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {roomDevices.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
                >
                  <DeviceCard device={d} onToggle={() => toggle(d.id)} t={t} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        {roomsList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No devices found. Add some in Settings.
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceCard({ device, onToggle, t }: { device: Device; onToggle: () => void; t: any }) {
  const Icon = ICONS[device.id] ?? Power;
  const on   = device.status === "on";

  return (
    <motion.div
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      className={`relative panel rounded-2xl p-5 cursor-default ${on ? "hover:glow-primary" : "hover:shadow-lg"}`}
      style={{ transition: "box-shadow 0.2s ease" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{
              backgroundColor: on ? "oklch(0.58 0.24 295 / 0.2)" : "oklch(0.22 0.02 285)",
              color: on ? "oklch(0.72 0.22 300)" : "oklch(0.68 0.03 290)",
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 pr-2">
            <div className="font-medium truncate">{device.name}</div>
            <div className="text-xs text-muted-foreground truncate">{device.room}</div>
          </div>
        </div>
        <Toggle on={on} onChange={onToggle} />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Load</div>
          <div className="text-2xl font-semibold tracking-tight">
            {on ? `${device.watts.toLocaleString()} W` : "—"}
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors duration-300"
          style={{
            backgroundColor: on ? "oklch(0.72 0.18 155 / 0.15)" : "oklch(0.25 0.02 290 / 0.6)",
            borderColor:     on ? "oklch(0.72 0.18 155 / 0.4)"  : "oklch(0.32 0.04 295 / 0.4)",
            color:           on ? "oklch(0.85 0.18 155)"         : "oklch(0.68 0.03 290)",
          }}
        >
          {on ? "Active" : "Idle"}
        </span>
      </div>
    </motion.div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      aria-pressed={on}
      aria-label={on ? "Turn off" : "Turn on"}
      className="relative h-7 w-12 rounded-full flex-shrink-0 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ backgroundColor: on ? "oklch(0.58 0.24 295)" : "var(--color-secondary)" }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
        style={{
          left: on ? "calc(100% - 1.625rem)" : "0.125rem",
          boxShadow: on ? "0 0 8px oklch(0.72 0.22 300 / 0.6)" : undefined,
        }}
      />
    </button>
  );
}

function StatBadge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="panel rounded-xl px-4 py-2 text-center min-w-[80px]">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
      <div
        className="text-sm font-semibold mt-0.5"
        style={{ color: accent ? "oklch(0.72 0.22 300)" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
