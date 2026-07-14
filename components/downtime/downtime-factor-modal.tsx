"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Save, X } from "lucide-react";
import type { IndustrialAsset } from "@/components/assets/assets-data";
import type { Facility } from "@/components/facilities/facilities-data";
import { sensorTypes } from "@/components/sensors/sensors-data";
import { downtimePolicies, factorCategories, factorSeverities, type DowntimeFactor } from "./downtime-data";

const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"; const labelClass = "space-y-1.5 text-xs font-medium";
function Section({ title, children }: { title: string; children: ReactNode }) { return <fieldset className="space-y-3 border-t pt-5 first:border-0 first:pt-0"><legend className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{title}</legend>{children}</fieldset>; }
function CheckboxGroup({ label, options, selected, onChange, scrollable = false }: { label: string; options: { value: string; label: string }[]; selected: string[]; onChange: (values: string[]) => void; scrollable?: boolean }) { return <div><p className="mb-2 text-xs font-medium">{label}</p><div className={`${scrollable ? "max-h-28" : "max-h-36"} overflow-y-auto rounded-lg border bg-background p-2`}><div className="flex flex-wrap gap-2">{options.map((option) => { const checked = selected.includes(option.value); return <label key={option.value} className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] ${checked ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground"}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked ? [...selected, option.value] : selected.filter((value) => value !== option.value))} className="size-3 accent-[var(--primary)]" />{option.label}</label>; })}{!options.length && <span className="px-1 py-2 text-[10px] text-muted-foreground">No matching options</span>}</div></div></div>; }
function blankFactor(): DowntimeFactor { return { id: `factor-${Date.now()}`, code: "", name: "", category: "Mechanical", severity: "Medium", description: "", occurrences: 0, averageDurationMinutes: 0, impactScore: 5, aiRisk: 0, appliesTo: { siteIds: [], hallIds: [], lineIds: [], assetTypes: [], assetIds: [], sensorTypes: [] }, costs: { estimatedRepairCost: 0, estimatedProductionLoss: 0, averageCostPerHour: 0, targetResolutionMinutes: 60, escalationMinutes: 30 }, rootCause: "", recommendedAction: "", governance: { policy: downtimePolicies[0], classification: "Internal", retentionPolicy: "3 Years" }, ai: { predictiveFailureAnalysis: true, rootCauseSuggestions: true, maintenanceRecommendations: true } }; }

export function DowntimeFactorModal({ factor, facilities, assets, onClose, onSave }: { factor: DowntimeFactor | null; facilities: Facility[]; assets: IndustrialAsset[]; onClose: () => void; onSave: (factor: DowntimeFactor) => void }) {
  const [form, setForm] = useState<DowntimeFactor>(() => factor ? structuredClone(factor) : blankFactor());
  const selectedSites = form.appliesTo.siteIds.length ? facilities.filter((site) => form.appliesTo.siteIds.includes(site.id)) : facilities;
  const halls = selectedSites.flatMap((site) => site.halls);
  const selectedHalls = form.appliesTo.hallIds.length ? halls.filter((hall) => form.appliesTo.hallIds.includes(hall.id)) : halls;
  const lines = selectedHalls.flatMap((hall) => hall.lines);
  const locationAssets = assets.filter((asset) =>
    (!form.appliesTo.siteIds.length || form.appliesTo.siteIds.includes(asset.location.siteId)) &&
    (!form.appliesTo.hallIds.length || form.appliesTo.hallIds.includes(asset.location.hallId)) &&
    (!form.appliesTo.lineIds.length || form.appliesTo.lineIds.includes(asset.location.lineId)),
  );
  const assetTypes = [...new Set(locationAssets.map((asset) => asset.machineType))];
  const scopedAssets = locationAssets.filter((asset) => !form.appliesTo.assetTypes.length || form.appliesTo.assetTypes.includes(asset.machineType));

  function updateSites(siteIds: string[]) {
    const validHalls = facilities.filter((site) => !siteIds.length || siteIds.includes(site.id)).flatMap((site) => site.halls);
    const validHallIds = new Set(validHalls.map((hall) => hall.id));
    const hallIds = form.appliesTo.hallIds.filter((id) => validHallIds.has(id));
    updateLocationScope(siteIds, hallIds, form.appliesTo.lineIds);
  }

  function updateHalls(hallIds: string[]) {
    updateLocationScope(form.appliesTo.siteIds, hallIds, form.appliesTo.lineIds);
  }

  function updateLines(lineIds: string[]) {
    updateLocationScope(form.appliesTo.siteIds, form.appliesTo.hallIds, lineIds);
  }

  function updateLocationScope(siteIds: string[], hallIds: string[], requestedLineIds: string[]) {
    const validFacilities = facilities.filter((site) => !siteIds.length || siteIds.includes(site.id));
    const validHalls = validFacilities.flatMap((site) => site.halls).filter((hall) => !hallIds.length || hallIds.includes(hall.id));
    const validLineIds = new Set(validHalls.flatMap((hall) => hall.lines).map((line) => line.id));
    const lineIds = requestedLineIds.filter((id) => validLineIds.has(id));
    const matchingAssets = assets.filter((asset) =>
      (!siteIds.length || siteIds.includes(asset.location.siteId)) &&
      (!hallIds.length || hallIds.includes(asset.location.hallId)) &&
      (!lineIds.length || lineIds.includes(asset.location.lineId)),
    );
    const validAssetTypes = new Set(matchingAssets.map((asset) => asset.machineType));
    const assetTypes = form.appliesTo.assetTypes.filter((type) => validAssetTypes.has(type));
    const validAssetIds = new Set(matchingAssets.filter((asset) => !assetTypes.length || assetTypes.includes(asset.machineType)).map((asset) => asset.assetId));

    setForm({
      ...form,
      appliesTo: {
        ...form.appliesTo,
        siteIds,
        hallIds,
        lineIds,
        assetTypes,
        assetIds: form.appliesTo.assetIds.filter((id) => validAssetIds.has(id)),
      },
    });
  }

  function updateAssetTypes(assetTypes: string[]) {
    const validAssetIds = new Set(locationAssets.filter((asset) => !assetTypes.length || assetTypes.includes(asset.machineType)).map((asset) => asset.assetId));
    setForm({ ...form, appliesTo: { ...form.appliesTo, assetTypes, assetIds: form.appliesTo.assetIds.filter((id) => validAssetIds.has(id)) } });
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSave(form); }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="downtime-factor-modal-title" className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:max-w-4xl sm:rounded-2xl"><header className="flex shrink-0 items-start gap-3 border-b p-5"><div className="grid size-10 place-items-center rounded-xl bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]"><AlertTriangle className="size-5" /></div><div className="min-w-0 flex-1"><h2 id="downtime-factor-modal-title" className="text-lg font-bold">{factor ? "Edit Downtime Factor" : "Add New Downtime Factor"}</h2><p className="mt-0.5 text-xs text-muted-foreground">Configure scope, cost controls, governance, SLA, and predictive settings.</p></div><button type="button" onClick={onClose} aria-label="Close downtime factor modal" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted"><X className="size-4" /></button></header><form id="downtime-factor-form" onSubmit={submit} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
    <Section title="Basic Information"><div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Factor Code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className={inputClass} placeholder="MF-101" /></label><label className={labelClass}>Factor Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Mechanical Failure" /></label><label className={labelClass}>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as DowntimeFactor["category"] })} className={inputClass}>{factorCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Impact Score (1-10)<input type="number" min={1} max={10} value={form.impactScore} onChange={(event) => setForm({ ...form, impactScore: Number(event.target.value) })} className={inputClass} /></label><label className={labelClass}>Severity<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as DowntimeFactor["severity"] })} className={inputClass}>{factorSeverities.map((item) => <option key={item}>{item}</option>)}</select></label><label className={`${labelClass} sm:col-span-2`}>Description<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-24 w-full resize-y rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></label></div></Section>
    <Section title="Applies To"><div className="grid gap-4 md:grid-cols-2"><CheckboxGroup label="Sites" options={facilities.map((item) => ({ value: item.id, label: item.name }))} selected={form.appliesTo.siteIds} onChange={updateSites} /><CheckboxGroup label="Halls" options={halls.map((item) => ({ value: item.id, label: item.name }))} selected={form.appliesTo.hallIds} onChange={updateHalls} /><CheckboxGroup label="Production Lines" options={lines.map((item) => ({ value: item.id, label: item.name }))} selected={form.appliesTo.lineIds} onChange={updateLines} /><CheckboxGroup label="Asset Types" options={assetTypes.map((item) => ({ value: item, label: item }))} selected={form.appliesTo.assetTypes} onChange={updateAssetTypes} scrollable /><div className="md:col-span-2"><CheckboxGroup label="Specific Assets" options={scopedAssets.map((item) => ({ value: item.assetId, label: `${item.assetId} — ${item.name}` }))} selected={form.appliesTo.assetIds} onChange={(assetIds) => setForm({ ...form, appliesTo: { ...form.appliesTo, assetIds } })} scrollable /></div><div className="md:col-span-2"><CheckboxGroup label="Trigger Sensor Types" options={sensorTypes.map((item) => ({ value: item, label: item }))} selected={form.appliesTo.sensorTypes} onChange={(types) => setForm({ ...form, appliesTo: { ...form.appliesTo, sensorTypes: types as DowntimeFactor["appliesTo"]["sensorTypes"] } })} /></div></div></Section>
    <Section title="Operational Costs & SLA"><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{([{ key: "estimatedRepairCost", label: "Estimated Repair Cost" }, { key: "estimatedProductionLoss", label: "Estimated Production Loss" }, { key: "averageCostPerHour", label: "Average Cost Per Hour" }, { key: "targetResolutionMinutes", label: "Target Resolution Time" }, { key: "escalationMinutes", label: "Escalation Time" }] as const).map((item) => <label key={item.key} className={labelClass}>{item.label}<input type="number" min={0} value={form.costs[item.key]} onChange={(event) => setForm({ ...form, costs: { ...form.costs, [item.key]: Number(event.target.value) } })} className={inputClass} /></label>)}</div></Section>
    <Section title="Root Cause & Recommended Action"><div className="grid gap-3"><label className={labelClass}>Root Cause<textarea value={form.rootCause} onChange={(event) => setForm({ ...form, rootCause: event.target.value })} className="min-h-20 w-full rounded-lg border bg-background p-3 text-sm" /></label><label className={labelClass}>Recommended Action<textarea value={form.recommendedAction} onChange={(event) => setForm({ ...form, recommendedAction: event.target.value })} className="min-h-20 w-full rounded-lg border bg-background p-3 text-sm" /></label></div></Section>
    <Section title="Governance"><div className="grid gap-3 sm:grid-cols-3"><label className={labelClass}>Governance Policy<select value={form.governance.policy} onChange={(event) => setForm({ ...form, governance: { ...form.governance, policy: event.target.value } })} className={inputClass}>{downtimePolicies.map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Classification<select value={form.governance.classification} onChange={(event) => setForm({ ...form, governance: { ...form.governance, classification: event.target.value as DowntimeFactor["governance"]["classification"] } })} className={inputClass}>{["Public", "Internal", "Confidential", "Restricted"].map((item) => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Retention Policy<select value={form.governance.retentionPolicy} onChange={(event) => setForm({ ...form, governance: { ...form.governance, retentionPolicy: event.target.value } })} className={inputClass}>{["1 Year", "2 Years", "3 Years", "5 Years", "7 Years", "Indefinite"].map((item) => <option key={item}>{item}</option>)}</select></label></div></Section>
    <Section title="AI Settings"><div className="grid gap-3 sm:grid-cols-3">{([{ key: "predictiveFailureAnalysis", label: "Enable Predictive Failure Analysis" }, { key: "rootCauseSuggestions", label: "Enable Root Cause Suggestions" }, { key: "maintenanceRecommendations", label: "Enable Maintenance Recommendations" }] as const).map((item) => <label key={item.key} className="flex items-center gap-2 rounded-lg border p-3 text-xs"><input type="checkbox" checked={form.ai[item.key]} onChange={(event) => setForm({ ...form, ai: { ...form.ai, [item.key]: event.target.checked } })} className="size-4 accent-[var(--primary)]" />{item.label}</label>)}</div></Section>
  </form><footer className="flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" form="downtime-factor-form" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Save className="size-4" />{factor ? "Save Changes" : "Add Factor"}</button></footer></section></div>;
}
