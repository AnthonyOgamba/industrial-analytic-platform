"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Plus, ShieldCheck, Trash2, UserRound, X } from "lucide-react";

import { CreateUserModal } from "./create-user-modal";
import { UserFilters } from "./user-filters";
import { UserSecurityWarning } from "./user-security-warning";
import { UserStatsCards } from "./user-stats-cards";
import type { PlatformUser, UserRole, UserStatus } from "./users-data";
import { UsersTable } from "./users-table";
import { usePlatformWorkflowStore } from "@/lib/platform-workflow-store";
import { apiRequest } from "@/lib/api-client";
import type { CreatedUserDto, UserDto } from "@/lib/backend-dtos";

const roleLabels: Record<string, UserRole> = {
  super_admin: "Administrator", admin: "Administrator", manager: "Plant Manager",
  operations_manager: "Plant Manager", plant_manager: "Plant Manager", viewer: "Viewer",
  finance_viewer: "Finance Analyst", report_viewer: "Audit Viewer", security_analyst: "Audit Viewer",
  line_supervisor: "Plant Manager", maintenance_technician: "Viewer",
};
const backendRoles: Record<UserRole, string> = {
  Administrator: "admin",
  "Plant Manager": "plant_manager",
  Viewer: "viewer",
  "Quality Inspector": "line_supervisor",
  "Finance Analyst": "finance_viewer",
  "Audit Viewer": "report_viewer",
};

function mapUser(user: UserDto): PlatformUser {
  const normalizedStatus = user.status.toLowerCase();
  return {
    id: String(user.uid), name: user.username, email: user.email,
    initials: user.username.split(/[._\s-]+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    role: roleLabels[user.role.toLowerCase()] ?? "Viewer", department: "Backend identity", sites: [],
    lastLogin: user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : "Never",
    status: normalizedStatus === "active" ? "Active" : normalizedStatus === "locked" ? "Locked" : normalizedStatus === "pending" ? "Pending" : "Disabled",
    mfa: "Disabled", governanceAssignments: [],
  };
}

function UserDetailModal({ user, onClose }: { user: PlatformUser; onClose: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const requestUserDeletion = usePlatformWorkflowStore((state) => state.requestUserDeletion);
  const fields = [["Email", user.email], ["RBAC Role", user.role], ["Department", user.department], ["Sites", user.sites.join(", ") || "No sites assigned"], ["Status", user.status], ["MFA", user.mfa], ["Last Login", user.lastLogin]];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-5" /></span><div className="flex-1"><h2 id="user-detail-title" className="text-lg font-bold">{user.name}</h2><p className="mt-1 text-xs text-muted-foreground">Administrative identity · {user.id}</p></div><button type="button" onClick={onClose} aria-label="Close user details" className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-muted"><X className="size-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">Account & Access</h3><dl className="mt-2">{fields.map(([label, value]) => <div key={label} className="grid gap-1 border-b py-3 sm:grid-cols-[10rem_1fr]"><dt className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="text-xs font-semibold">{value}</dd></div>)}</dl><h3 className="mt-6 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">Governance Assignments</h3>{user.governanceAssignments.length ? <div className="mt-3 space-y-2">{user.governanceAssignments.map((item) => <div key={`${item.responsibility}-${item.resource}`} className="flex items-center gap-3 rounded-lg border bg-card p-3"><ShieldCheck className="size-4 text-primary" /><div><p className="text-xs font-semibold">{item.responsibility}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{item.resource}</p></div></div>)}</div> : <p className="mt-3 rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground">No governance responsibilities assigned.</p>}{confirmDelete && <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4"><div className="flex gap-3"><AlertTriangle className="size-5 shrink-0 text-destructive" /><div><p className="text-xs font-bold">Submit deletion for Super Admin approval?</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">The account will not be removed immediately. Activity will receive an approval request, and both the Super Admin and {user.name} will receive linked notifications.</p></div></div><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setConfirmDelete(false)} className="h-9 rounded-lg border px-3 text-xs font-semibold">Cancel</button><button type="button" onClick={() => { requestUserDeletion(user); onClose(); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-destructive px-3 text-xs font-semibold text-destructive-foreground"><Trash2 className="size-3.5" />Submit Request</button></div></div>}</div><footer className="flex justify-between gap-2 border-t p-4">{user.name !== "Admin User" ? <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/30 px-4 text-xs font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="size-4" />Request Deletion</button> : <span className="text-[10px] text-muted-foreground">Super Admin account is protected.</span>}<button type="button" onClick={onClose} className="h-10 rounded-lg border px-4 text-xs font-semibold hover:bg-muted">Close</button></footer></section></div>;
}

export function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [query, setQuery] = useState("");
  const [site, setSite] = useState("All Sites");
  const [role, setRole] = useState<UserRole | "All Roles">("All Roles");
  const [status, setStatus] = useState<UserStatus | "All">("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<PlatformUser | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers((await apiRequest<UserDto[]>("/api/backend/users")).map(mapUser)); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Users could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void load();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}, [load]);
  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => (!search || [user.name, user.email, user.role, user.department, ...user.sites, ...user.governanceAssignments.flatMap((item) => [item.responsibility, item.resource])].join(" ").toLowerCase().includes(search)) && (site === "All Sites" || user.sites.includes(site)) && (role === "All Roles" || user.role === role) && (status === "All" || user.status === status));
  }, [query, role, site, status, users]);
  const usersWithoutMfa = users.filter((user) => user.status === "Active" && user.mfa === "Disabled").length;

  return <div className="space-y-4 pb-5"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Administration</p><h1 className="mt-1 text-2xl font-bold tracking-tight">User Management</h1><p className="mt-1 text-sm text-muted-foreground">Manage staff identities, RBAC access, sites, and governance responsibilities</p></div><button type="button" onClick={() => setCreateOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"><Plus className="size-4" />Create User</button></header>{error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}<button type="button" onClick={() => void load()} className="ml-3 underline">Retry</button></div>}{feedback && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300"><Check className="size-4" />{feedback}</div>}<UserSecurityWarning usersWithoutMfa={usersWithoutMfa} /><UserStatsCards users={users} /><UserFilters query={query} site={site} role={role} status={status} resultCount={filteredUsers.length} totalCount={users.length} onQueryChange={setQuery} onSiteChange={setSite} onRoleChange={setRole} onStatusChange={setStatus} /><UsersTable users={filteredUsers} onSelect={setSelected} />{loading && !users.length && <p role="status" className="p-4 text-center text-xs text-muted-foreground">Loading users…</p>}{selected && <UserDetailModal user={selected} onClose={() => setSelected(null)} />}{createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} onCreate={(user) => { void (async () => { try { const created = await apiRequest<CreatedUserDto>("/api/backend/users", { method: "POST", body: JSON.stringify({ username: user.email.split("@")[0], email: user.email, role: backendRoles[user.role], facilityIds: [] }) }); setCreateOpen(false); setFeedback(`${created.username} was created. Temporary password: ${created.temporaryPassword}`); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "User could not be created."); } })(); }} />}</div>;
}
