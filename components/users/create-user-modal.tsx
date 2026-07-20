"use client";

import { useState, type FormEvent } from "react";
import { UserPlus, X } from "lucide-react";

import { roleOptions, siteOptions, type PlatformUser, type UserRole } from "./users-data";

export function CreateUserModal({ onClose, onCreate }: { onClose: () => void; onCreate: (user: PlatformUser) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [site, setSite] = useState("");
  const [role, setRole] = useState<UserRole>("Viewer");
  const [sendInvite, setSendInvite] = useState(true);
  const valid = Boolean(name.trim() && email.trim() && department.trim());
  const inputClass = "mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    const cleanName = name.trim();
    onCreate({
      id: `u-${crypto.randomUUID()}`,
      name: cleanName,
      email: email.trim(),
      initials: cleanName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
      role,
      department: department.trim(),
      sites: site ? [site] : [],
      lastLogin: "Never",
      status: sendInvite ? "Pending" : "Active",
      mfa: role === "Administrator" ? "Enforced" : "Disabled",
      governanceAssignments: [],
    });
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section role="dialog" aria-modal="true" aria-labelledby="create-user-title" className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UserPlus className="size-5" /></span><div className="flex-1"><h2 id="create-user-title" className="text-lg font-bold">Create User</h2><p className="mt-1 text-xs text-muted-foreground">Add a staff identity to Administration</p></div><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted" aria-label="Close create user modal"><X className="size-4" /></button></header><form id="create-user-form" onSubmit={submit} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5"><fieldset><legend className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Identity</legend><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium sm:col-span-2">Full Name *<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" className={inputClass} /></label><label className="text-xs font-medium sm:col-span-2">Email Address *<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@divu.io" className={inputClass} /></label><label className="text-xs font-medium">Department *<input required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Data Engineering" className={inputClass} /></label><label className="text-xs font-medium">Primary Site<select value={site} onChange={(e) => setSite(e.target.value)} className={inputClass}><option value="">None</option>{siteOptions.slice(1).map((option) => <option key={option}>{option}</option>)}</select></label></div></fieldset><fieldset><legend className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Access</legend><label className="text-xs font-medium">RBAC Role<select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>{roleOptions.slice(1).map((option) => <option key={option}>{option}</option>)}</select></label><label className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/30 p-3 text-xs"><input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} className="size-4 accent-[var(--primary)]" />Send an invitation and keep the account Pending until accepted</label></fieldset></form><footer className="flex shrink-0 justify-end gap-2 border-t p-4"><button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-xs font-semibold hover:bg-muted">Cancel</button><button type="submit" form="create-user-form" disabled={!valid} className="h-10 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Create User</button></footer></section></div>;
}
