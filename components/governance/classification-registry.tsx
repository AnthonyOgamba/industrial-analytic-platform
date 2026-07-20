"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronRight, Database, FileText, LockKeyhole, Search, X } from "lucide-react";

import { datasets, type ClassificationLevel, type Dataset } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { governancePolicies } from "./policy-data";
import { ClassificationBadge, StatusBadge } from "./status-badge";

const levels: Array<"All" | ClassificationLevel> = ["All", "Public", "Internal", "Confidential", "Restricted"];

function reviewState(nextReview: string) {
  const days = Math.ceil((new Date(`${nextReview}T23:59:59`).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Overdue", className: "bg-[var(--dv-badge-cr-bg)] text-[var(--dv-badge-cr-text)]" };
  if (days <= 30) return { label: "Due Soon", className: "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]" };
  return { label: "Current", className: "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" };
}

function nextReviewDate(frequency: string) {
  const date = new Date();
  const months = frequency === "Monthly" ? 1 : frequency === "Quarterly" ? 3 : frequency === "Semi-Annual" ? 6 : 12;
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function DetailRows({ rows }: { rows: string[][] }) {
  return <dl>{rows.map(([label, value]) => <div key={label} className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:items-center"><dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</dt><dd className="text-sm font-semibold">{value}</dd></div>)}</dl>;
}

function DatasetDetailModal({ dataset, onClose, onReview }: { dataset: Dataset; onClose: () => void; onReview: () => void }) {
  const policy = governancePolicies.find((item) => item.name === dataset.policy);
  const state = reviewState(dataset.nextReview);
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const registryRows = [
    ["Business Owner", dataset.owner], ["Technical Owner", dataset.technicalOwner], ["Data Steward", dataset.steward],
    ["Record Volume", dataset.volume], ["Assigned Policy", dataset.policy], ["Last Reviewed", dataset.lastReviewed],
    ["Last Reviewed By", dataset.lastReviewedBy], ["Next Review", dataset.nextReview],
  ];
  const policyRows = policy ? [
    ["Policy Name", policy.name], ["Owner / Team", policy.owner], ["Applies To", policy.appliesTo], ["Status", policy.status],
    ["Retention Period", policy.retentionPeriod], ["Review Frequency", policy.reviewFrequency || "Not assigned"],
    ["Archive Rule", policy.archiveRule || "Not assigned"], ["Deletion Rule", policy.deletionRule || "Not assigned"],
    ["PII Handling", policy.piiHandling || "Not assigned"], ["Encryption Required", policy.encryptionRequired ? "Yes — at rest and in transit" : "No"],
    ["Classification", policy.classification || "Not assigned"], ["Risk Level", policy.riskLevel || "Not assigned"],
    ["Approval Required", policy.approvalRequired ? "Yes" : "No"], ["Compliance Standard", policy.complianceStandard || "Not assigned"],
  ] : [];

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section role="dialog" aria-modal="true" aria-labelledby="dataset-detail-title" className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-[var(--dv-header)] shadow-2xl"><header className="flex shrink-0 items-start gap-4 border-b px-6 py-5"><div className="min-w-0 flex-1"><h2 id="dataset-detail-title" className="truncate text-xl font-bold tracking-tight">{dataset.name}</h2><p className="mt-1 text-sm text-muted-foreground">{dataset.classification} · {dataset.department}</p></div><button type="button" onClick={onClose} aria-label="Close dataset details" className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-5" /></button></header><div className="min-h-0 flex-1 overflow-y-auto px-6 py-6"><p className="mb-6 text-sm leading-6 text-muted-foreground">{dataset.description}</p><div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Registry Details</h3><span className={`rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase ${state.className}`}>{state.label}</span></div><DetailRows rows={registryRows} />{policy && <section className="mt-7 border-t pt-6"><h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Assigned Policy Details</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{policy.description || "No policy description provided."}</p><div className="mt-2"><DetailRows rows={policyRows} /></div></section>}</div><footer className="flex shrink-0 flex-col-reverse gap-2 border-t bg-[var(--dv-header)] p-4 sm:flex-row sm:justify-end"><Link href="/users" className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-xs font-semibold hover:bg-muted">Manage Owners in Users</Link><Link href="/roles" className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-xs font-semibold hover:bg-muted">Review Roles</Link><button type="button" onClick={onReview} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"><CheckCircle2 className="size-4" />Mark Reviewed</button></footer></section></div>;
}

export function ClassificationRegistry() {
  const [registry, setRegistry] = useState(datasets);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const [selected, setSelected] = useState<Dataset | null>(null);
  const [feedback, setFeedback] = useState("");
  const filtered = useMemo(() => registry.filter((dataset) => (level === "All" || dataset.classification === level) && `${dataset.name} ${dataset.department} ${dataset.owner} ${dataset.technicalOwner} ${dataset.steward}`.toLowerCase().includes(query.toLowerCase())), [level, query, registry]);

  function markReviewed(dataset: Dataset) {
    const policy = governancePolicies.find((item) => item.name === dataset.policy);
    const today = new Date().toISOString().slice(0, 10);
    const next = { ...dataset, lastReviewed: today, lastReviewedBy: "Admin User", nextReview: nextReviewDate(policy?.reviewFrequency || "Annual") };
    setRegistry((items) => items.map((item) => item.id === next.id ? next : item));
    setSelected(next);
    setFeedback(`Admin User reviewed registry entry: ${dataset.name}`);
  }

  return <div className="space-y-4">{feedback && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300"><span className="flex items-center gap-2"><Check className="size-4" />{feedback}</span><button type="button" onClick={() => setFeedback("")} className="font-semibold hover:underline">Dismiss</button></div>}<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search datasets</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search datasets, owners, or departments" className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label><div className="flex items-center gap-3"><select value={level} onChange={(event) => setLevel(event.target.value as (typeof levels)[number])} className="h-10 rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" aria-label="Filter by classification">{levels.map((item) => <option key={item}>{item}</option>)}</select><span className="whitespace-nowrap text-xs text-muted-foreground">{filtered.length} shown</span></div></div><div className="grid gap-4 xl:grid-cols-2">{filtered.map((dataset) => <div key={dataset.id} role="button" tabIndex={0} aria-label={`View ${dataset.name} details`} onClick={() => setSelected(dataset)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(dataset); } }} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"><GovernanceCard><div className="cursor-pointer p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary"><Database className="size-4" /></span><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{dataset.name}</h2><div className="mt-1.5 flex flex-wrap gap-1.5"><ClassificationBadge level={dataset.classification} />{dataset.encrypted && <span className="inline-flex items-center gap-1 rounded-md bg-[var(--dv-badge-ok-bg)] px-2 py-1 font-mono text-[9px] font-semibold uppercase text-[var(--dv-badge-ok-text)]"><LockKeyhole className="size-3" />Encrypted</span>}{dataset.pii && <span className="rounded-md bg-[var(--dv-badge-cr-bg)] px-2 py-1 font-mono text-[9px] font-semibold uppercase text-[var(--dv-badge-cr-text)]">PII</span>}</div></div></div><StatusBadge status={dataset.status} /></div><p className="mt-4 text-xs leading-5 text-muted-foreground">{dataset.description}</p><div className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-[11px] font-medium text-accent-foreground"><FileText className="size-3.5 shrink-0" /><span className="truncate">{dataset.policy}</span></div></div><div className="grid cursor-pointer grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 border-t bg-muted/20 px-5 py-3"><div><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Owner</p><p className="mt-1 truncate text-[11px] font-semibold">{dataset.owner}</p></div><div><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Steward</p><p className="mt-1 truncate text-[11px] font-semibold">{dataset.steward}</p></div><div><p className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Review</p><p className="mt-1 truncate text-[11px] font-semibold">{reviewState(dataset.nextReview).label}</p></div><ChevronRight className="size-4 text-muted-foreground" /></div></GovernanceCard></div>)}</div>{selected && <DatasetDetailModal dataset={selected} onClose={() => setSelected(null)} onReview={() => markReviewed(selected)} />}</div>;
}
