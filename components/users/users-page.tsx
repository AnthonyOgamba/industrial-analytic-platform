"use client";
/* eslint-disable react-hooks/preserve-manual-memoization */

// FEATURE: User creation and lifecycle
// PAGE: /users lists canonical identities, roles, status, and facility assignments.
// API: /api/backend/users, /api/backend/roles, and user status/update endpoints.
// SECURITY: Create, update, activate, and disable buttons each require their capability.

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Pencil, Plus, UserRound, X } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { createAccessChecks } from "@/lib/access-policy";
import type { BackendRoleDto, BackendUserDto, CreateBackendUserResponse } from "@/lib/backend-dtos";
import { normalizeRole } from "@/lib/auth/constants";
import { CreateUserModal, type CreateUserInput } from "./create-user-modal";
import { UserFilters } from "./user-filters";
import { UserStatsCards } from "./user-stats-cards";
import type { PlatformUser, UserRole, UserStatus } from "./users-data";
import { UsersTable } from "./users-table";
import { useSessionUser } from "@/lib/session-user";
import { useUserDirectory } from "@/lib/user-directory";

// FEATURE: Role labels use the shared canonical formatter; permissions still use backend keys.
const displayRole = normalizeRole;
function initials(value:string){return value.split(/[._\s-]+/).map(part=>part[0]).join("").slice(0,2).toUpperCase()}
function relative(value:string|null){if(!value)return"Never";const ms=Date.now()-new Date(value).getTime();const hours=Math.floor(ms/3600000);return hours<1?"Less than 1h ago":hours<24?`${hours}h ago`:`${Math.floor(hours/24)}d ago`}

function UserDetailModal({user,onClose}:{user:PlatformUser;onClose:()=>void}){
  const fields=[["Email",user.email],["RBAC Role",user.role],["Sites",user.sites.join(", ")||"No facilities assigned"],["Status",user.status],["Last Login",user.lastLogin]];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="w-full max-w-xl overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="size-5"/></span><div className="flex-1"><h2 id="user-detail-title" className="text-lg font-bold">{user.name}</h2><p className="mt-1 text-xs text-muted-foreground">User identity · {user.id}</p></div><button onClick={onClose} aria-label="Close user details" className="grid size-9 place-items-center rounded-lg border"><X className="size-4"/></button></header><dl className="p-5">{fields.map(([label,value])=><div key={label} className="grid gap-1 border-b py-3 sm:grid-cols-[10rem_1fr]"><dt className="font-mono text-xs uppercase text-muted-foreground">{label}</dt><dd className="text-xs font-semibold">{value}</dd></div>)}</dl><footer className="flex justify-end border-t p-4"><button onClick={onClose} className="h-10 rounded-lg border px-4 text-xs font-semibold">Close</button></footer></section></div>
}

