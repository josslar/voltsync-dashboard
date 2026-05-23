import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useDevices } from "@/store/devices";
import type { Device } from "@/lib/api/voltrex";
import { Power, Lightbulb, Refrigerator, Car, Server, Cpu, Droplets, Sun } from "lucide-react";

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
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Connected devices</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle, monitor, and orchestrate every node on the grid.
        </p>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {devices.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
          >
            <DeviceCard device={d} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const toggle = useDevices((s) => s.toggle);
  const Icon = ICONS[device.id] ?? Power;
  const on = device.status === "on";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`relative panel rounded-2xl p-5 transition-shadow ${
        on ? "hover:glow-primary" : "hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${
              on ? "bg-primary/20 text-primary-glow" : "bg-secondary text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">{device.name}</div>
            <div className="text-xs text-muted-foreground">{device.room}</div>
          </div>
        </div>
        <Toggle on={on} onChange={() => toggle(device.id)} />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Load
          </div>
          <div className="text-2xl font-semibold tracking-tight">
            {on ? `${device.watts} W` : "—"}
          </div>
        </div>
        <motion.div
          animate={{
            backgroundColor: on ? "oklch(0.72 0.18 155 / 0.18)" : "oklch(0.25 0.02 290 / 0.6)",
            color: on ? "oklch(0.85 0.18 155)" : "oklch(0.68 0.03 290)",
          }}
          className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-transparent"
        >
          {on ? "Active" : "Idle"}
        </motion.div>
      </div>
    </motion.div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-secondary"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 32 }}
        className={`absolute top-0.5 ${on ? "right-0.5" : "left-0.5"} h-6 w-6 rounded-full bg-background shadow-md ${
          on ? "shadow-primary/60" : ""
        }`}
      />
    </button>
  );
}
