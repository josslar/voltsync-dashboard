import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTelemetry } from "@/lib/hooks/useTelemetry";
import { classifyVoltage } from "@/lib/api/voltrex";
import { AnimatedNumber, VoltageGauge } from "@/components/voltrex/VoltageGauge";
import { useDevices } from "@/store/devices";
import { useAppStore } from "@/store/app";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — VOLTREX" }] }),
});

const STATUS = {
  stable: { label: "Stable", color: "var(--color-success)" },
  warning: { label: "Warning", color: "var(--color-warning)" },
  critical: { label: "Critical", color: "var(--color-destructive)" },
} as const;

function DashboardPage() {
  const readings = useTelemetry(28);
  const latest = readings[readings.length - 1];
  const status = classifyVoltage(latest.voltage);
  const devices = useDevices((s) => s.devices);
  const activePower = devices
    .filter((d) => d.status === "on")
    .reduce((acc, d) => acc + d.watts, 0);

  const energyUnits = useAppStore((s) => s.energyUnits);
  const energyBudget = useAppStore((s) => s.energyBudget);
  const utilityProvider = useAppStore((s) => s.utilityProvider);
  const meterId = useAppStore((s) => s.meterId);
  const powerSource = useAppStore((s) => s.powerSource);

  return (
    <div className="space-y-6">
      {/* hero */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          layout
          className="panel rounded-2xl p-6 lg:col-span-2 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        >
          <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-mono text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded border border-border/40">
            {utilityProvider} · {meterId}
          </div>
          <div className="flex items-start justify-between w-full">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">
                Live voltage
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-6xl font-semibold tracking-tight text-glow">
                  <AnimatedNumber value={latest.voltage} decimals={1} />
                </div>
                <div className="text-xl text-muted-foreground">V</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <StatusPill status={status} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-secondary/50 border border-border/30 px-3 py-1.5 rounded-full font-semibold">
                  Source: {powerSource.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="hidden sm:block w-[50%] -mr-2 -mt-2">
              <VoltageGauge voltage={latest.voltage} />
            </div>
          </div>
          <div className="sm:hidden mt-4">
            <VoltageGauge voltage={latest.voltage} />
          </div>
        </motion.div>

        {/* Highlight balance / recharge widget */}
        <motion.div
          whileHover={{ y: -2 }}
          className="panel rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">LUKU Meter Balance</div>
            <div className="mt-4 flex items-baseline gap-2">
              <div className="text-5xl font-bold tracking-tight text-glow text-primary-glow">
                <AnimatedNumber value={energyUnits} decimals={2} />
              </div>
              <div className="text-base text-muted-foreground">kWh</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sync: Registered to meter {meterId}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Rate: ~350 TZS/kWh
            </span>
            <a
              href="/payments"
              className="text-xs text-primary-glow font-semibold hover:underline flex items-center gap-1"
            >
              Recharge now →
            </a>
          </div>
        </motion.div>
      </div>

      {/* Grid stats (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active load"
          value={<AnimatedNumber value={activePower} decimals={0} suffix=" W" />}
          sub={`${devices.filter((d) => d.status === "on").length} devices on`}
        />
        <StatCard
          label="Frequency"
          value={
            <AnimatedNumber
              value={50 + (latest.voltage - 230) * 0.01}
              decimals={2}
              suffix=" Hz"
            />
          }
          sub="Grid sync nominal"
        />
        <StatCard
          label="Utility grid"
          value={utilityProvider}
          sub={`Meter: ${meterId}`}
        />
        <motion.div
          whileHover={{ y: -2 }}
          className="panel rounded-2xl p-5 flex flex-col justify-between"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monthly Budget</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {Math.round((energyUnits / energyBudget) * 100)}%
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ({energyUnits.toFixed(0)}/{energyBudget} kWh)
              </span>
            </div>
          </div>
          <div className="w-full mt-3">
            <div className="h-1.5 rounded-full overflow-hidden bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (energyUnits / energyBudget) * 100)}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full"
                style={{
                  background: (energyUnits / energyBudget) > 0.2
                    ? "linear-gradient(90deg, oklch(0.58 0.24 295), oklch(0.72 0.22 300))"
                    : "oklch(0.62 0.24 25)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Power consumption
            </div>
            <div className="text-lg font-medium">Last 60 seconds</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Peak{" "}
            <span className="text-foreground font-medium">
              {Math.max(...readings.map((r) => r.power)).toFixed(0)} W
            </span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={readings} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="pwr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.22 300)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="oklch(0.72 0.22 300)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.27 0.02 290 / 0.4)" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(t) =>
                  new Date(t).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })
                }
                stroke="oklch(0.6 0.03 290)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.6 0.03 290)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.16 0.012 285)",
                  border: "1px solid oklch(0.32 0.04 295 / 0.6)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelFormatter={(t) => new Date(Number(t)).toLocaleTimeString()}
                formatter={(v) => [`${Number(v).toFixed(1)} W`, "Power"]}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="oklch(0.78 0.2 300)"
                strokeWidth={2.5}
                fill="url(#pwr)"
                isAnimationActive
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

function StatusPill({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
      style={{ borderColor: s.color, color: s.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: s.color, boxShadow: `0 0 12px ${s.color}` }}
      />
      {s.label}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="panel rounded-2xl p-5"
    >
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </motion.div>
  );
}
