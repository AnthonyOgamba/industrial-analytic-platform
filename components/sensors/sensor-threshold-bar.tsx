import type { IndustrialSensor } from "./sensors-data";

export function SensorThresholdBar({ sensor }: { sensor: IndustrialSensor }) {
  const { min, max, warnLow, warnHigh } = sensor.thresholds;
  const span = max - min || 1;
  const position = Math.min(100, Math.max(0, ((sensor.reading - min) / span) * 100));
  const lowWidth = Math.max(0, ((warnLow - min) / span) * 100);
  const highStart = Math.min(100, ((warnHigh - min) / span) * 100);
  const marker = sensor.status === "Critical" ? "bg-[var(--dv-badge-cr-text)]" : sensor.status === "Warning" ? "bg-[var(--dv-badge-wa-text)]" : "bg-[var(--dv-badge-ok-text)]";
  return <div><div className="mb-1 flex justify-between font-mono text-[8px] text-muted-foreground"><span>{min} {sensor.unit}</span><span>Range</span><span>{max} {sensor.unit}</span></div><div className="relative h-2 overflow-hidden rounded-full bg-muted"><span className="absolute inset-y-0 left-0 bg-[var(--dv-badge-wa-bg)]" style={{ width: `${lowWidth}%` }} /><span className="absolute inset-y-0 right-0 bg-[var(--dv-badge-wa-bg)]" style={{ width: `${100 - highStart}%` }} /><span className={`absolute inset-y-0 w-1 -translate-x-1/2 rounded-full ${marker}`} style={{ left: `${position}%` }} /></div><div className="mt-1 flex justify-between font-mono text-[8px] text-muted-foreground"><span>Warn: {warnLow}</span><span>Normal</span><span>Warn: {warnHigh}</span></div></div>;
}
