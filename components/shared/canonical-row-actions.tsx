"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

import { apiRequest } from "@/lib/api-client";

export function CanonicalRowActions({
  label,
  deleteEndpoint,
  pendingApproval,
  onEdit,
  onPendingApproval,
}: {
  label: string;
  deleteEndpoint: string;
  pendingApproval: boolean;
  onEdit: () => void;
  onPendingApproval: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function requestDeletion() {
    if (!reason.trim()) return;
    setPending(true);
    setError("");
    try {
      await apiRequest(deleteEndpoint, {
        method: "DELETE",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      onPendingApproval();
      window.dispatchEvent(new Event("divu-approvals-changed"));
      setConfirming(false);
      setReason("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The deletion request failed.");
    } finally {
      setPending(false);
    }
  }

  if (pendingApproval) {
    return <span className="whitespace-nowrap rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700">Pending Approval</span>;
  }

  return <>
    <div className="flex whitespace-nowrap">
      <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-1 rounded-l-lg border px-2 text-xs hover:bg-muted"><Pencil className="size-3"/>Edit</button>
      <button type="button" onClick={()=>setConfirming(true)} className="inline-flex h-8 items-center gap-1 rounded-r-lg border border-l-0 px-2 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="size-3"/>Request deletion</button>
    </div>
    {confirming&&<div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center sm:p-5" onMouseDown={event=>event.target===event.currentTarget&&!pending&&setConfirming(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="delete-request-title" className="w-full max-w-lg rounded-t-2xl border bg-background p-5 shadow-2xl sm:rounded-2xl">
        <header className="flex items-start gap-3"><div className="flex-1"><h2 id="delete-request-title" className="font-bold">Request deletion</h2><p className="mt-1 text-xs text-muted-foreground">This creates an approval request and does not immediately delete the record.</p></div><button type="button" disabled={pending} onClick={()=>setConfirming(false)} aria-label="Close deletion request" className="grid size-9 place-items-center rounded-lg border"><X className="size-4"/></button></header>
        <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-xs"><span className="text-muted-foreground">Exact record</span><strong className="mt-1 block">{label}</strong></div>
        <label className="mt-4 block text-xs">Reason<textarea required value={reason} onChange={event=>setReason(event.target.value)} placeholder="Explain why this record should be deleted" className="mt-1 min-h-24 w-full rounded-lg border bg-background p-3"/></label>
        {error&&<p role="alert" className="mt-3 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
        <div className="mt-4 flex justify-end gap-2"><button type="button" disabled={pending} onClick={()=>setConfirming(false)} className="h-10 rounded-lg border px-4 text-xs">Cancel</button><button type="button" disabled={pending||!reason.trim()} onClick={()=>void requestDeletion()} className="h-10 rounded-lg bg-destructive px-4 text-xs font-semibold text-destructive-foreground disabled:opacity-40">{pending?"Requesting…":"Request deletion"}</button></div>
      </section>
    </div>}
  </>;
}
