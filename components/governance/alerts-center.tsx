"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";

import { initialAlerts, type GovernanceAlert } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { AlertSeverityBadge, StatusBadge } from "./status-badge";

type AlertFilter = "All" | GovernanceAlert["status"];

export function AlertsCenter() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<AlertFilter>("All");
  const visible = alerts.filter((alert) => filter === "All" || alert.status === filter);
  const critical = alerts.filter((alert) => alert.severity === "Critical" && alert.status !== "Resolved").length;
  const open = alerts.filter((alert) => alert.status === "Open").length;
  const resolved = alerts.filter((alert) => alert.status === "Resolved").length;

  function updateAlert(id: string, status: GovernanceAlert["status"]) {
    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, status } : alert)));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [critical, "Critical", "text-[var(--dv-badge-cr-text)]"],
          [open, "Open alerts", "text-[var(--dv-badge-wa-text)]"],
          [resolved, "Resolved", "text-[var(--dv-badge-ok-text)]"],
        ].map(([value, label, tone]) => (
          <GovernanceCard key={label} className="p-5"><div className="flex items-center gap-3"><AlertTriangle className={`size-6 ${tone}`} /><div><p className={`text-xl font-bold ${tone}`}>{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></div></GovernanceCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Open", "Acknowledged", "Resolved"] as AlertFilter[]).map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === item ? "border-primary bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>{item}</button>
        ))}
      </div>

      <GovernanceCard title="Governance Exceptions" subtitle={`${visible.length} alerts in the selected view`}>
        <div className="divide-y">
          {visible.map((alert) => (
            <article key={alert.id} className={`flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/30 lg:flex-row lg:items-start ${alert.status === "Resolved" ? "opacity-60" : ""}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${alert.severity === "Critical" ? "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]" : alert.severity === "Warning" ? "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]" : "bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]"}`}><AlertTriangle className="size-4" /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[13px] font-semibold">{alert.title}</h3><AlertSeverityBadge severity={alert.severity} /><StatusBadge status={alert.status} /></div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{alert.description}</p><p className="mt-2 font-mono text-xs text-muted-foreground">{alert.id} · {alert.resource} · {alert.created}</p></div>
              {alert.status !== "Resolved" && <div className="flex shrink-0 gap-2">{alert.status === "Open" && <button type="button" onClick={() => updateAlert(alert.id, "Acknowledged")} className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium hover:bg-muted"><Eye className="size-3.5" />Acknowledge</button>}<button type="button" onClick={() => updateAlert(alert.id, "Resolved")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80"><CheckCircle2 className="size-3.5" />Resolve</button></div>}
            </article>
          ))}
        </div>
      </GovernanceCard>
    </div>
  );
}
