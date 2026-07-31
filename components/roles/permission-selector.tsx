"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

export type GroupedPermission = {
  permissionId?: string;
  key: string;
  action?: string;
  description?: string;
  riskLevel?: string;
  isAssignable?: boolean;
};

export type PermissionGroup = {
  module: string;
  permissions: GroupedPermission[];
};

export function normalizePermissionGroups(payload: unknown): PermissionGroup[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const record = candidate as Record<string, unknown>;
    if (typeof record.module !== "string" || !Array.isArray(record.permissions)) return [];
    const permissions = record.permissions.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      if (typeof value.key !== "string" || value.key.startsWith("financial.")) return [];
      return [{
        permissionId: typeof value.permissionId === "string" ? value.permissionId : undefined,
        key: value.key,
        action: typeof value.action === "string" ? value.action : undefined,
        description: typeof value.description === "string" ? value.description : undefined,
        riskLevel: typeof value.riskLevel === "string" ? value.riskLevel : undefined,
        isAssignable: value.isAssignable !== false,
      }];
    });
    return record.module.toLowerCase()==="financial"||!permissions.length?[]:[{ module: record.module, permissions }];
  });
}

export function PermissionSelector({ groups, selected, onChange, loading=false, readOnly=false, error="" }: {
  groups: PermissionGroup[];
  selected: string[];
  onChange: (permissions: string[]) => void;
  loading?: boolean;
  readOnly?: boolean;
  error?: string;
}) {
  const [query,setQuery]=useState("");
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(groups.map(group=>group.module)));
  const selectedSet=useMemo(()=>new Set(selected),[selected]);
  const visible=useMemo(()=>groups.map(group=>({...group,permissions:group.permissions.filter(item=>`${item.key} ${item.description??""} ${item.action??""}`.toLowerCase().includes(query.toLowerCase()))})).filter(group=>group.permissions.length),[groups,query]);
  function replace(modulePermissions:string[],checked:boolean){const next=new Set(selected);modulePermissions.forEach(key=>{if(checked)next.add(key);else next.delete(key)});onChange([...next])}
  if(loading)return <div role="status" className="h-40 animate-pulse rounded-xl bg-muted" aria-label="Loading permissions"/>;
  return <div className="space-y-3">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><span className="sr-only">Search permissions</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search permissions…" className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-xs"/></label><span className="text-xs text-muted-foreground">{selected.length} selected</span></div>
    {error&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
    <div className="max-h-[26rem] space-y-2 overflow-y-auto">{visible.map(group=>{const open=expanded.has(group.module);const assignable=group.permissions.filter(item=>item.isAssignable||selectedSet.has(item.key));return <section key={group.module} className="rounded-lg border"><header className="flex items-center gap-2 p-3"><button type="button" onClick={()=>setExpanded(current=>{const next=new Set(current);if(open)next.delete(group.module);else next.add(group.module);return next})} className="grid size-7 place-items-center rounded-md" aria-expanded={open}>{open?<ChevronDown className="size-4"/>:<ChevronRight className="size-4"/>}</button><strong className="flex-1 text-xs capitalize">{group.module}</strong><span className="text-xs text-muted-foreground">{group.permissions.filter(item=>selectedSet.has(item.key)).length}/{group.permissions.length}</span>{!readOnly&&<><button type="button" onClick={()=>replace(assignable.map(item=>item.key),true)} className="rounded border px-2 py-1 text-xs">Select all</button><button type="button" onClick={()=>replace(group.permissions.map(item=>item.key),false)} className="rounded border px-2 py-1 text-xs">Clear</button></>}</header>{open&&<div className="grid gap-2 border-t p-3 sm:grid-cols-2">{group.permissions.map(item=><label key={item.key} className={`flex items-start gap-2 rounded-lg border p-2 text-xs ${item.isAssignable===false&&!selectedSet.has(item.key)?"opacity-50":""}`}><input type="checkbox" disabled={readOnly||(item.isAssignable===false&&!selectedSet.has(item.key))} checked={selectedSet.has(item.key)} onChange={event=>replace([item.key],event.target.checked)}/><span><span className="font-mono">{item.key}</span>{item.description&&<span className="mt-1 block text-muted-foreground">{item.description}</span>}{item.riskLevel&&<span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 uppercase">{item.riskLevel} risk</span>}</span></label>)}</div>}</section>})}{!visible.length&&<p className="rounded-lg border p-8 text-center text-xs text-muted-foreground">No permissions match this search.</p>}</div>
  </div>;
}
