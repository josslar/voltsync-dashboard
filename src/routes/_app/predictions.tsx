import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useDevices } from "@/store/devices";
import { getPredictions } from "@/lib/api/voltrex";

export const Route = createFileRoute("/_app/predictions")({
  component: PredictionsPage,
  head: () => ({ meta: [{ title: "Predictions — VOLTREX" }] }),
});

function PredictionsPage() {
  const devices = useDevices((s) => s.devices);
  const pushHistory = useDevices((s) => s.pushHistory);
  const predictions = getPredictions(devices);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const apply = (id: string, title: string) => {
    setApplied((a) => ({ ...a, [id]: true }));
    pushHistory({
      event: `Auto-applied: ${title}`,
      detail: "Predictive engine",
      level: "info",
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center ring-pulse">
          <Sparkles className="h-5 w-5 text-primary-glow" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Predictive intelligence</h2>
          <p className="text-sm text-muted-foreground">
            AI suggestions trained on your grid's behavior.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {predictions.map((p, i) => {
          const isApplied = applied[p.id];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="panel rounded-2xl p-6 flex flex-col relative overflow-hidden"
            >
              <motion.div
                aria-hidden
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full"
                style={{ background: "radial-gradient(circle, oklch(0.72 0.22 300 / 0.25), transparent 70%)" }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 0.5 }}
              />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.2em] text-primary-glow">
                  Confidence {(p.confidence * 100).toFixed(0)}%
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.impact}</p>

                <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.confidence * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary-glow"
                  />
                </div>
              </div>

              <div className="relative mt-6 flex-1 flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isApplied}
                  onClick={() => apply(p.id, p.title)}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                    isApplied
                      ? "bg-success/15 text-success border border-success/40"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Applied
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Auto-switch
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
