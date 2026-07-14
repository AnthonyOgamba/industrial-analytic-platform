export function SensorHealthIndicator({ label, value, kind = "health" }: { label: string; value: number; kind?: "health" | "battery" }) {
  const tone = value >= 80 ? "bg-[var(--dv-badge-ok-text)] text-[var(--dv-badge-ok-text)]" : value >= 50 ? "bg-[var(--dv-badge-wa-text)] text-[var(--dv-badge-wa-text)]" : "bg-[var(--dv-badge-cr-text)] text-[var(--dv-badge-cr-text)]";
  return <div><p className="text-[9px] text-muted-foreground">{label}</p><p className={`mt-0.5 font-mono text-xs font-bold ${tone.split(" ")[1]}`}>{value}%</p><div className="mt-1 h-1 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${tone.split(" ")[0]}`} style={{ width: `${value}%` }} /></div><span className="sr-only">{kind} level {value} percent</span></div>;
}
