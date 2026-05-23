import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function VoltageGauge({ voltage }: { voltage: number }) {
  // 180 to 260 V range mapped to 0..1
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 18 });

  useEffect(() => {
    const norm = Math.max(0, Math.min(1, (voltage - 180) / 80));
    mv.set(norm);
  }, [voltage, mv]);

  const R = 96;
  const C = Math.PI * R; // semicircle length
  const dash = useTransform(spring, (v) => `${v * C} ${C}`);
  const angle = useTransform(spring, (v) => `${-90 + v * 180}deg`);

  return (
    <div className="relative w-full aspect-[2/1] max-w-md mx-auto">
      <svg viewBox="0 0 240 130" className="w-full h-full">
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.24 25)" />
            <stop offset="50%" stopColor="oklch(0.7 0.22 300)" />
            <stop offset="100%" stopColor="oklch(0.78 0.17 75)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M24 120 A96 96 0 0 1 216 120"
          fill="none"
          stroke="oklch(0.25 0.02 290)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d="M24 120 A96 96 0 0 1 216 120"
          fill="none"
          stroke="url(#gauge)"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ strokeDasharray: dash as unknown as string }}
          filter="url(#glow)"
        />
        {/* needle */}
        <motion.g style={{ originX: "120px", originY: "120px", rotate: angle }}>
          <line
            x1="120"
            y1="120"
            x2="120"
            y2="38"
            stroke="oklch(0.95 0.01 290)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="120" cy="120" r="6" fill="oklch(0.72 0.22 300)" />
        </motion.g>
      </svg>
    </div>
  );
}

export function AnimatedNumber({
  value,
  decimals = 1,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(decimals) + suffix);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span>{display}</motion.span>;
}
