"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { normalizeArrayResponse } from "@/lib/api-normalizers";
import type { BackendRoleDto, GovernanceRecordDto, GovernanceRetirementDto, PagedEnvelope } from "@/lib/backend-dtos";
import { useSessionUser } from "@/lib/session-user";

import type { GovernancePolicy } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { DeletePolicyModal, PolicyFormModal, type PolicyDraft } from "./policy-modals";
import { StatusBadge } from "./status-badge";

type ActivityEntry = { id: string; message: string; timestamp: string };

function mapGovernanceRecord(record: GovernanceRecordDto): GovernancePolicy {
  const retentionPeriod = record.retentionDays % 365 === 0
    ? `${record.retentionDays / 365} Year${record.retentionDays === 365 ? "" : "s"}`
    : `${record.retentionDays} Days`;
  const status = record.status.toLowerCase() === "active" ? "Active"
    : record.status.toLowerCase() === "draft" ? "Draft"
      : record.status.toLowerCase() === "archived" ? "Archived"
        : "Under Review";
  const value = record.classification.toLowerCase();
  const classification = value === "public" ? "Public"
    : value === "confidential" ? "Confidential"
      : value === "restricted" ? "Restricted"
        : "Internal";
  return {
    id: record.governanceId,
    name: record.name,
    owner: record.ownerType === "role" ? record.ownerId ?? "" : "",
    description: record.description,
    appliesTo: record.domain,
    status,
    retentionPeriod,
    reviewFrequency: "",
    archiveRule: "",
    deletionRule: "",
    piiHandling: "",
    encryptionRequired: false,
    classification,
    riskLevel: "",
    approvalRequired: false,
    complianceStandard: "",
    createdBy: String(record.createdBy),
    createdAt: record.createdAtUtc.slice(0, 10),
    updatedAt: record.updatedAtUtc.slice(0, 10),
  };
}

function toGovernanceRequest(draft: PolicyDraft) {
  const amount = Number.parseInt(draft.retentionPeriod, 10);
  const retentionDays = draft.retentionPeriod.includes("Year") ? amount * 365 : amount;
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    facilityId: null,
    domain: draft.appliesTo,
    classification: (draft.classification || "Internal").toLowerCase(),
    retentionDays: Number.isFinite(retentionDays) ? retentionDays : 365,
    status: draft.status.toLowerCase().replace("under review", "under_review"),
    source: "manual",
    isSynthetic: false,
    ownerType: draft.owner ? "role" : null,
    ownerId: draft.owner || null,
  };
}

