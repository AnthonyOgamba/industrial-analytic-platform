"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { permissionCount, permissionTypes, resources, roles, roleColor, type Permission, type ResourceKey } from "./roles-data";

export function PermissionBadge({ active, inherited }: { active: boolean; inherited?: boolean }) {
  return active ? <span className="inline-flex flex-col items-center text-[var(--dv-badge-ok-text)]"><Check className="size-3.5" />{inherited && <small className="text-[8px] text-primary">inherit</small>}</span> : <span className="text-muted-foreground/40">—</span>;
}

function PermissionMatrixRow({ resource, expanded, onToggle }: { resource: (typeof resources)[number]; expanded: boolean; onToggle: () => void }) {
  const Icon = resource.icon;
  return <><tr className="border-y bg-muted/45"><td className="p-0"><button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={`permissions-${resource.key}`} className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold hover:bg-muted/60"><ChevronDown className={`size-3.5 shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`} /><Icon className="size-3.5 shrink-0 text-primary" /><span>{resource.label}</span><small className="hidden font-normal text-muted-foreground sm:inline">— {resource.description}</small></button></td><td className="px-2 py-3 text-center text-[10px] font-medium text-[var(--dv-badge-ok-text)]">Full</td>{roles.slice(1).map((role) => <td key={role.id} className="px-2 py-3 text-center text-[10px] text-[var(--dv-badge-wa-text)]">{role.permissions[resource.key].length ? "Partial" : "—"}</td>)}</tr>{expanded && permissionTypes.map((permission, index) => <tr id={index === 0 ? `permissions-${resource.key}` : undefined} key={permission} className="border-b border-border/55"><td className="px-11 py-2 text-[11px] text-muted-foreground">{permission}</td>{roles.map((role, roleIndex) => <td key={role.id} className="px-2 py-2 text-center"><PermissionBadge active={role.permissions[resource.key].includes(permission as Permission)} inherited={roleIndex === 1 && permission === "View"} /></td>)}</tr>)}</>;
}

export function PermissionMatrix() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<ResourceKey>>(new Set());
  const visible = useMemo(() => resources.filter((resource) => `${resource.label} ${resource.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const toggle = (key: ResourceKey) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return <section className="overflow-hidden rounded-xl border bg-card shadow-[var(--dv-shadow)]"><div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center"><label className="relative max-w-xs flex-1"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Filter permission resources</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter resources..." className="h-9 w-full rounded-lg border bg-background pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-ring/30" /></label><div className="flex gap-2"><button type="button" onClick={() => setExpanded(new Set(visible.map((resource) => resource.key)))} className="h-9 rounded-lg border px-3 text-[10px] font-semibold hover:bg-muted">Expand all</button><button type="button" onClick={() => setExpanded(new Set())} className="h-9 rounded-lg border px-3 text-[10px] font-semibold hover:bg-muted">Collapse all</button></div><p className="text-[10px] text-muted-foreground sm:ml-auto">Select a resource row to show permissions</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px]"><thead><tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><th className="px-4 py-4 text-left">Resource / permission</th>{roles.map((role) => <th key={role.id} className="min-w-28 px-2 py-3 text-center"><span className={`mx-auto mb-1 grid size-6 place-items-center rounded-full border ${roleColor[role.color]}`}>●</span><span className="block text-[10px] font-semibold normal-case text-foreground">{role.name.replace(" Manager", "")}</span></th>)}</tr></thead><tbody>{visible.map((resource) => <PermissionMatrixRow key={resource.key} resource={resource} expanded={expanded.has(resource.key)} onToggle={() => toggle(resource.key)} />)}</tbody><tfoot><tr className="bg-muted/40"><td className="px-4 py-3 text-xs font-semibold">Coverage</td>{roles.map((role) => { const count = permissionCount(role); const pct = Math.round(count / 48 * 100); return <td key={role.id} className="px-3 py-3"><div className="text-center text-[10px] font-semibold">{pct}%</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div><div className="mt-1 text-center text-[9px] text-muted-foreground">{count}/48</div></td>; })}</tr></tfoot></table>{visible.length === 0 && <p className="p-8 text-center text-xs text-muted-foreground">No resources match this filter.</p>}</div></section>;
}
