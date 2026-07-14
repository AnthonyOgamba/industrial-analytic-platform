"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { IndustrialDataSource } from "./data-input-data";
import { DataSourceCard } from "./data-source-card";

export function DataSourcesPanel({ sources, onView, onEdit, onTest, onDelete }: { sources: IndustrialDataSource[]; onView: (source: IndustrialDataSource) => void; onEdit: (source: IndustrialDataSource) => void; onTest: (source: IndustrialDataSource) => void; onDelete: (source: IndustrialDataSource) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const filtered = useMemo(() => sources.filter((source) => (!query.trim() || `${source.name} ${source.type} ${source.facility} ${source.dataset}`.toLowerCase().includes(query.toLowerCase())) && (status === "All" || source.status === status)), [query, sources, status]);
  return <section className="space-y-4"><div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search data sources, facilities, or datasets..." className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm"><option>All</option><option>Connected</option><option>Error</option><option>Offline</option></select></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((source) => <DataSourceCard key={source.id} source={source} onView={() => onView(source)} onEdit={() => onEdit(source)} onTest={() => onTest(source)} onDelete={() => onDelete(source)} />)}{!filtered.length && <div className="col-span-full rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">No data sources match the selected filters.</div>}</div></section>;
}
