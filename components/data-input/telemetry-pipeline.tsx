import { Activity, ArrowRight, BarChart3, Brain, Database, FlaskConical, Server } from "lucide-react";
import { pipelineStages } from "./data-input-data";

const icons = [Server, FlaskConical, Activity, Database, BarChart3, Brain];

export function TelemetryPipeline() {
  return <section className="rounded-xl border bg-card p-5 shadow-[var(--dv-shadow)]"><h2 className="text-sm font-semibold">Telemetry Pipeline</h2><div className="mt-5 flex items-center overflow-x-auto pb-2">{pipelineStages.map((stage, index) => { const Icon = icons[index]; const active = stage.status === "active"; return <div key={stage.name} className="contents"><div className="flex min-w-28 shrink-0 flex-col items-center text-center"><div className={`grid size-11 place-items-center rounded-xl ${active ? "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" : "bg-muted text-muted-foreground"}`}><Icon className="size-4" /></div><p className="mt-2 text-xs font-semibold">{stage.name}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">{stage.metric}</p><p className={`mt-1 flex items-center gap-1 font-mono text-[9px] ${active ? "text-[var(--dv-badge-ok-text)]" : "text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${active ? "bg-[var(--dv-badge-ok-text)]" : "bg-muted-foreground"}`} />{stage.status}</p></div>{index < pipelineStages.length - 1 && <ArrowRight className="size-4 shrink-0 text-border" />}</div>; })}</div></section>;
}
