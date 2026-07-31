import { Eye, Mail, Pencil, Power, PowerOff, Users } from "lucide-react";

import type { PlatformUser } from "./users-data";
import { MfaStatusBadge } from "./mfa-status-badge";
import { UserStatusBadge } from "./user-status-badge";

const avatarColors=["bg-violet-600","bg-blue-600","bg-emerald-600","bg-amber-600","bg-rose-600","bg-cyan-600"];
const roleColor="bg-primary/10 text-primary";
function siteLabel(sites:string[]){return sites.length?sites.join(", "):"No facilities assigned"}

export function UsersTable({
  users,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange=onDelete,
}: {
  users: PlatformUser[];
  onSelect: (user: PlatformUser) => void;
  onEdit?: (user:PlatformUser)=>void;
  onDelete?: (user:PlatformUser)=>void;
  onStatusChange?: (user:PlatformUser)=>void;
}) {
  return <div className="overflow-hidden rounded-xl border bg-card shadow-[var(--dv-shadow)]"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b bg-muted/50"><tr className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{["User","Role","Sites","Last Login","Status","MFA","Actions"].map(heading=><th key={heading} className="px-4 py-3 first:pl-5">{heading}</th>)}</tr></thead><tbody className="divide-y">{users.length===0?<tr><td colSpan={7} className="px-5 py-16 text-center"><Users className="mx-auto mb-3 size-9 text-muted-foreground/40"/><p className="text-sm text-muted-foreground">No users match your filters.</p></td></tr>:users.map((user,index)=><tr key={user.id} className="transition-colors hover:bg-muted/40"><td className="px-5 py-3"><div className="flex items-center gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${avatarColors[index%avatarColors.length]}`}>{user.initials}</span><span><span className="block text-xs font-semibold">{user.name}</span><span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-2.5"/>{user.email}</span></span></div></td><td className="px-4 py-3"><span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${roleColor}`}>{user.role}</span></td><td className="px-4 py-3 text-xs text-muted-foreground">{siteLabel(user.sites)}</td><td className="px-4 py-3 text-xs text-muted-foreground">{user.lastLogin}</td><td className="px-4 py-3"><UserStatusBadge status={user.status}/></td><td className="px-4 py-3"><MfaStatusBadge status={user.mfa}/></td><td className="px-4 py-3"><div className="flex gap-1.5"><button type="button" onClick={()=>onSelect(user)} className="grid size-8 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-primary" aria-label={`View ${user.name}`}><Eye className="size-3.5"/></button>{onEdit&&<button type="button" onClick={()=>onEdit(user)} className="grid size-8 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-primary" aria-label={`Edit ${user.name}`}><Pencil className="size-3.5"/></button>}{onStatusChange&&<button type="button" onClick={()=>onStatusChange(user)} className={`grid size-8 place-items-center rounded-lg border ${user.status==="Disabled"?"text-emerald-600":"border-destructive/30 text-destructive"}`} aria-label={`${user.status==="Disabled"?"Enable":"Disable"} ${user.name}`} title={`${user.status==="Disabled"?"Enable":"Disable"} user`}>{user.status==="Disabled"?<Power className="size-3.5"/>:<PowerOff className="size-3.5"/>}</button>}</div></td></tr>)}</tbody></table></div></div>;
}
