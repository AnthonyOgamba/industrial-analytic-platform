"use client";

// FEATURE: User deletion request and temporary passcode regeneration
// API: POST /api/backend/users/{userId}/permanent-deletion creates an auditable request.
// SECURITY: Typed confirmation, reason, and users.delete are required; secrets display once.

import { useState } from "react";
import { Check, Copy, KeyRound, ShieldAlert, Trash2, X } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import type { TemporaryPasscodeResponse } from "@/lib/backend-dtos";
import { useSessionUser } from "@/lib/session-user";
import { PERMISSIONS } from "@/lib/permissions";
import { useUserDirectory } from "@/lib/user-directory";

export function SensitiveUserActions() {
  const directory=useUserDirectory();const users=directory.users;const load=directory.refresh;
  const session=useSessionUser();
  const [selectedId,setSelectedId]=useState("");
  const [mode,setMode]=useState<"passcode"|"delete"|null>(null);
  const [typed,setTyped]=useState("");
  const [reason,setReason]=useState("");
  const [pending,setPending]=useState(false);
  const [error,setError]=useState("");
  const [passcode,setPasscode]=useState<string|null>(null);
  const [success,setSuccess]=useState("");
  const permissions=new Set(session.user?.permissions??session.user?.capabilities??[]);
  const canRegenerate=permissions.has(PERMISSIONS.users.update);
  const canDelete=permissions.has(PERMISSIONS.users.delete);
  const canManage=permissions.has(PERMISSIONS.users.view)&&(canRegenerate||canDelete);
  const selected=users.find(item=>item.uid===Number(selectedId));
  if(!canManage)return null;

  async function regenerate(){
    if(!selected||!canRegenerate)return;
    setPending(true);setError("");
    try{const result=await apiRequest<TemporaryPasscodeResponse>(`/api/backend/users/${selected.uid}/temporary-passcode/regenerate`,{method:"POST",body:"{}"});setPasscode(result.temporaryPasscode);setMode(null)}
    catch(cause){setError(cause instanceof Error?cause.message:"Temporary passcode regeneration failed.")}
    finally{setPending(false)}
  }
  // HANDLER: Delete User
  // API: POST /api/backend/users/{userId}/permanent-deletion creates an auditable request.
  async function requestDeletion(){
    if(!selected||!canDelete||typed!=="DELETE"||!reason.trim())return;
    setPending(true);setError("");
    try{const result=await apiRequest<{requestId:string;status:string}>(`/api/backend/users/${selected.uid}/permanent-deletion`,{method:"POST",body:JSON.stringify({reason:reason.trim()})});setSuccess(`Permanent deletion request ${result.requestId} is ${result.status}.`);setMode(null);setTyped("");setReason("");await load()}
    catch(cause){setError(cause instanceof Error?cause.message:"Permanent deletion request failed.")}
    finally{setPending(false)}
  }

  return <section className="space-y-3 rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]">
    <header><h2 className="flex items-center gap-2 text-sm font-bold"><ShieldAlert className="size-4 text-primary"/>Sensitive identity actions</h2><p className="mt-1 text-xs text-muted-foreground">Temporary credentials and approval-backed permanent deletion are separate from account deactivation.</p></header>
    {success&&<p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700"><Check className="size-4"/>{success}</p>}
    {error&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
    <div className="flex flex-col gap-2 sm:flex-row">
      <select value={selectedId} onChange={event=>setSelectedId(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 text-xs"><option value="">Select user</option>{users.filter(item=>item.status!=="deleted").map(item=><option key={item.uid} value={item.uid}>{item.username} · {item.email}</option>)}</select>
      {canRegenerate&&<button disabled={!selected||selected.uid===session.user?.uid} onClick={()=>setMode("passcode")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs disabled:opacity-40"><KeyRound className="size-4"/>Regenerate passcode</button>}
      {canDelete&&<button disabled={!selected||selected.uid===session.user?.uid} onClick={()=>setMode("delete")} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 text-xs text-destructive disabled:opacity-40"><Trash2 className="size-4"/>Permanently delete</button>}
    </div>
    {selected?.uid===session.user?.uid&&<p className="text-xs text-amber-700">You cannot perform these sensitive actions on your own account.</p>}
    {mode&&selected&&<div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="identity-action-title" className="w-full max-w-lg rounded-t-2xl border bg-background p-5 shadow-2xl sm:rounded-2xl"><header className="flex"><div className="flex-1"><h3 id="identity-action-title" className="font-bold">{mode==="passcode"?"Regenerate temporary passcode":"Request permanent deletion"}</h3><p className="mt-1 text-xs text-muted-foreground">{selected.username}</p></div><button onClick={()=>setMode(null)} aria-label="Close sensitive action" className="grid size-9 place-items-center rounded-lg border"><X className="size-4"/></button></header>
      {mode==="passcode"?<><p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">This revokes existing sessions and requires a password change at first login. The returned passcode will be displayed once.</p><button disabled={pending} onClick={()=>void regenerate()} className="mt-4 h-10 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground">{pending?"Regenerating…":"Confirm regeneration"}</button></>:<><p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs">This requests irreversible erasure through the approval workflow.</p><label className="mt-4 block text-xs">Type <strong>DELETE</strong> to confirm<input value={typed} onChange={event=>setTyped(event.target.value)} className="mt-1 h-10 w-full rounded-lg border bg-background px-3"/></label><label className="mt-3 block text-xs">Reason<textarea required value={reason} onChange={event=>setReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border bg-background p-3"/></label><button disabled={pending||typed!=="DELETE"||!reason.trim()} onClick={()=>void requestDeletion()} className="mt-4 h-10 w-full rounded-lg bg-destructive text-xs font-semibold text-white disabled:opacity-40">{pending?"Submitting…":"Request permanent deletion"}</button></>}
    </section></div>}
    {passcode&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5"><section role="dialog" aria-modal="true" aria-labelledby="passcode-title" className="w-full max-w-lg rounded-2xl border bg-background p-5 shadow-2xl"><h3 id="passcode-title" className="font-bold">Temporary passcode generated</h3><p className="mt-2 text-xs text-amber-700">Copy this passcode now. It will not be shown again.</p><div className="mt-4 flex gap-2"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg border bg-muted p-3">{passcode}</code><button onClick={()=>void navigator.clipboard.writeText(passcode)} aria-label="Copy temporary passcode" className="grid size-11 place-items-center rounded-lg border"><Copy className="size-4"/></button></div><button onClick={()=>setPasscode(null)} className="mt-4 h-10 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground">I have saved it</button></section></div>}
  </section>;
}
