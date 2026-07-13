"use client";

import { useMemo, useState } from "react";
import { Activity, Building2, Factory, Gauge, KeyRound, ShieldCheck, Sparkles } from "lucide-react";

import { FacilitiesOverview } from "./facilities-overview";
import { GrantAccessModal, RegisterSiteModal } from "./facility-modals";
import { initialFacilities, initialSiteAccess, operationalInsights, type Facility, type SiteAccess } from "./facilities-data";
import { ProductionPerformance } from "./production-performance";
import { SiteAccessPanel } from "./site-access";

type FacilitiesTab = "sites" | "performance" | "access";

const tabs: { key: FacilitiesTab; label: string; icon: React.ElementType }[] = [
  { key: "sites", label: "Sites & Facilities", icon: Building2 },
  { key: "performance", label: "Production Performance", icon: Gauge },
  { key: "access", label: "Site Access", icon: KeyRound },
];

export function FacilitiesWorkspace() {
  const [activeTab, setActiveTab] = useState<FacilitiesTab>("sites");
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [accessRecords, setAccessRecords] = useState<SiteAccess[]>(initialSiteAccess);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const metrics = useMemo(() => {
    const lines = facilities.flatMap((facility) => facility.halls.flatMap((hall) => hall.lines));
    const averageOee = lines.length ? Math.round(lines.reduce((sum, line) => sum + line.oee, 0) / lines.length) : 0;
    const downtime = lines.reduce((sum, line) => sum + line.downtimeHours, 0);
    const compliance = facilities.length ? Math.round(facilities.reduce((sum, facility) => sum + facility.complianceScore, 0) / facilities.length) : 0;
    return { active: facilities.filter((facility) => facility.status === "Active").length, averageOee, compliance, downtime };
  }, [facilities]);

  function deleteFacility(facility: Facility) {
    if (!window.confirm(`Delete ${facility.name}? Its local access grants will also be removed.`)) return;
    setFacilities((items) => items.filter((item) => item.id !== facility.id));
    setAccessRecords((items) => items.filter((item) => item.facilityId !== facility.id));
  }

  return (
    <div className="space-y-5 pb-5">
      <header>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Manufacturing network</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Facilities</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Monitor sites, production structure, performance, compliance, and operational access from one workspace.</p>
      </header>

      <section className="space-y-3" aria-labelledby="facilities-compliance-title">
        <div><h2 id="facilities-compliance-title" className="text-base font-semibold">Facilities &amp; Compliance</h2><p className="mt-0.5 text-xs text-muted-foreground">Network-wide operating status and control posture.</p></div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[{ label: "Active Facilities", value: `${metrics.active}/${facilities.length}`, note: "Online sites", icon: Factory }, { label: "Average OEE", value: `${metrics.averageOee}%`, note: "Across production lines", icon: Gauge }, { label: "Compliance Coverage", value: `${metrics.compliance}%`, note: "Site control average", icon: ShieldCheck }, { label: "Recent Downtime", value: `${metrics.downtime.toFixed(1)}h`, note: "Facility status reference", icon: Activity }].map((item) => <div key={item.label} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-bold">{item.value}</p><p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p></div><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></div></div><p className="mt-3 font-mono text-[10px] text-muted-foreground">{item.note}</p></div>)}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]" aria-labelledby="ai-insights-title">
        <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><h2 id="ai-insights-title" className="text-sm font-semibold">AI Operational Insights</h2><span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase text-primary">Mock analysis</span></div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">{operationalInsights.map((insight) => <article key={insight.id} className="rounded-lg border bg-background/60 p-3"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold">{insight.facility}</p><span className="font-mono text-[9px] uppercase text-primary">{insight.priority}</span></div><p className="mt-1 font-mono text-[10px] text-muted-foreground">{insight.line} · {insight.confidence}% confidence</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{insight.message}</p></article>)}</div>
      </section>

      <div className="overflow-x-auto border-b"><div className="flex min-w-max" role="tablist" aria-label="Facilities sections">{tabs.map((tab) => { const Icon = tab.icon; const active = tab.key === activeTab; return <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.key)} className={`relative inline-flex h-12 items-center gap-2 px-4 text-xs font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Icon className={`size-4 ${active ? "text-primary" : ""}`} />{tab.label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>; })}</div></div>

      {activeTab === "sites" && <FacilitiesOverview facilities={facilities} onRegister={() => setRegisterOpen(true)} onDelete={deleteFacility} />}
      {activeTab === "performance" && <ProductionPerformance facilities={facilities} />}
      {activeTab === "access" && <SiteAccessPanel facilities={facilities} accessRecords={accessRecords} onGrant={() => setGrantOpen(true)} onRevoke={(id) => setAccessRecords((records) => records.filter((record) => record.id !== id))} />}

      {registerOpen && <RegisterSiteModal onClose={() => setRegisterOpen(false)} onSave={(facility) => { setFacilities((items) => [...items, facility]); setRegisterOpen(false); }} />}
      {grantOpen && <GrantAccessModal facilities={facilities} onClose={() => setGrantOpen(false)} onSave={(access) => { setAccessRecords((items) => [...items, access]); setGrantOpen(false); }} />}
    </div>
  );
}
