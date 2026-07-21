"use client";

import { useState } from "react";
import { Check, LockKeyhole, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";

import type { GovernancePolicy } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { governancePolicies as initialPolicies } from "./policy-data";
import { DeletePolicyModal, PolicyFormModal, type PolicyDraft } from "./policy-modals";
import { StatusBadge } from "./status-badge";

type ActivityEntry = { id: string; message: string; timestamp: string };

export function PoliciesStandards() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<GovernancePolicy | null | "create">(null);
  const [deleting, setDeleting] = useState<GovernancePolicy | null>(null);
  const [feedback, setFeedback] = useState("");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const filtered = policies.filter((policy) => `${policy.name} ${policy.appliesTo} ${policy.owner}`.toLowerCase().includes(query.toLowerCase()));

  function record(message: string) {
    setActivity((items) => [{ id: crypto.randomUUID(), message, timestamp: new Date().toLocaleString() }, ...items]);
    setFeedback(message);
  }

  function save(draft: PolicyDraft) {
    const date = new Date().toISOString().slice(0, 10);
    if (editing && editing !== "create") {
      setPolicies((items) => items.map((item) => item.id === editing.id ? { ...item, ...draft, updatedAt: date } : item));
      record(`Admin User updated governance policy: ${draft.name}`);
    } else {
      const sequence = Math.max(0, ...policies.map((item) => Number(item.id.replace(/\D/g, "")) || 0)) + 1;
      setPolicies((items) => [{ ...draft, id: `POL-${String(sequence).padStart(3, "0")}`, createdBy: "Admin User", createdAt: date, updatedAt: date }, ...items]);
      record(`Admin User created governance policy: ${draft.name}`);
    }
    setEditing(null);
  }

  function remove() {
    if (!deleting) return;
    setPolicies((items) => items.filter((item) => item.id !== deleting.id));
    record(`Admin User deleted governance policy: ${deleting.name}`);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      {feedback && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300"><span className="flex items-center gap-2"><Check className="size-4" />{feedback}</span><button type="button" onClick={() => setFeedback("")} className="font-semibold hover:underline">Dismiss</button></div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search policies</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policies..." className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label>
        <div className="flex items-center justify-between gap-4 sm:justify-end"><span className="text-xs text-muted-foreground">{filtered.length} policies</span><button type="button" onClick={() => setEditing("create")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/80"><Plus className="size-4" />Create Policy</button></div>
      </div>
      <GovernanceCard title="Policy Catalog" subtitle="Retention, protection, and review standards managed by Admin User">
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left">
          <thead className="bg-muted/60 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Policy</th><th className="px-4 py-3 font-medium">Applies to</th><th className="px-4 py-3 font-medium">Retention</th><th className="px-4 py-3 font-medium">Review</th><th className="px-4 py-3 font-medium">Protection</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map((policy) => <tr key={policy.id} className="hover:bg-muted/30">
            <td className="px-5 py-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"><ShieldCheck className="size-4" /></span><div><p className="text-[13px] font-semibold">{policy.name}</p><p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">{policy.description || "No description provided."}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">{policy.id} · Owner: {policy.owner}</p></div></div></td>
            <td className="px-4 py-4 text-xs">{policy.appliesTo}</td><td className="px-4 py-4 font-mono text-xs text-muted-foreground">{policy.retentionPeriod}</td>
            <td className="px-4 py-4"><p className="text-xs">{policy.reviewFrequency || "Not set"}</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Updated {policy.updatedAt}</p></td>
            <td className="px-4 py-4"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" />{policy.encryptionRequired ? "Encrypted" : "Standard"}</span></td>
            <td className="px-4 py-4"><StatusBadge status={policy.status} /></td>
            <td className="px-4 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setEditing(policy)} aria-label={`Edit ${policy.name}`} className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-primary"><Pencil className="size-4" /></button><button type="button" onClick={() => setDeleting(policy)} aria-label={`Delete ${policy.name}`} className="grid size-9 place-items-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button></div></td>
          </tr>)}</tbody>
        </table>{!filtered.length && <p className="p-10 text-center text-sm text-muted-foreground">No governance policies match this search.</p>}</div>
      </GovernanceCard>
      {activity.length > 0 && <GovernanceCard title="Session Activity" subtitle="Governance changes in this session"><div className="divide-y">{activity.slice(0, 4).map((entry) => <div key={entry.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between"><p className="text-xs">{entry.message}</p><time className="font-mono text-[9px] text-muted-foreground">{entry.timestamp}</time></div>)}</div></GovernanceCard>}
      {editing && <PolicyFormModal policy={editing === "create" ? undefined : editing} onClose={() => setEditing(null)} onSave={save} />}
      {deleting && <DeletePolicyModal policy={deleting} onClose={() => setDeleting(null)} onConfirm={remove} />}
    </div>
  );
}