export function PoliciesStandards() {
  const session = useSessionUser();
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<GovernancePolicy | null | "create">(null);
  const [deleting, setDeleting] = useState<GovernancePolicy | null>(null);
  const [feedback, setFeedback] = useState("");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retiring, setRetiring] = useState(false);
  const [retireError, setRetireError] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [roles, setRoles] = useState<BackendRoleDto[]>([]);
  const filtered = policies.filter((policy) => `${policy.name} ${policy.appliesTo} ${policy.owner}`.toLowerCase().includes(query.toLowerCase()));

  function record(message: string) {
    setActivity((items) => [{ id: crypto.randomUUID(), message, timestamp: new Date().toLocaleString() }, ...items]);
    setFeedback(message);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<PagedEnvelope<GovernanceRecordDto>>("/api/backend/data-governance?page=1&pageSize=200");
      setCanManage(session.user?.capabilities.includes("governance.create") ?? false);
      setPolicies(response.items.map(mapGovernanceRecord));
      setLoading(false);
      void apiRequest<unknown>("/api/backend/roles").then(value=>setRoles(normalizeArrayResponse<BackendRoleDto>(value, ["roles"], "roles"))).catch(()=>undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Governance policies could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session.user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function save(draft: PolicyDraft) {
    const existing = editing && editing !== "create" ? editing : undefined;
    setError("");
    try {
      await apiRequest<GovernanceRecordDto>(existing ? `/api/backend/data-governance/${existing.id}` : "/api/backend/data-governance", {
        method: existing ? "PATCH" : "POST",
        body: JSON.stringify(toGovernanceRequest(draft)),
      });
      record(`${existing ? "Updated" : "Created"} governance policy: ${draft.name}`);
      setEditing(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The governance policy could not be saved.");
    }
  }

  async function retire(reason: string) {
    if (!deleting) return;
    setRetiring(true);
    setRetireError("");
    try {
      await apiRequest<GovernanceRetirementDto>(`/api/backend/data-governance/${deleting.id}`, {
        method: "DELETE",
        ...(reason ? { body: JSON.stringify({ reason }) } : {}),
      });
      record(`Retired governance policy: ${deleting.name}`);
      setDeleting(null);
      await load();
    } catch (cause) {
      setRetireError(cause instanceof Error ? cause.message : "The governance policy could not be retired.");
    } finally {
      setRetiring(false);
    }
  }

  return (
    <div className="space-y-4">
      {feedback && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300"><span className="flex items-center gap-2"><Check className="size-4" />{feedback}</span><button type="button" onClick={() => setFeedback("")} className="font-semibold hover:underline">Dismiss</button></div>}
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}<button type="button" onClick={() => void load()} className="ml-3 underline">Retry</button></div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search policies</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policies..." className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30" /></label>
        <div className="flex items-center justify-between gap-4 sm:justify-end"><span className="text-xs text-muted-foreground">{filtered.length} policies</span>{canManage && <button type="button" onClick={() => setEditing("create")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/80"><Plus className="size-4" />Create Policy</button>}</div>
      </div>
      <GovernanceCard title="Policy Catalog" subtitle="Retention, protection, and review standards managed through the DIVU platform">
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left">
          <thead className="bg-muted/60 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Policy</th><th className="px-4 py-3 font-medium">Applies to</th><th className="px-4 py-3 font-medium">Retention</th><th className="px-4 py-3 font-medium">Classification</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map((policy) => <tr key={policy.id} className="hover:bg-muted/30">
            <td className="px-5 py-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"><ShieldCheck className="size-4" /></span><div><p className="text-[13px] font-semibold">{policy.name}</p><p className="mt-1 max-w-sm text-[11px] leading-5 text-muted-foreground">{policy.description || "No description provided."}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{policy.id}{policy.owner ? ` · Owner: ${policy.owner}` : ""}</p></div></div></td>
            <td className="px-4 py-4 text-xs">{policy.appliesTo}</td><td className="px-4 py-4 font-mono text-xs text-muted-foreground">{policy.retentionPeriod}</td>
            <td className="px-4 py-4 text-xs">{policy.classification || "Internal"}</td>
            <td className="px-4 py-4"><StatusBadge status={policy.status} /></td>
            <td className="px-4 py-4"><div className="flex justify-end gap-1">{canManage && <><button type="button" onClick={() => setEditing(policy)} aria-label={`Edit ${policy.name}`} className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-primary"><Pencil className="size-4" /></button><button type="button" onClick={() => setDeleting(policy)} aria-label={`Retire ${policy.name}`} className="grid size-9 place-items-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button></>}</div></td>
          </tr>)}</tbody>
        </table>{loading ? <p className="p-10 text-center text-sm text-muted-foreground">Loading governance policies…</p> : !filtered.length && <p className="p-10 text-center text-sm text-muted-foreground">No governance policies match this search.</p>}</div>
      </GovernanceCard>
      {activity.length > 0 && <GovernanceCard title="Session Activity" subtitle="Governance changes in this session"><div className="divide-y">{activity.slice(0, 4).map((entry) => <div key={entry.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:justify-between"><p className="text-xs">{entry.message}</p><time className="font-mono text-xs text-muted-foreground">{entry.timestamp}</time></div>)}</div></GovernanceCard>}
      {editing && <PolicyFormModal policy={editing === "create" ? undefined : editing} roles={roles} onClose={() => setEditing(null)} onSave={(draft) => void save(draft)} />}
      {deleting && <DeletePolicyModal policy={deleting} onClose={() => { setDeleting(null); setRetireError(""); }} onConfirm={(reason) => void retire(reason)} pending={retiring} error={retireError} />}
    </div>
  );
}
