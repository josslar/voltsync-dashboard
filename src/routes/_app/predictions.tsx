"use client";

import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Zap, CheckCircle2, TrendingDown, Clock, Battery, Cpu, Sun } from "lucide-react";

export const Route = createFileRoute("/_app/predictions")({
  component: PredictionsPage,
  head: () => ({ meta: [{ title: "Predictions — VOLTREX" }] }),
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Prediction {
  id: string;
  title: string;
  impact: string;
  confidence: number;
  action: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

interface Device {
  id: string;
  name: string;
  watts: number;
  status: "on" | "off";
}

const INITIAL_DEVICES: Device[] = [
  { id: "d1", name: "Main HVAC",      watts: 1800, status: "on"  },
  { id: "d2", name: "Smart Lighting", watts: 220,  status: "on"  },
  { id: "d3", name: "EV Charger",     watts: 7200, status: "off" },
  { id: "d4", name: "Refrigerator",   watts: 350,  status: "on"  },
  { id: "d5", name: "Workstation",    watts: 480,  status: "on"  },
  { id: "d6", name: "Water Heater",   watts: 3000, status: "off" },
  { id: "d7", name: "Server Rack",    watts: 950,  status: "on"  },
  { id: "d8", name: "Solar Inverter", watts: 0,    status: "on"  },
];

function buildPredictions(devices: Device[]): Prediction[] {
  const heavy = devices.filter((d) => d.status === "on" && d.watts > 1500);
  return [
    {
      id: "p1",
      title: "Shift EV charging to 02:00",
      impact: "Save ~18% on tonight's bill",
      confidence: 0.92,
      action: "schedule-ev",
      icon: Clock,
      color: "oklch(0.72 0.22 300)",
    },
    {
      id: "p2",
      title: heavy.length
        ? `Throttle ${heavy[0].name} during peak`
        : "Pre-cool before 17:00 peak",
      impact: "Avoid projected voltage warning at 18:20",
      confidence: 0.81,
      action: "throttle-peak",
      icon: TrendingDown,
      color: "oklch(0.78 0.17 75)",
    },
    {
      id: "p3",
      title: "Route solar surplus to Water Heater",
      impact: "Recover 1.4 kWh of free energy",
      confidence: 0.74,
      action: "route-solar",
      icon: Battery,
      color: "oklch(0.72 0.18 155)",
    },
    {
      id: "p4",
      title: "Optimize Server Rack cooling cycle",
      impact: "Conserve ~120W of continuous standby power",
      confidence: 0.88,
      action: "optimize-servers",
      icon: Cpu,
      color: "oklch(0.72 0.22 300)",
    },
    {
      id: "p5",
      title: "Discharge Solar Battery during grid peak",
      impact: "Offset peak TZS rates using clean reserves",
      confidence: 0.95,
      action: "discharge-solar",
      icon: Sun,
      color: "oklch(0.78 0.17 75)",
    },
    {
      id: "p6",
      title: "Dim Smart Lights to 85% after 22:00",
      impact: "Reduce nocturnal grid drain by 45W",
      confidence: 0.79,
      action: "dim-lights",
      icon: Zap,
      color: "oklch(0.72 0.18 155)",
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────
function PredictionsPage() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  // Sync from shared localStorage key on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem("voltrex-devices-v2");
      if (stored) {
        const parsed = JSON.parse(stored) as Device[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDevices(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const predictions = buildPredictions(devices);
  const appliedCount = Object.values(applied).filter(Boolean).length;
  const efficiencyScore = 76 + Math.round((appliedCount / predictions.length) * 20);

  const apply = (id: string, title: string) => {
    setApplied((a) => ({ ...a, [id]: true }));
    // Optionally persist the action
    console.info(`Auto-applied: ${title}`);
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex items-center gap-3"
      >
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center ring-pulse"
          style={{ backgroundColor: "oklch(0.58 0.24 295 / 0.2)" }}
        >
          <Sparkles className="h-5 w-5" style={{ color: "oklch(0.72 0.22 300)" }} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Predictive intelligence</h2>
          <p className="text-sm text-muted-foreground">
            AI suggestions trained on your grid's behavior.
          </p>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid lg:grid-cols-3 gap-5">
        {predictions.map((p, i) => (
          <PredictionCard
            key={p.id}
            prediction={p}
            index={i}
            isApplied={!!applied[p.id]}
            onApply={() => apply(p.id, p.title)}
          />
        ))}
      </div>

      {/* Bottom insight strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-8 panel rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Grid efficiency score
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">
            <span style={{ color: "oklch(0.72 0.22 300)" }}>{efficiencyScore}</span>
            <span className="text-muted-foreground text-lg">/100</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {appliedCount === predictions.length
              ? "Optimal efficiency reached! All suggestions applied."
              : `Apply all suggestions to reach 96+ (Current: ${appliedCount}/${predictions.length} applied)`}
          </div>
        </div>
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Current</span>
            <span>Target</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "oklch(0.22 0.02 285)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${efficiencyScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, oklch(0.58 0.24 295), oklch(0.72 0.22 300))" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── PredictionCard ─────────────────────────────────────────────────────────────
function PredictionCard({
  prediction: p,
  index,
  isApplied,
  onApply,
}: {
  prediction: Prediction;
  index: number;
  isApplied: boolean;
  onApply: () => void;
}) {
  const Icon = p.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      className="panel rounded-2xl p-6 flex flex-col relative overflow-hidden"
    >
      {/* Ambient glow blob */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${p.color.replace(")", " / 0.18)")} , transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative">
        {/* Icon + confidence */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${p.color.replace(")", " / 0.15)")}` }}
          >
            <span style={{ color: p.color, display: "flex" }}>
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.18em] font-medium px-2 py-0.5 rounded-full"
            style={{
              color: p.color,
              backgroundColor: `${p.color.replace(")", " / 0.12)")}`,
            }}
          >
            {(p.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>

        <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{p.impact}</p>

        {/* Confidence bar */}
        <div
          className="mt-4 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "oklch(0.22 0.02 285)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${p.confidence * 100}%` }}
            transition={{ delay: 0.3 + index * 0.12, duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, oklch(0.58 0.24 295), ${p.color})`,
            }}
          />
        </div>
      </div>

      {/* CTA button */}
      <div className="relative mt-6 flex-1 flex items-end">
        <motion.button
          type="button"
          whileHover={isApplied ? {} : { scale: 1.02 }}
          whileTap={isApplied ? {} : { scale: 0.97 }}
          disabled={isApplied}
          onClick={onApply}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
          style={
            isApplied
              ? {
                  backgroundColor: "oklch(0.72 0.18 155 / 0.12)",
                  color: "oklch(0.72 0.18 155)",
                  border: "1px solid oklch(0.72 0.18 155 / 0.35)",
                }
              : {
                  backgroundColor: "oklch(0.58 0.24 295)",
                  color: "oklch(0.99 0 0)",
                  boxShadow: "0 0 20px oklch(0.58 0.24 295 / 0.35)",
                }
          }
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Applied
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Auto-switch
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
