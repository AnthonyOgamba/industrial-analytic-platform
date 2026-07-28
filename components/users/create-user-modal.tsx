"use client";

import { useState, type FormEvent } from "react";
import { UserPlus, X } from "lucide-react";

export type CreateUserInput = { username:string; email:string; role:string; facilityIds:number[] };

export function CreateUserModal({
  onClose,
  onCreate,
  roles,
  facilities,
  pending,
  error,
}: {
  onClose:()=>void;
  onCreate:(input:CreateUserInput)=>void;
  roles:Array<{role:string;displayName:string}>;
  facilities:Array<{facilityId:number;name:string}>;
  pending:boolean;
  error:string;
}) {
  const [username,setUsername]=useState("");
  const [email,setEmail]=useState("");
  const [role,setRole]=useState(roles[0]?.role??"viewer");
  const [facilityId,setFacilityId]=useState("");
  const valid=Boolean(username.trim()&&email.trim()&&role);
  const inputClass="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30";
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(valid) onCreate({username:username.trim(),email:email.trim(),role,facilityIds:facilityId?[Number(facilityId)]:[]});
  }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section role="dialog" aria-modal="true" aria-labelledby="create-user-title" className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UserPlus className="size-5"/></span><div className="flex-1"><h2 id="create-user-title" className="text-lg font-bold">Create User</h2><p className="mt-1 text-xs text-muted-foreground">Create a user identity with role and facility scope</p></div><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted" aria-label="Close create user modal"><X className="size-4"/></button></header><form id="create-user-form" onSubmit={submit} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"><label className="block text-xs font-medium">Username *<input required value={username} onChange={event=>setUsername(event.target.value)} className={inputClass}/></label><label className="block text-xs font-medium">Email Address *<input required type="email" value={email} onChange={event=>setEmail(event.target.value)} className={inputClass}/></label><label className="block text-xs font-medium">RBAC Role<select value={role} onChange={event=>setRole(event.target.value)} className={inputClass}>{roles.map(item=><option key={item.role} value={item.role}>{item.displayName||item.role}</option>)}</select></label><label className="block text-xs font-medium">Primary Facility<select value={facilityId} onChange={event=>setFacilityId(event.target.value)} className={inputClass}><option value="">No facility assignment</option>{facilities.map(item=><option key={item.facilityId} value={item.facilityId}>{item.name}</option>)}</select></label>{error&&<p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}</form><footer className="flex shrink-0 justify-end gap-2 border-t p-4"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-xs font-semibold hover:bg-muted">Cancel</button><button type="submit" form="create-user-form" disabled={!valid||pending} className="h-10 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground disabled:opacity-40">{pending?"Creating…":"Create User"}</button></footer></section></div>;
}
