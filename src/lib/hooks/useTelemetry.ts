import { useEffect, useRef, useState } from "react";
import { sampleVoltage, type VoltageReading } from "@/lib/api/voltrex";

export function useTelemetry(maxPoints = 30, intervalMs = 2000) {
  const [readings, setReadings] = useState<VoltageReading[]>(() => {
    // seed a few points for a nice initial chart
    const seed: VoltageReading[] = [];
    for (let i = 0; i < 12; i++) seed.push(sampleVoltage());
    return seed;
  });
  const ref = useRef(maxPoints);
  ref.current = maxPoints;

  useEffect(() => {
    const id = window.setInterval(() => {
      setReadings((r) => {
        const next = [...r, sampleVoltage()];
        return next.slice(-ref.current);
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return readings;
}
