"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FileCheck2, Trash2, X } from "lucide-react";

import type { GovernancePolicy } from "./governance-data";
import type { BackendRoleDto } from "@/lib/backend-dtos";

const scopes = ["All Manufacturing Data", "Sensor Telemetry", "Asset Registry", "Downtime Events", "Financial Analytics", "API Clients", "Audit Logs", "User Activity", "Reports", "Production Data"];
const retentionPeriods = ["30 Days", "90 Days", "1 Year", "3 Years", "5 Years", "7 Years"];

export type PolicyDraft = Omit<GovernancePolicy, "id" | "createdBy" | "createdAt" | "updatedAt">;

const emptyDraft: PolicyDraft = {
  name: "", owner: "", description: "", appliesTo: "", status: "Draft",
  retentionPeriod: "", reviewFrequency: "", archiveRule: "", deletionRule: "",
  piiHandling: "", encryptionRequired: false, classification: "", riskLevel: "",
  approvalRequired: false, complianceStandard: "",
};

const inputClass = "mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50";
const labelClass = "block text-[10px] font-semibold text-foreground";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="space-y-3"><legend className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{title}</legend>{children}</fieldset>;
}

export function PolicyFormModal({ policy, roles, onClose, onSave }: { policy?: GovernancePolicy; roles: BackendRoleDto[]; onClose: () => void; onSave: (draft: PolicyDraft) => void }) {
  const [draft, setDraft] = useState<PolicyDraft>(() => policy ? {
    name: policy.name, owner: policy.owner, description: policy.description, appliesTo: policy.appliesTo,
    status: policy.status, retentionPeriod: policy.retentionPeriod, reviewFrequency: policy.reviewFrequency,
    archiveRule: policy.archiveRule, deletionRule: policy.deletionRule, piiHandling: policy.piiHandling,
    encryptionRequired: policy.encryptionRequired, classification: policy.classification, riskLevel: policy.riskLevel,
    approvalRequired: policy.approvalRequired, complianceStandard: policy.complianceStandard,
  } : emptyDraft);
  const [attempted, setAttempted] = useState(false);
  const valid = Boolean(draft.name.trim() && draft.appliesTo && draft.retentionPeriod);
  const set = <K extends keyof PolicyDraft>(key: K, value: PolicyDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (valid) onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="policy-form-title" className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-start gap-3 border-b p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileCheck2 className="size-5" /></span>
          <div className="min-w-0 flex-1"><h2 id="policy-form-title" className="text-lg font-bold">{policy ? "Edit Policy" : "Create Policy"}</h2><p className="mt-0.5 text-xs text-muted-foreground">{policy ? "Update governance policy" : "New governance policy"} with role-based ownership</p></div>
          <button type="button" onClick={onClose} aria-label="Close policy modal" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
        </header>
        <form id="policy-form" onSubmit={submit} className="min-h-0 flex-1 space-y-6 overscroll-contain overflow-y-auto p-5 pb-8">
          {attempted && !valid && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">Complete Policy Name, Applies To, and Retention Period.</p>}
          <Section title="Basic Policy Information"><div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>Policy Name *<input value={draft.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="Production data lifecycle" aria-invalid={attempted && !draft.name.trim()} /></label>
            <label className={labelClass}>Owner role<select value={draft.owner} onChange={(e) => set("owner", e.target.value)} className={inputClass}><option value="">No owner assigned</option>{roles.map((role) => <option key={role.role} value={role.role}>{role.displayName || role.role}</option>)}</select></label>
            <label className={labelClass}>Applies To *<select value={draft.appliesTo} onChange={(e) => set("appliesTo", e.target.value)} className={inputClass}><option value="">Select data scope</option>{scopes.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className={labelClass}>Status<select value={draft.status} onChange={(e) => set("status", e.target.value as PolicyDraft["status"])} className={inputClass}>{["Draft", "Active", "Under Review", "Archived"].map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className={`${labelClass} sm:col-span-2`}>Description<textarea value={draft.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass} min-h-20 resize-y py-2.5`} placeholder="Purpose, coverage, and policy intent" /></label>
          </div></Section>
          <Section title="Retention"><div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>Retention Period *<select value={draft.retentionPeriod} onChange={(e) => set("retentionPeriod", e.target.value)} className={inputClass}><option value="">Select retention period</option>{retentionPeriods.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className={labelClass}>Classification<select value={draft.classification} onChange={(e) => set("classification", e.target.value as PolicyDraft["classification"])} className={inputClass}><option value="">Not assigned</option>{["Public", "Internal", "Confidential", "Restricted"].map((x) => <option key={x}>{x}</option>)}</select></label>
          </div></Section>
        </form>
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t bg-background p-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" form="policy-form" disabled={!valid} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">{policy ? "Save Changes" : "Create Policy"}</button></footer>
      </section>
    </div>
  );
}

export function DeletePolicyModal({ policy, onClose, onConfirm, pending = false, error = "" }: { policy: GovernancePolicy; onClose: () => void; onConfirm: (reason: string) => void; pending?: boolean; error?: string }) {
  const [reason, setReason] = useState("");
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && !pending && onClose()}><section role="alertdialog" aria-modal="true" aria-labelledby="delete-policy-title" className="w-full max-w-md overflow-hidden rounded-2xl border bg-background shadow-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle className="size-5" /></span><div className="flex-1"><h2 id="delete-policy-title" className="font-bold">Retire Policy</h2><p className="mt-1 text-xs text-muted-foreground">Audit history is retained when this governance record is retired.</p></div><button type="button" disabled={pending} onClick={onClose} aria-label="Close retirement confirmation" className="grid size-8 place-items-center rounded-lg hover:bg-muted disabled:opacity-40"><X className="size-4" /></button></header><div className="space-y-3 p-5 text-sm"><p>Are you sure you want to retire this governance policy?</p><p className="rounded-lg border bg-muted/40 p-3 font-semibold">{policy.name}</p><label className="block text-xs font-semibold">Retirement reason (optional)<textarea maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 min-h-20 w-full resize-y rounded-lg border bg-background p-3 text-xs" /></label>{error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}</div><footer className="flex justify-end gap-2 border-t p-4"><button type="button" disabled={pending} onClick={onClose} className="h-10 rounded-lg border px-4 text-xs font-semibold hover:bg-muted disabled:opacity-40">Cancel</button><button type="button" disabled={pending} onClick={() => onConfirm(reason.trim())} className="inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-4 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40"><Trash2 className="size-4" />{pending ? "Retiring…" : "Retire Policy"}</button></footer></section></div>;
}
