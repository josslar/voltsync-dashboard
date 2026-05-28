"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, ZapOff, Sun, BatteryWarning, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useTranslation } from "@/lib/i18n";
import type { PowerSource } from "@/store/app";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — VOLTREX" }] }),
});

function NotificationsPage() {
  const lang = useAppStore((s) => s.language);
  const t = useTranslation(lang);
  
  const powerSource = useAppStore((s) => s.powerSource);
  const setPowerSource = useAppStore((s) => s.setPowerSource);
  const energyUnits = useAppStore((s) => s.energyUnits);
  const setEnergyUnits = useAppStore((s) => s.setEnergyUnits);
  const notifications = useAppStore((s) => s.notifications);
  const pushNotification = useAppStore((s) => s.pushNotification);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mark all unread notifications as read when viewing the feed
  useEffect(() => {
    if (mounted) {
      notifications.forEach((n) => {
        if (!n.read) {
          markNotificationRead(n.id);
        }
      });
    }
  }, [mounted, notifications, markNotificationRead]);

  // Simulation Effect
  useEffect(() => {
    if (!mounted) return;

    // Simulate Energy drain
    const drainInterval = setInterval(() => {
      setEnergyUnits((prev) => Math.max(0, prev - 0.05));
    }, 2000);

    // Simulate Grid fluctuation and Backup switch
    const mockEvents = () => {
      const rand = Math.random();
      
      if (powerSource === "grid" && rand > 0.95) {
        // Grid failure simulation
        pushNotification({
          title: "Grid Power Failure",
          message: "Substation fluctuation detected. Associated devices in Kitchen experienced brownout.",
          level: "critical",
        });
        
        setTimeout(() => {
          setPowerSource("solar");
          pushNotification({
            title: "Backup Engaged",
            message: "Successfully switched to Solar Backup to prevent further cascade.",
            level: "info",
          });
        }, 1500);

      } else if (powerSource === "solar" && rand > 0.8) {
        // Grid return simulation
        setPowerSource("grid");
        pushNotification({
          title: "Grid Restored",
          message: "Main grid stability verified. Switching back to Grid Power.",
          level: "info",
        });
      }
    };

    const eventInterval = setInterval(mockEvents, 8000);

    return () => {
      clearInterval(drainInterval);
      clearInterval(eventInterval);
    };
  }, [mounted, powerSource, pushNotification, setEnergyUnits, setPowerSource]);

  if (!mounted) return null;

  const maxUnits = 200;
  const energyPercent = Math.min(100, Math.max(0, (energyUnits / maxUnits) * 100));

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary-glow" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("notifications")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            System alerts, grid status, and automated event tracking.
          </p>
        </div>
      </motion.div>

      {/* Top Dashboard Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Power Status Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center min-h-[160px]"
        >
          <div className="flex items-center justify-between z-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                {t("powerStatus")}
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {powerSource === "grid" && t("grid")}
                {powerSource === "solar" && t("solar")}
                {powerSource === "generator" && t("generator")}
                {powerSource === "off" && t("off")}
              </div>
            </div>
            
            <motion.div 
              className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg"
              animate={powerSource === "grid" ? { boxShadow: "0 0 40px oklch(0.72 0.22 300 / 0.4)" } : {}}
              style={{
                backgroundColor: powerSource === "grid" ? "oklch(0.58 0.24 295 / 0.2)" : 
                                 powerSource === "solar" ? "oklch(0.78 0.17 75 / 0.2)" : "oklch(0.22 0.02 285)",
                color: powerSource === "grid" ? "oklch(0.72 0.22 300)" : 
                       powerSource === "solar" ? "oklch(0.78 0.17 75)" : "oklch(0.68 0.03 290)",
              }}
            >
              {powerSource === "grid" && <Zap className="h-8 w-8" />}
              {powerSource === "solar" && <Sun className="h-8 w-8" />}
              {powerSource === "off" && <ZapOff className="h-8 w-8" />}
            </motion.div>
          </div>
          
          {/* Ambient Glow */}
          <div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{
              backgroundColor: powerSource === "grid" ? "oklch(0.72 0.22 300)" : 
                               powerSource === "solar" ? "oklch(0.78 0.17 75)" : "transparent"
            }}
          />
        </motion.div>

        {/* Energy Units Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="panel p-6 rounded-2xl flex flex-col justify-center min-h-[160px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {t("unitsLeft")}
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-4xl font-semibold tracking-tight mb-4">
            {energyUnits.toFixed(2)}
            <span className="text-lg text-muted-foreground ml-1">kWh</span>
          </div>
          
          <div className="w-full h-3 rounded-full bg-secondary/80 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{
                background: energyPercent > 20 
                  ? "linear-gradient(90deg, oklch(0.58 0.24 295), oklch(0.72 0.22 300))"
                  : "oklch(0.62 0.24 25)",
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Notification Feed */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">{t("history")}</h3>
        
        <AnimatePresence initial={false}>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="panel p-4 rounded-xl flex items-start gap-4"
            >
              <div 
                className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  n.level === "critical" ? "bg-destructive/20 text-destructive" :
                  n.level === "warning" ? "bg-warning/20 text-warning" :
                  "bg-primary/20 text-primary-glow"
                }`}
              >
                {n.level === "critical" && <ZapOff className="h-4 w-4" />}
                {n.level === "warning" && <AlertTriangle className="h-4 w-4" />}
                {n.level === "info" && <CheckCircle2 className="h-4 w-4" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {new Date(n.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
              </div>
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              All systems nominal. No recent events.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
