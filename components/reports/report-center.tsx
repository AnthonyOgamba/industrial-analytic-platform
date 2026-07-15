"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataInputModalShell } from "@/components/data-input/data-input-modal-shell";
import { mockTemplates, mockRecent, mockScheduled, sites, owners, categories, statuses, formats } from "./report-data";
import type { ReportFormat, ReportSource, ReportTemplate, RecentReport, ScheduledReportRow } from "./report-types";
import { Check, Download, Clock, Eye, Plus, X, FileText, ChevronDown, Search, Printer, RotateCcw } from "lucide-react";

const sourceRoutes: Record<ReportSource, string> = {
  Assets: "/assets", Operations: "/operations", Downtime: "/downtime",
  "Financial Analytics": "/financial", "Security Operations": "/security-ops",
  "API Security": "/api-security", "Audit Log": "/audit", Governance: "/governance",
};

export function ReportCenter() {
  const router = useRouter();
  const [tab, setTab] = useState<"available" | "scheduled" | "recent">("available");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [site, setSite] = useState<string>("All Sites");
  const [status, setStatus] = useState<string>("All");
  const [owner, setOwner] = useState<string>("All Owners");
  const [format, setFormat] = useState<string>("All");

  const templates = mockTemplates;
  const [recent, setRecent] = useState<RecentReport[]>(mockRecent);
  const [scheduled, setScheduled] = useState<ScheduledReportRow[]>(mockScheduled);

  const [preview, setPreview] = useState<ReportTemplate | null>(null);
  const [historyFor, setHistoryFor] = useState<ReportTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [generating, setGenerating] = useState<{
    template: ReportTemplate | null;
    step: number;
    done: boolean;
  } | null>(null);

  // Mock permission
  const canGenerate = true; // TODO: replace with real permission check

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (site !== "All Sites" && t.site !== site) return false;
      if (status !== "All" && t.status !== status) return false;
      if (owner !== "All Owners" && t.owner !== owner) return false;
      if (format !== "All") {
        if (format === "PDF" || format === "Excel" || format === "CSV") {
          if (!t.formats.includes(format as ReportFormat)) return false;
        }
      }
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [templates, category, site, status, owner, format, query]);

  const counts = useMemo(() => ({ available: templates.length, scheduled: scheduled.length, recent: recent.length }), [scheduled.length, templates.length, recent.length]);
  const scheduleSummary = useMemo(() => ({
    daily: scheduled.filter((item) => item.frequency === "Daily").length,
    weekly: scheduled.filter((item) => item.frequency === "Weekly").length,
    monthly: scheduled.filter((item) => item.frequency === "Monthly").length,
    paused: scheduled.filter((item) => !item.active).length,
  }), [scheduled]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (generating && !generating.done) {
      timer = setInterval(() => {
        setGenerating((g) => {
          if (!g || !g.template) return null;
          const next = g.step + 1;
          if (next >= 5) {
            // complete
            // add to recent
            const newRecent: RecentReport = {
              id: `r-${Date.now()}`,
              name: g.template.name,
              date: "Just now",
              generatedBy: "Admin User",
              format: g.template.formats[0],
              size: "1.2 MB",
              pages: 5,
            };
            setRecent((current) => current.some((item) => item.id === newRecent.id) ? current : [newRecent, ...current].slice(0, 20));
            return { ...g, step: 5, done: true };
          }
          return { ...g, step: next };
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [generating]);

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setSite("All Sites");
    setStatus("All");
    setOwner("All Owners");
    setFormat("All");
  }

  function startGenerate(template: ReportTemplate) {
    setGenerating({ template, step: 0, done: false });
  }

  function downloadMock(filename: string) {
    const blob = new Blob(["Mock file content for " + filename], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <section className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Report Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse, generate, schedule, and export enterprise reports across all DIVU modules</p>
        </div>
        {canGenerate && (
          <div>
            <button onClick={() => setCreateOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              <Plus className="size-4" /> Generate Report
            </button>
          </div>
        )}
      </header>

      <nav aria-label="Report views" className="overflow-x-auto border-b">
        <div className="flex min-w-max" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "available"} className={`relative inline-flex h-12 items-center px-4 text-xs font-medium ${tab === "available" ? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTab("available")}>
          Available Reports <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{counts.available}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "scheduled"} className={`relative inline-flex h-12 items-center px-4 text-xs font-medium ${tab === "scheduled" ? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTab("scheduled")}>
          Scheduled Reports <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{counts.scheduled}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "recent"} className={`relative inline-flex h-12 items-center px-4 text-xs font-medium ${tab === "recent" ? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setTab("recent")}>
          Recent Reports <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{counts.recent}</span>
        </button>
        </div>
      </nav>

      {tab === "available" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports by name, owner, category, or keyword..." className="h-10 w-full rounded-lg border bg-background pl-9 pr-10 text-sm outline-none focus:border-primary" />
                  {query && <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="size-4" /></button>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-2 text-xs sm:flex-none">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select aria-label="Filter by site" value={site} onChange={(e) => setSite(e.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-2 text-xs sm:flex-none">
                    {sites.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-2 text-xs sm:flex-none">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select aria-label="Filter by owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-2 text-xs sm:flex-none">
                    {owners.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <select aria-label="Filter by format" value={format} onChange={(e) => setFormat(e.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border bg-background px-2 text-xs sm:flex-none">
                    {formats.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {(query || category !== "All" || site !== "All Sites" || status !== "All" || owner !== "All Owners" || format !== "All") && (
                    <button type="button" onClick={clearFilters} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs text-muted-foreground hover:bg-muted"><RotateCcw className="size-3.5" />Clear filters</button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 md:mt-0">
                <div className="text-sm text-muted-foreground">{filtered.length} reports</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Group by category */}
            {Array.from(new Set(filtered.map((t) => t.category))).map((cat) => {
              const items = filtered.filter((t) => t.category === cat);
              return (
                <section key={cat}>
                  <h3 className="mb-3 text-sm font-semibold">{cat} Reports</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((t) => (
                      <article key={t.id} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></div>
                              <div className="min-w-0">
                                <h4 className="font-semibold">{t.name}</h4>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="rounded-md bg-[var(--dv-badge-ok-bg)] px-2 py-1 font-mono text-[9px] font-semibold text-[var(--dv-badge-ok-text)]">{t.status}</div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                          <div className="space-y-1 text-muted-foreground">
                            <div>Owner: <strong className="text-foreground">{t.owner}</strong></div>
                            <div>Site: <strong className="text-foreground">{t.site}</strong></div>
                            <div>Last: <strong className="text-foreground">{t.last}</strong></div>
                          </div>
                          <div className="space-y-1 text-muted-foreground">
                            <div>Schedule: <strong className="text-foreground">{t.schedule}</strong></div>
                            <div>Records: <strong className="text-foreground">{t.records.toLocaleString()}</strong></div>
                            <div>Source: <Link className="text-primary hover:underline" href={sourceRoutes[t.source] ?? "/"}>{t.source}</Link></div>
                          </div>
                        </div>

                        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-1.5 border-t pt-3">
                          <button onClick={() => setPreview(t)} className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium hover:bg-muted"><Eye className="size-3.5 shrink-0" />Preview</button>
                          <button onClick={() => startGenerate(t)} className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-3.5 shrink-0" />Generate</button>
                          <div className="relative ml-auto shrink-0">
                            <ExportDropdown formats={t.formats} fileBase={t.id} onDownload={downloadMock} />
                          </div>
                          <button aria-label={`View ${t.name} history`} title="History" onClick={() => setHistoryFor(t)} className="grid size-8 shrink-0 place-items-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"><Clock className="size-3.5" /></button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {filtered.length === 0 && <div className="rounded-xl border border-dashed bg-muted/30 px-5 py-12 text-center"><FileText className="mx-auto size-8 text-muted-foreground"/><h3 className="mt-3 text-sm font-semibold">No reports found</h3><p className="mt-1 text-xs text-muted-foreground">Adjust your search or clear the active filters.</p><button type="button" onClick={clearFilters} className="mt-4 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted">Clear filters</button></div>}
          </div>
        </div>
      )}

      {tab === "scheduled" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="grid gap-4">
              {scheduled.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></div>
                    <div className="min-w-0">
                      <div className="font-semibold">{s.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.frequency} · {s.time} · Recipients: {s.recipients}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Next: {s.next} · Source: <Link href={sourceRoutes[s.source]} className="text-primary hover:underline">{s.source}</Link></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className={`rounded-md px-2 py-1 font-mono text-[9px] font-semibold ${s.active ? "bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]" : "bg-[var(--dv-badge-wa-bg)] text-[var(--dv-badge-wa-text)]"}`}>{s.active ? "Active" : "Paused"}</div>
                    <button type="button" onClick={() => setScheduled((items) => items.map((it) => it.id === s.id ? { ...it, active: !it.active } : it))} className={`h-8 rounded-lg border px-2.5 text-xs font-medium ${s.active ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600"}`}>{s.active ? "Pause" : "Resume"}</button>
                    <button type="button" onClick={() => setPreview(mockTemplates.find((t) => t.name === s.name) ?? mockTemplates.find((t) => t.category === s.category) ?? null)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium hover:bg-muted"><Eye className="size-3.5" />Preview</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="text-sm text-muted-foreground">Daily Reports</div>
              <div className="text-2xl font-bold">{scheduleSummary.daily}</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-sm text-muted-foreground">Weekly Reports</div>
              <div className="text-2xl font-bold">{scheduleSummary.weekly}</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-sm text-muted-foreground">Monthly Reports</div>
              <div className="text-2xl font-bold">{scheduleSummary.monthly}</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-sm text-muted-foreground">Paused Reports</div>
              <div className="text-2xl font-bold">{scheduleSummary.paused}</div>
            </div>
          </div>
        </div>
      )}

      {tab === "recent" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="grid gap-3">
              {recent.map((r) => {
                const template = mockTemplates.find((item) => item.name === r.name) ?? mockTemplates[0];
                return <div key={r.id} className="flex flex-col gap-3 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></div>
                    <div className="min-w-0"><div className="truncate font-semibold">{r.name}</div><div className="mt-1 text-xs text-muted-foreground">{r.date} · Generated by {r.generatedBy}</div></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="rounded-md bg-muted px-2 py-1 font-mono text-[9px] font-semibold">{r.format}</div>
                    <div className="text-xs text-muted-foreground">{r.size} · {r.pages} pages</div>
                    <button type="button" onClick={() => setPreview(template)} className="h-8 rounded-lg border px-2.5 text-xs font-medium hover:bg-muted">View</button>
                    <button type="button" onClick={() => downloadMock(`${r.name.toLowerCase().replace(/\s+/g, "-")}.${r.format === "Excel" ? "xlsx" : r.format === "CSV" ? "csv" : "pdf"}`)} className="h-8 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Re-export</button>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>
      )}

      {preview && (
        <DataInputModalShell title={preview.name} subtitle={`${preview.owner} · ${preview.site} · ${preview.records.toLocaleString()} records`} onClose={() => setPreview(null)} width="max-w-5xl">
          <PreviewContent template={preview} onDownload={downloadMock} onViewSource={(src) => { setPreview(null); router.push(sourceRoutes[src] ?? "/"); }} />
        </DataInputModalShell>
      )}

      {historyFor && (
        <DataInputModalShell title={`${historyFor.name} — History`} subtitle={`Previous generations for ${historyFor.name}`} onClose={() => setHistoryFor(null)} width="max-w-2xl">
          <HistoryList template={historyFor} onGenerateNew={() => { setHistoryFor(null); startGenerate(historyFor); }} onDownload={downloadMock} />
        </DataInputModalShell>
      )}

      {createOpen && (
        <DataInputModalShell title="Create Report" subtitle="Define a new report generation" onClose={() => setCreateOpen(false)} width="max-w-2xl">
          <CreateReportForm templates={templates} onCancel={() => setCreateOpen(false)} onGenerate={(vals) => { setCreateOpen(false); /* find template */ const t = templates.find((tp) => tp.id === vals.type); startGenerate(t ?? templates[0]); }} />
        </DataInputModalShell>
      )}

      {generating && (
        <DataInputModalShell title={`Generating Report`} subtitle={generating.template?.name ?? ""} onClose={() => setGenerating(null)}>
          <GenerationProgress step={generating.step} done={!!generating.done} onView={() => { setPreview(generating.template); setGenerating(null); }} />
        </DataInputModalShell>
      )}
    </section>
  );
}

function ExportDropdown({ formats, fileBase, onDownload }: { formats: string[]; fileBase: string; onDownload: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div className="relative" ref={menuRef}>
      <button type="button" aria-label="Export report" aria-haspopup="menu" aria-expanded={open} title="Export" onClick={() => setOpen((v) => !v)} className="inline-flex h-8 w-11 items-center justify-center gap-1.5 rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground"><Download className="size-3.5" /><ChevronDown className="size-3" /></button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-44 rounded-lg border bg-card p-1.5 shadow-2xl">
          {formats.map((f) => (
            <button type="button" role="menuitem" key={f} onClick={() => { onDownload(`${fileBase}.${f === "Excel" ? "xlsx" : f === "CSV" ? "csv" : "pdf"}`); setOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-muted"><Download className="size-3.5" />Export {f}</button>
          ))}
          <button type="button" role="menuitem" onClick={() => { window.print(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-muted"><Printer className="size-3.5" />Print</button>
        </div>
      )}
    </div>
  );
}

function PreviewContent({ template, onViewSource, onDownload }: { template: ReportTemplate; onViewSource: (src: ReportSource) => void; onDownload: (name: string) => void }) {
  const completed = Math.floor(template.records * 0.7);
  const pending = Math.ceil(template.records * 0.1);
  const attention = template.records - completed - pending;
  const sampleValues = [82, 67, 91, 74, 88];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border bg-muted/40 p-4 text-sm sm:grid-cols-4">
        <div><span className="block text-xs text-muted-foreground">Report period</span>Last 30 days</div>
        <div><span className="block text-xs text-muted-foreground">Generated by</span>Admin User</div>
        <div><span className="block text-xs text-muted-foreground">Site</span>{template.site}</div>
        <div><span className="block text-xs text-muted-foreground">Report ID</span><span className="font-mono">RPT-{template.id.toUpperCase().slice(0, 8)}</span></div>
      </div>
      <div className="rounded-xl border bg-muted p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{template.records}</div>
            <div className="text-sm text-muted-foreground">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center"><div className="text-2xl font-bold">{attention}</div><div className="text-sm text-muted-foreground">Attention</div></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <figure className="rounded-xl border bg-card p-4 lg:col-span-2"><figcaption className="mb-3 text-sm font-semibold">Activity Trend — Last 7 Days</figcaption><svg viewBox="0 0 300 120" className="w-full">
          <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points="10,90 50,80 90,70 130,75 170,60 210,55 250,60 290,50" />
        </svg></figure>
        <figure className="rounded-xl border bg-card p-4"><figcaption className="mb-3 text-sm font-semibold">Status Distribution</figcaption><svg viewBox="0 0 200 120" className="w-full"><circle cx="100" cy="60" r="38" fill="none" stroke="var(--muted)" strokeWidth="18"/><circle cx="100" cy="60" r="38" fill="none" stroke="#10b981" strokeWidth="18" strokeDasharray="170 239" transform="rotate(-90 100 60)"/></svg></figure>
      </div>

      <figure className="rounded-xl border bg-card p-4"><figcaption className="mb-3 text-sm font-semibold">Performance by Line</figcaption><div className="flex h-28 items-end gap-4">{sampleValues.map((value, i) => <div key={value} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-primary/80" style={{height: `${value}%`}}/><span className="text-xs text-muted-foreground">Line {i + 1}</span></div>)}</div></figure>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto p-4">
        <table className="min-w-[720px] w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground"><th>ID</th><th>Item</th><th>Category</th><th>Status</th><th>Date</th><th>Responsible</th><th>Value</th></tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t"><td className="py-2 font-mono text-[12px]">{i + 1}</td><td>Item {i + 1}</td><td>{template.category}</td><td>Completed</td><td>2026-06-1{i}</td><td>{template.owner}</td><td>{sampleValues[i]}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-sm text-muted-foreground">Showing 5 of {template.records.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
        <div>Source: <button onClick={() => onViewSource(template.source)} className="text-primary">{template.source}</button></div>
        <ExportDropdown formats={template.formats} fileBase={template.id} onDownload={onDownload} />
      </div>
    </div>
  );
}

function HistoryList({ template, onGenerateNew, onDownload }: { template: ReportTemplate; onGenerateNew: () => void; onDownload: (name: string) => void }) {
  const rows = Array.from({ length: 4 }).map((_, i) => ({ date: `June ${10 + i}`, by: template.owner, format: template.formats[i % template.formats.length], size: `${(0.5 + i * 0.3).toFixed(1)} MB` }));
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto"><table className="min-w-[580px] w-full text-sm">
        <thead className="text-xs text-muted-foreground"><tr><th>Date</th><th>Generated By</th><th>Format</th><th>Size</th><th /></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t"><td className="py-2">{r.date}</td><td>{r.by}</td><td><span className="rounded-md bg-muted px-2 py-1 text-sm">{r.format}</span></td><td>{r.size}</td><td><button onClick={() => onDownload(`${template.id}-${i}.${r.format === "Excel" ? "xlsx" : r.format === "CSV" ? "csv" : "pdf"}`)} className="rounded-lg border px-3 py-1 text-sm"><Download className="size-4 inline mr-2" />Download</button></td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="flex justify-end gap-2">
        <button onClick={onGenerateNew} className="rounded-lg bg-primary px-4 py-2 text-white">Generate New Version</button>
      </div>
    </div>
  );
}

type CreateReportValues = {
  name: string; type: string; site: string; from: string; to: string;
  department: string; schedule: string; recipients: string; description: string;
  formats: ReportFormat[];
};

function CreateReportForm({ templates, onCancel, onGenerate }: { templates: ReportTemplate[]; onCancel: () => void; onGenerate: (vals: CreateReportValues) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(templates[0]?.id ?? "");
  const [site, setSite] = useState("All Sites");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [outPdf, setOutPdf] = useState(true);
  const [outExcel, setOutExcel] = useState(true);
  const [outCsv, setOutCsv] = useState(false);
  const [department, setDepartment] = useState("");
  const [schedule, setSchedule] = useState("One Time");
  const [recipients, setRecipients] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim() || !type || !from || !to || !(outPdf || outExcel || outCsv)) {
      setError("Complete the required fields and select at least one output format.");
      return;
    }
    setError("");
    const selectedFormats: ReportFormat[] = [];
    if (outPdf) selectedFormats.push("PDF");
    if (outExcel) selectedFormats.push("Excel");
    if (outCsv) selectedFormats.push("CSV");
    onGenerate({ name, type, site, from, to, department, schedule, recipients, description, formats: selectedFormats });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><div className="text-sm text-muted-foreground">Report Name</div><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border bg-background p-2" /></label>
        <label className="block"><div className="text-sm text-muted-foreground">Report Type</div><select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border bg-background p-2">{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><div className="text-sm text-muted-foreground">Site</div><select value={site} onChange={(e) => setSite(e.target.value)} className="w-full rounded-lg border bg-background p-2">{sites.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        <label className="block"><div className="text-sm text-muted-foreground">Date From</div><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border bg-background p-2" /></label>
        <label className="block"><div className="text-sm text-muted-foreground">Date To</div><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border bg-background p-2" /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><div className="text-sm text-muted-foreground">Department</div><input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-lg border bg-background p-2" placeholder="e.g. Operations" /></label>
        <label className="block"><div className="text-sm text-muted-foreground">Recipients</div><input value={recipients} onChange={(e) => setRecipients(e.target.value)} className="w-full rounded-lg border bg-background p-2" placeholder="team@company.com" /></label>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2"><input type="checkbox" checked={outPdf} onChange={(e) => setOutPdf(e.target.checked)} /> PDF</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={outExcel} onChange={(e) => setOutExcel(e.target.checked)} /> Excel</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={outCsv} onChange={(e) => setOutCsv(e.target.checked)} /> CSV</label>
      </div>
      <fieldset><legend className="mb-2 text-sm text-muted-foreground">Schedule</legend><div className="flex flex-wrap gap-4">{["One Time", "Daily", "Weekly", "Monthly"].map((option) => <label key={option} className="flex items-center gap-2"><input type="radio" name="schedule" checked={schedule === option} onChange={() => setSchedule(option)} />{option}</label>)}</div></fieldset>
      <label className="block"><div className="text-sm text-muted-foreground">Description</div><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20 w-full rounded-lg border bg-background p-2" /></label>
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><button onClick={onCancel} className="rounded-lg border px-4 py-2">Cancel</button><button onClick={submit} className="rounded-lg bg-primary px-4 py-2 text-white">Generate Report</button></div>
    </div>
  );
}

function GenerationProgress({ step, done, onView }: { step: number; done: boolean; onView: () => void }) {
  const steps = ["Collecting data...", "Processing records...", "Building charts...", "Formatting output...", "Complete!"];
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-muted p-4"><svg width="36" height="36"><circle cx="18" cy="18" r="16" stroke="#3b82f6" strokeWidth="2" fill="none" /></svg></div>
        <h3 className="text-lg font-semibold">Generating Report</h3>
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <div className={`grid size-7 place-items-center rounded-full ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}>{i < step ? <Check className="size-4" /> : i === step ? <span className="size-2 animate-pulse rounded-full bg-white" /> : null}</div>
            <div className={`${i < step ? "text-muted-foreground" : i === step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s}</div>
          </li>
        ))}
      </ol>
      <div className="h-2 w-full rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${done ? 100 : Math.min(100, (step / steps.length) * 100)}%` }} /></div>
      {done && <div className="flex justify-center"><button onClick={onView} className="rounded-lg bg-green-600 px-4 py-2 text-white">View Report</button></div>}
    </div>
  );
}

export default ReportCenter;