function EditUserModal({user,roles,facilities,assignedFacilityIds,pending,error,onClose,onSave}:{user:BackendUserDto;roles:BackendRoleDto[];facilities:Array<{facilityId:number;name:string}>;assignedFacilityIds:number[];pending:boolean;error:string;onClose:()=>void;onSave:(value:{email:string;role:string;facilityIds:number[]})=>void}){
  const[email,setEmail]=useState(user.email);const[role,setRole]=useState(user.role);const[facilityIds,setFacilityIds]=useState<number[]>(assignedFacilityIds);
  const inputClass="mt-1.5 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30";
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event=>event.target===event.currentTarget&&!pending&&onClose()}><section role="dialog" aria-modal="true" aria-labelledby="edit-user-title" className="w-full max-w-lg overflow-hidden rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"><header className="flex items-start gap-3 border-b p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Pencil className="size-5"/></span><div className="flex-1"><h2 id="edit-user-title" className="text-lg font-bold">Edit {user.username}</h2><p className="mt-1 text-xs text-muted-foreground">Update the persisted identity, role, and facility scope.</p></div><button type="button" disabled={pending} onClick={onClose} className="grid size-9 place-items-center rounded-lg border" aria-label="Close edit user"><X className="size-4"/></button></header><form onSubmit={event=>{event.preventDefault();onSave({email:email.trim(),role,facilityIds})}} className="space-y-4 p-5"><label className="block text-xs font-medium">Email Address<input required type="email" value={email} onChange={event=>setEmail(event.target.value)} className={inputClass}/></label><label className="block text-xs font-medium">RBAC Role<select value={role} onChange={event=>setRole(event.target.value)} className={inputClass}>{roles.map(item=><option key={item.role} value={item.role}>{item.displayName||normalizeRole(item.role)}</option>)}</select></label><fieldset><legend className="text-xs font-medium">Facility access</legend><div className="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-lg border p-3">{facilities.map(facility=><label key={facility.facilityId} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={facilityIds.includes(facility.facilityId)} onChange={event=>setFacilityIds(current=>event.target.checked?[...current,facility.facilityId]:current.filter(id=>id!==facility.facilityId))}/>{facility.name}</label>)}{!facilities.length&&<p className="text-xs text-muted-foreground">No facilities are available.</p>}</div></fieldset>{error&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}<footer className="flex justify-end gap-2 border-t pt-4"><button type="button" disabled={pending} onClick={onClose} className="h-10 rounded-lg border px-4 text-xs">Cancel</button><button disabled={pending||!email.trim()||!role} className="h-10 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40">{pending?"Saving…":"Save changes"}</button></footer></form></section></div>
}

