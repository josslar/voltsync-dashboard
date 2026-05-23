import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useDevices } from "@/store/devices";
import { Info, AlertTriangle, AlertOctagon } from "lucide-react";

export const Route = createFileRoute("/_app/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — VOLTREX" }] }),
});

const ICONS = {
  info: { I: Info, color: "text-primary-glow" },
  warning: { I: AlertTriangle, color: "text-warning" },
  critical: { I: AlertOctagon, color: "text-destructive" },
} as const;

function HistoryPage() {
  const history = useDevices((s) => s.history);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Event history</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Every toggle, prediction, and grid event in one place.
        </p>
      </div>

      <div className="panel rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
          <div className="col-span-2">Time</div>
          <div className="col-span-7 sm:col-span-6">Event</div>
          <div className="hidden sm:block sm:col-span-3">Detail</div>
          <div className="col-span-3 sm:col-span-1 text-right">Level</div>
        </div>

        {history.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            No events yet. Toggle a device or apply a prediction to populate the log.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((row) => {
              const { I, color } = ICONS[row.level];
              return (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -8, backgroundColor: "oklch(0.72 0.22 300 / 0.12)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "oklch(0 0 0 / 0)" }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-12 items-center px-5 py-3 text-sm border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  <div className="col-span-2 text-muted-foreground tabular-nums text-xs sm:text-sm">
                    {new Date(row.ts).toLocaleTimeString()}
                  </div>
                  <div className="col-span-7 sm:col-span-6 font-medium truncate">
                    {row.event}
                  </div>
                  <div className="hidden sm:block sm:col-span-3 text-muted-foreground truncate text-xs">
                    {row.detail}
                  </div>
                  <div className="col-span-3 sm:col-span-1 flex justify-end">
                    <I className={`h-4 w-4 ${color}`} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
