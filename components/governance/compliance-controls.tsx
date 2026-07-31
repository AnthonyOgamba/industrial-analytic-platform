"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, ExternalLink, Search, ShieldCheck, X } from "lucide-react";

import { complianceControls } from "./compliance-data";
import type { ComplianceControl } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { StatusBadge } from "./status-badge";

const moduleRoutes: Record<string, string> = {
  "Security Operations": "/security-ops", "API Security": "/api-security", "Audit Log": "/audit",
  Roles: "/roles", "Data Governance": "/governance", "Data Input": "/data-input", Users: "/users",
  Activity: "/activity", Notifications: "/governance", Operations: "/operations",
};

function ControlDetailModal({ control, onClose }: { control: ComplianceControl; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const details = [
    ["Control ID", control.id], ["Category", control.category], ["Status", control.status],
    ["Risk Level", control.riskLevel], ["Owner", control.owner], ["Last Checked", control.lastChecked],
    ["Next Review", control.nextReview], ["Compliance Standard", control.complianceStandard],
  ];

  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="control-detail-title" className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl">
      <header className="flex shrink-0 items-start gap-3 border-b p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-mono text-xs uppercase tracking-wider text-primary">Compliance Control</p><h2 id="control-detail-title" className="mt-1 text-lg font-bold">{control.name}</h2></div><button type="button" onClick={onClose} aria-label="Close control details" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button></header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <dl className="grid gap-2 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-lg border bg-muted/25 p-3"><dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 text-xs font-semibold">{value}</dd></div>)}</dl>
        {[["Description", control.description], ["Evidence / Findings", control.evidence], ["Recommended Action", control.recommendedAction]].map(([label, value]) => <section key={label}><h3 className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-primary">{label}</h3><p className="mt-2 rounded-lg border bg-card p-3 text-xs leading-5 text-muted-foreground">{value}</p></section>)}
        <section><h3 className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-primary">Related Modules</h3><div className="mt-2 flex flex-wrap gap-2">{control.relatedModules.map((module) => <Link key={module} href={moduleRoutes[module] ?? "/"} className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-primary hover:bg-muted">{module}<ExternalLink className="size-3" /></Link>)}</div></section>
      </div>
      <footer className="flex shrink-0 justify-end border-t bg-background p-4"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-xs font-semibold hover:bg-muted">Close</button></footer>
    </section>
  </div>;
}

export function ComplianceControls() {
  const [selected, setSelected] = useState<ComplianceControl | null>(null);
  const [query, setQuery] = useState("");
  const filtered = complianceControls.filter((control) => `${control.name} ${control.category} ${control.owner}`.toLowerCase().includes(query.toLowerCase()));
  const categories = filtered.reduce<Record<string, ComplianceControl[]>>((groups, control) => {
    (groups[control.category] ??= []).push(control);
    return groups;
  }, {});
  const active = complianceControls.filter((control) => control.status === "Active").length;
  const review = complianceControls.filter((control) => control.status === "Review Required").length;
  const monitoring = complianceControls.filter((control) => control.status === "Monitoring").length;

  return <div className="space-y-5">
    <GovernanceCard className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-3xl font-bold text-[var(--dv-badge-ok-text)]">{Math.round(active / complianceControls.length * 100)}%</p><p className="mt-1 text-xs text-muted-foreground">Active Control Coverage</p></div><div className="flex gap-8 sm:gap-10"><div className="text-center"><p className="text-xl font-bold text-[var(--dv-badge-ok-text)]">{active}</p><p className="mt-1 text-xs text-muted-foreground">Active</p></div><div className="text-center"><p className="text-xl font-bold text-[var(--dv-badge-wa-text)]">{monitoring}</p><p className="mt-1 text-xs text-muted-foreground">Monitoring</p></div><div className="text-center"><p className="text-xl font-bold text-[var(--dv-badge-cr-text)]">{review}</p><p className="mt-1 text-xs text-muted-foreground">Review</p></div></div></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[var(--dv-badge-ok-text)]" style={{ width: `${active / complianceControls.length * 100}%` }} /></div></GovernanceCard>
    <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search compliance controls</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search controls..." className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label>
    {Object.entries(categories).map(([category, controls]) => <section key={category}><h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground">{category}</h2><GovernanceCard><div className="divide-y">{controls.map((control) => <button type="button" key={control.id} onClick={() => setSelected(control)} className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:outline-none sm:gap-4 sm:px-5"><span className={`size-2 shrink-0 rounded-full ${control.status === "Active" ? "bg-[var(--dv-badge-ok-text)]" : control.status === "Review Required" ? "bg-[var(--dv-badge-cr-text)]" : "bg-[var(--dv-badge-wa-text)]"}`} /><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{control.name}</p><p className="mt-1 truncate font-mono text-xs text-muted-foreground">{control.complianceStandard} · {control.owner}</p></div><span className="hidden sm:inline"><StatusBadge status={control.status} /></span><span className="hidden items-center gap-1 font-mono text-xs text-muted-foreground md:flex"><CalendarClock className="size-3" />{control.lastChecked}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></button>)}</div></GovernanceCard></section>)}
    {!filtered.length && <GovernanceCard><p className="p-10 text-center text-sm text-muted-foreground">No compliance controls match this search.</p></GovernanceCard>}
    {selected && <ControlDetailModal control={selected} onClose={() => setSelected(null)} />}
  </div>;
}
