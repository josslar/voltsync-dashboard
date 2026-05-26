"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Trash2, Settings2, Globe, Monitor, Sun, Moon } from "lucide-react";
import { useDevices } from "@/store/devices";
import { useAppStore } from "@/store/app";
import { useTranslation } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import type { Theme } from "@/store/app";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — VOLTREX" }] }),
});

function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const lang = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const t = useTranslation(lang);

  const devices = useDevices((s) => s.devices);
  const rooms = useDevices((s) => s.rooms);
  const addDevice = useDevices((s) => s.addDevice);
  const removeDevice = useDevices((s) => s.removeDevice);
  const addRoom = useDevices((s) => s.addRoom);
  const removeRoom = useDevices((s) => s.removeRoom);

  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceWatts, setNewDeviceWatts] = useState("");
  const [newDeviceRoom, setNewDeviceRoom] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => setMounted(true), []);

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newDeviceWatts || !newDeviceRoom) return;
    addDevice({
      name: newDeviceName,
      watts: parseInt(newDeviceWatts, 10) || 0,
      room: newDeviceRoom,
    });
    setNewDeviceName("");
    setNewDeviceWatts("");
    setNewDeviceRoom("");
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName) return;
    addRoom(newRoomName);
    setNewRoomName("");
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold tracking-tight">{t("settings")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system preferences, nodes, and localization.
        </p>
      </motion.div>

      {/* Preferences Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="panel p-6 rounded-2xl space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Settings2 className="h-5 w-5 text-primary-glow" />
          <h3 className="text-lg font-medium">{t("preferences")}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> {t("language")}
            </label>
            <div className="flex gap-2">
              {(["en", "sw", "de"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                    lang === l
                      ? "bg-primary text-primary-foreground border-primary glow-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" /> {t("theme")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground border-primary glow-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                }`}
              >
                <Moon className="h-4 w-4" /> {t("darkMode")}
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border ${
                  theme === "light"
                    ? "bg-primary text-primary-foreground border-primary glow-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                }`}
              >
                <Sun className="h-4 w-4" /> {t("lightMode")}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Management */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel p-6 rounded-2xl flex flex-col"
        >
          <h3 className="text-lg font-medium mb-4">{t("addDevice")}</h3>
          <form onSubmit={handleAddDevice} className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-muted-foreground uppercase">{t("deviceName")}</label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Server Rack"
                className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase">{t("wattage")}</label>
                <input
                  type="number"
                  value={newDeviceWatts}
                  onChange={(e) => setNewDeviceWatts(e.target.value)}
                  placeholder="e.g. 500"
                  className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase">{t("room")}</label>
                <select
                  value={newDeviceRoom}
                  onChange={(e) => setNewDeviceRoom(e.target.value)}
                  className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="" disabled>Select...</option>
                  {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="h-4 w-4 inline-block mr-2" /> {t("save")}
            </button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border/50">
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.room} · {d.watts}W</div>
                </div>
                <button
                  onClick={() => removeDevice(d.id)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition"
                  title={t("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Room Management */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel p-6 rounded-2xl flex flex-col"
        >
          <h3 className="text-lg font-medium mb-4">{t("manageRooms")}</h3>
          <form onSubmit={handleAddRoom} className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-muted-foreground uppercase">{t("addRoom")}</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Basement"
                  className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2">
            {rooms.map((r) => (
              <div key={r} className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border/50">
                <div className="text-sm font-medium">{r}</div>
                <button
                  onClick={() => removeRoom(r)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition"
                  title={t("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
