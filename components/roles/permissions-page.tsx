"use client";

/**
 * PAGE: Permissions
 * FEATURE: Displays the canonical permission catalog and role grants returned by the service.
 * PERMISSION: Viewing and editing remain separate effective capabilities.
 * ERROR: Unexpected response shapes are normalized safely and never become invented grants.
 */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback,useEffect,useMemo,useState } from "react";
import { AlertTriangle,Check } from "lucide-react";
import type { BackendRoleDto } from "@/lib/backend-dtos";
import { pageRequest } from "@/lib/page-request";
import type { UsersRolesPageContract } from "@/lib/page-contracts";
import { toBackendRole } from "@/lib/page-contracts";
import { useSessionUser } from "@/lib/session-user";

type PermissionDto={capability:string;description:string;resource:string};

export function PermissionsPage(){
  const session=useSessionUser();
  const canView=session.user?.capabilities.includes("roles.view")??false;
  const[roles,setRoles]=useState<BackendRoleDto[]>([]);
  const[permissions,setPermissions]=useState<PermissionDto[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState("");
  const load=useCallback(async()=>{setLoading(true);try{const response=await pageRequest<UsersRolesPageContract>("roles");setPermissions(response.permissions.map(item=>({capability:item.capability,description:item.description,resource:item.module})));setRoles(response.roles.map(toBackendRole));setError("")}catch(cause){setError(cause instanceof Error?cause.message:"Permissions could not be loaded.")}finally{setLoading(false)}},[]);
  useEffect(()=>{if(canView)void load()},[canView,load]);
  const rows=useMemo(()=>permissions.filter(item=>!item.capability.startsWith("financial.")).sort((a,b)=>a.capability.localeCompare(b.capability)),[permissions]);
  if(session.loading||loading)return <div className="h-56 animate-pulse rounded-xl bg-muted"/>;
  if(!canView)return <p role="alert" className="rounded-xl border p-5 text-sm text-muted-foreground">You do not have permission to view permissions.</p>;
  return <div className="space-y-4"><header><h2 className="text-lg font-bold">Permissions</h2><p className="text-xs text-muted-foreground">Canonical permission catalog and role grants.</p></header>{error&&<p role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive"><AlertTriangle className="size-4"/>{error}</p>}<div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[60rem] text-xs"><caption className="sr-only">Canonical permissions by role</caption><thead><tr className="border-b"><th className="p-3 text-left">Permission</th>{roles.map(role=><th key={role.role} className="p-3 text-center">{role.displayName||role.role}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.capability} className="border-b"><th scope="row" className="p-3 text-left"><span className="font-mono text-xs">{row.capability}</span>{row.description&&<p className="mt-1 font-sans text-xs font-normal text-muted-foreground">{row.description}</p>}</th>{roles.map(role=><td key={role.role} className="p-3 text-center">{role.capabilities.includes(row.capability)?<Check aria-label="Granted" className="mx-auto size-4 text-emerald-600"/>:<span aria-label="Not granted">—</span>}</td>)}</tr>)}{!rows.length&&!error&&<tr><td colSpan={roles.length+1} className="p-10 text-center text-muted-foreground">No permissions are available.</td></tr>}</tbody></table></div></div>;
}