export function UsersPage(){
  const directory=useUserDirectory();
  const session=useSessionUser();
  const permissions=new Set(session.user?.capabilities??[]);const canCreate=permissions.has("users.create");const canUpdate=permissions.has("users.update");const canActivate=permissions.has("users.activate");const canDisable=permissions.has("users.disable");
  const hierarchy={data:directory.facilityOptions,refresh:directory.refresh};
  const source=directory.users;const roles=directory.roles;const loading=directory.loading;const[actionError,setError]=useState("");const error=directory.error||actionError;
  const [query,setQuery]=useState("");
  const [site,setSite]=useState("All Sites");
  const [role,setRole]=useState<UserRole|"All Roles">("All Roles");
  const [status,setStatus]=useState<UserStatus|"All">("All");
  const [createOpen,setCreateOpen]=useState(false);
  const [creating,setCreating]=useState(false);
  const [createError,setCreateError]=useState("");
  const [selected,setSelected]=useState<PlatformUser|null>(null);
  const [editing,setEditing]=useState<BackendUserDto|null>(null);
  const [mutationPending,setMutationPending]=useState(false);
  const [mutationError,setMutationError]=useState("");
  const [feedback,setFeedback]=useState("");
  const accessChecks=createAccessChecks(session.user);
  const accessibleFacilities=(hierarchy.data?.facilities??[]).filter(facility=>accessChecks.hasFacilityAccess(facility.facilityId));
  const load=directory.refresh;
  const users=useMemo<PlatformUser[]>(()=>source.map(item=>{const assignments=hierarchy.data?.siteAccess.filter(access=>access.userId===item.uid)??[];const sites=assignments.map(access=>hierarchy.data?.facilities.find(facility=>facility.facilityId===access.facilityId)?.name).filter((name):name is string=>Boolean(name));return{id:String(item.uid),name:item.username,email:item.email,initials:initials(item.username),role:displayRole(item.role),department:"Not provided",sites,lastLogin:relative(item.lastLoginAtUtc),status:item.status==="active"?"Active":"Disabled",mfa:"Unavailable",governanceAssignments:[]}}),[source,hierarchy.data]);
  const filtered=useMemo(()=>{const search=query.trim().toLowerCase();return users.filter(user=>(!search||[user.name,user.email,user.role,...user.sites].join(" ").toLowerCase().includes(search))&&(site==="All Sites"||user.sites.includes(site))&&(role==="All Roles"||user.role===role)&&(status==="All"||user.status===status))},[users,query,site,role,status]);
  // HANDLER: Create User
  // API: POST /api/backend/users; the returned temporary password is shown once, then users reload.
  async function create(input:CreateUserInput){if(!canCreate){setCreateError("You do not have permission to create users.");return}setCreating(true);setCreateError("");try{const result=await apiRequest<CreateBackendUserResponse>("/api/backend/users",{method:"POST",body:JSON.stringify(input)});setCreateOpen(false);setFeedback(`${result.username} was created. Temporary password: ${result.temporaryPassword}`);await load()}catch(cause){setCreateError(cause instanceof Error?cause.message:"User creation failed.")}finally{setCreating(false)}}
  async function saveUser(value:{email:string;role:string;facilityIds:number[]}){if(!editing||!canUpdate)return;setMutationPending(true);setMutationError("");try{await apiRequest(`/api/backend/users/${editing.uid}`,{method:"PATCH",body:JSON.stringify(value)});setEditing(null);setFeedback(`${editing.username} was updated.`);await load();await hierarchy.refresh()}catch(cause){setMutationError(cause instanceof Error?cause.message:"User update failed.")}finally{setMutationPending(false)}}
  async function deleteUser(user:PlatformUser){const enable=user.status==="Disabled";if(!(enable?canActivate:canDisable)||!confirm(`${enable?"Enable":"Disable"} ${user.name}? ${enable?"The user will be able to sign in again.":"The account and audit history remain, but sign-in will be blocked."}`))return;setMutationPending(true);setError("");try{await apiRequest(`/api/backend/users/${user.id}/status`,{method:"PATCH",body:JSON.stringify({status:enable?"active":"inactive"})});setFeedback(`${user.name} was ${enable?"enabled":"disabled"}.`);await load()}catch(cause){setError(cause instanceof Error?cause.message:`User ${enable?"enable":"disable"} failed.`)}finally{setMutationPending(false)}}
  return <div className="space-y-4 pb-5"><header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Administration</p><h1 className="mt-1 text-2xl font-bold tracking-tight">User Management</h1><p className="mt-1 text-sm text-muted-foreground">User identities, RBAC roles and facility assignments</p></div>{canCreate&&<button onClick={()=>setCreateOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"><Plus className="size-4"/>Create User</button>}</header>{feedback&&<div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700"><Check className="size-4"/>{feedback}</div>}{error&&<div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"><AlertTriangle className="size-4"/>{error}</div>}{loading?<div className="h-72 animate-pulse rounded-xl bg-muted"/>:<><UserStatsCards users={users}/><UserFilters query={query} site={site} role={role} status={status} siteOptions={accessibleFacilities.map(item=>item.name)} roleOptions={roles.map(item=>item.displayName||displayRole(item.role))} resultCount={filtered.length} totalCount={users.length} onQueryChange={setQuery} onSiteChange={setSite} onRoleChange={setRole} onStatusChange={setStatus}/><UsersTable users={filtered} onSelect={setSelected} onEdit={canUpdate?(user)=>{setMutationError("");setEditing(source.find(item=>String(item.uid)===user.id)??null)}:undefined} onDelete={(canActivate||canDisable)&&!mutationPending?(user)=>void deleteUser(user):undefined}/></>}{selected&&<UserDetailModal user={selected} onClose={()=>setSelected(null)}/>} {createOpen&&<CreateUserModal onClose={()=>setCreateOpen(false)} onCreate={input=>void create(input)} roles={roles} facilities={accessibleFacilities} pending={creating} error={createError}/>} {editing&&<EditUserModal user={editing} roles={roles} facilities={accessibleFacilities} assignedFacilityIds={(hierarchy.data?.siteAccess??[]).filter(item=>item.userId===editing.uid&&accessChecks.hasFacilityAccess(item.facilityId)).map(item=>item.facilityId)} pending={mutationPending} error={mutationError} onClose={()=>{setEditing(null);setMutationError("")}} onSave={value=>void saveUser(value)}/>}</div>
}
