import { Building2 } from "lucide-react";

import { initialUsers } from "../users/users-data";
import { roleColor, type Role } from "./roles-data";

const roleIds: Record<string, string> = { Administrator: "administrator", "Plant Manager": "plant-manager", Viewer: "viewer", "Quality Inspector": "quality-inspector", "Finance Analyst": "finance-analyst", "Audit Viewer": "audit-viewer" };

export function RoleAssignmentCard({ role }: { role: Role }) {
  const users = initialUsers.filter((user) => roleIds[user.role] === role.id);
  const sites = [...new Set(users.flatMap((user) => user.sites))];
  const departments = [...new Set(users.map((user) => user.department))];
  return <section className="overflow-hidden rounded-xl border bg-card shadow-[var(--dv-shadow)]"><header className={`flex items-center justify-between gap-3 border-b p-4 ${roleColor[role.color].split(" ")[0]}`}><div><h3 className="text-sm font-bold">{role.name}</h3><p className="mt-1 text-[10px] text-muted-foreground">{role.description}</p></div><span className="text-right"><b className="block text-lg">{users.length}</b><small className="text-[9px]">users assigned</small></span></header><div className="border-b px-4 py-2 text-[10px]"><span className="mr-3 font-mono font-semibold uppercase text-muted-foreground">Sites</span>{sites.map((site) => <span key={site} className="mr-1 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1"><Building2 className="size-2.5" />{site}</span>)}<span className="ml-4 mr-2 font-mono font-semibold uppercase text-muted-foreground">Departments</span>{departments.map((department) => <span key={department} className="mr-1 rounded-md bg-muted px-2 py-1">{department}</span>)}</div><div>{users.map((user) => <div key={user.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"><span className="grid size-8 place-items-center rounded-full bg-muted text-[10px] font-bold">{user.initials}</span><span className="min-w-0 flex-1"><b className="block text-xs">{user.name}</b><small className="text-[10px] text-muted-foreground">{user.email}</small></span><span className="hidden text-[10px] sm:block">{user.department}</span>{user.governanceAssignments.length > 0 && <span className="rounded-md bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary">{user.governanceAssignments.length} governance</span>}<span className={`rounded-full px-2 py-1 text-[9px] ${user.status === "Active" ? "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" : "bg-muted text-muted-foreground"}`}>{user.status}</span></div>)}{!users.length && <p className="p-6 text-center text-xs text-muted-foreground">No users assigned.</p>}</div></section>;
}

export function RoleAssignmentsPanel({ roles }: { roles: Role[] }) {
  return <div className="space-y-3"><label className="text-xs">Filter by role: <select className="ml-2 h-9 rounded-lg border bg-background px-3"><option>All Roles</option>{roles.map((role) => <option key={role.id}>{role.name}</option>)}</select></label>{roles.map((role) => <RoleAssignmentCard key={role.id} role={role} />)}</div>;
}
