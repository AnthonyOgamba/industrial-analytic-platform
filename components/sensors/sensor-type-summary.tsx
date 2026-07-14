"use client";

import { Activity, Droplets, Flame, Gauge, RotateCcw, Thermometer, Zap } from "lucide-react";

import { sensorTypes, type IndustrialSensor, type SensorType } from "./sensors-data";

const icons: Record<SensorType, React.ElementType> = { Temperature: Thermometer, Pressure: Gauge, Vibration: Activity, Current: Zap, Humidity: Droplets, RPM: RotateCcw, Energy: Flame };

export function SensorTypeSummary({ sensors, selected, onSelect }: { sensors: IndustrialSensor[]; selected: "All Types" | SensorType; onSelect: (type: "All Types" | SensorType) => void }) {
  return <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{sensorTypes.map((type) => { const Icon = icons[type]; const typed = sensors.filter((sensor) => sensor.type === type); const alert = typed.some((sensor) => sensor.status === "Critical") ? "bg-[var(--dv-badge-cr-text)]" : typed.some((sensor) => sensor.status === "Warning") ? "bg-[var(--dv-badge-wa-text)]" : ""; const active = selected === type; return <button key={type} type="button" onClick={() => onSelect(active ? "All Types" : type)} aria-pressed={active} className={`relative flex min-h-20 flex-col items-center justify-center rounded-xl border p-2 text-center transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}><span className="relative"><Icon className="size-4" />{alert && <span className={`absolute -right-1.5 -top-1 size-2 rounded-full ${alert}`} />}</span><span className="mt-1.5 text-[9px] font-medium">{type}</span><span className="mt-0.5 font-mono text-[10px] font-bold">{typed.length}</span></button>; })}</div>;
}
