// VOLTREX mock API layer.
// Replace these functions with real ESP32 HTTP/WebSocket calls later.

export type DeviceStatus = "on" | "off";
export type SystemStatus = "stable" | "warning" | "critical";

export interface Device {
  id: string;
  name: string;
  room: string;
  watts: number;
  status: DeviceStatus;
}

export interface VoltageReading {
  t: number; // ms epoch
  voltage: number;
  power: number;
}

export interface HistoryEntry {
  id: string;
  ts: number;
  event: string;
  detail: string;
  level: "info" | "warning" | "critical";
}

const NOMINAL = 230;

export function classifyVoltage(v: number): SystemStatus {
  const delta = Math.abs(v - NOMINAL);
  if (delta > 18) return "critical";
  if (delta > 8) return "warning";
  return "stable";
}

let _v = NOMINAL;
export function sampleVoltage(): VoltageReading {
  // smooth random walk around nominal
  _v += (Math.random() - 0.5) * 3.2;
  _v += (NOMINAL - _v) * 0.08;
  // occasional spike
  if (Math.random() < 0.04) _v += (Math.random() - 0.5) * 22;
  const power = Math.max(0, _v * (3 + Math.random() * 4));
  return { t: Date.now(), voltage: +_v.toFixed(2), power: +power.toFixed(1) };
}

export const initialDevices: Device[] = [
  { id: "d1", name: "Main HVAC", room: "Living Room", watts: 1800, status: "on" },
  { id: "d2", name: "Smart Lighting", room: "Whole House", watts: 220, status: "on" },
  { id: "d3", name: "EV Charger", room: "Garage", watts: 7200, status: "off" },
  { id: "d4", name: "Refrigerator", room: "Kitchen", watts: 350, status: "on" },
  { id: "d5", name: "Workstation", room: "Office", watts: 480, status: "on" },
  { id: "d6", name: "Water Heater", room: "Utility", watts: 3000, status: "off" },
  { id: "d7", name: "Server Rack", room: "Office", watts: 950, status: "on" },
  { id: "d8", name: "Solar Inverter", room: "Roof", watts: 0, status: "on" },
];

export function getPredictions(devices: Device[]) {
  const heavy = devices.filter((d) => d.status === "on" && d.watts > 1500);
  return [
    {
      id: "p1",
      title: "Shift EV charging to 02:00",
      impact: "Save ~18% on tonight's bill",
      confidence: 0.92,
      action: "schedule-ev",
    },
    {
      id: "p2",
      title: heavy.length
        ? `Throttle ${heavy[0].name} during peak`
        : "Pre-cool before 17:00 peak",
      impact: "Avoid projected voltage warning at 18:20",
      confidence: 0.81,
      action: "throttle-peak",
    },
    {
      id: "p3",
      title: "Route solar surplus to Water Heater",
      impact: "Recover 1.4 kWh of free energy",
      confidence: 0.74,
      action: "route-solar",
    },
  ];
}
