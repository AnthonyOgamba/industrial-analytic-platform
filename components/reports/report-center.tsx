"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";

import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import { pageApi, type ReportListItem } from "@/lib/page-api";

type Tab = "available" | "scheduled" | "recent";

export function ReportCenter() {
  const hierarchy = useFacilityHierarchy();
  const [tab, setTab] = useState<Tab>("recent");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [facilityId, setFacilityId] = useState("");
  const [lineId, setLineId] = useState("");
  const [stationId, setStationId] = useState("");
  const [source, setSource] = useState("");
  const [reportType, setReportType] = useState("industrial-analytics");
  const [includeSynthetic, setIncludeSynthetic] = useState(true);
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await pageApi.reports({
        facilityId: facilityId ? Number(facilityId) : undefined,
        source: source || undefined,
        fromUtc: fromUtc ? new Date(`${fromUtc}T00:00:00`).toISOString() : undefined,
        toUtc: toUtc ? new Date(`${toUtc}T23:59:59.999`).toISOString() : undefined,
        page,
        pageSize,
      });
      setReports(response.items);
      setTotal(response.total);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [facilityId, fromUtc, page, source, toUtc]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useEffect(() => {
    void fetch("/api/auth/session", { credentials:"same-origin" }).then(response=>response.ok?response.json():null).then(session=>setCapabilities(session?.user?.capabilities??[])).catch(()=>setCapabilities([]));
  }, []);

  async function exportWorkbook() {
    setExporting(true);
    setError("");
    try {
      const params = new URLSearchParams({ reportType, includeSynthetic: String(includeSynthetic) });
      if (facilityId) params.set("facilityId", facilityId);
      if (lineId) params.set("lineId", lineId);
      if (stationId) params.set("stationId", stationId);
      if (fromUtc) params.set("fromUtc", new Date(`${fromUtc}T00:00:00`).toISOString());
      if (toUtc) params.set("toUtc", new Date(`${toUtc}T23:59:59.999`).toISOString());
      const response = await fetch(`/api/backend/reports/export.xlsx?${params}`, { credentials:"same-origin" });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "Report export failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const disposition=response.headers.get("content-disposition");
      const encoded=disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      anchor.download=encoded?decodeURIComponent(encoded):disposition?.match(/filename="?([^";]+)"?/i)?.[1]??`${reportType}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Report export failed.");
    } finally {
      setExporting(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const facilities = hierarchy.data?.facilities ?? [];
  const selectedFacility=facilities.find(item=>String(item.facilityId)===facilityId);
  const lines=useMemo(()=>selectedFacility?.halls.flatMap(hall=>hall.lines)??[],[selectedFacility]);
  const stations=lines.find(item=>String(item.productionLineId)===lineId)?.stations??[];
  const canExport = capabilities.includes("reports.export");

  return (
    <section className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Report Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Facility-scoped report exports and server-generated report history</p>
        </div>
        {canExport&&<div className="flex flex-wrap items-center gap-2"><select aria-label="Export report scope" value={reportType} onChange={event=>setReportType(event.target.value)} className="h-10 rounded-lg border bg-card px-3 text-xs"><option value="industrial-analytics">Complete Platform Workbook</option><option value="financial-impact">Financial Impact</option><option value="downtime">Downtime</option><option value="facilities">Facilities</option><option value="sensors">Sensors</option></select><button onClick={() => void exportWorkbook()} disabled={exporting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Download className="size-4" />{exporting ? "Generating…" : "Export Excel"}
        </button></div>}
      </header>

      <nav className="flex overflow-x-auto border-b" role="tablist" aria-label="Report views">
        {([["available", "Available Reports"], ["scheduled", "Scheduled Reports"], ["recent", "Recent Reports"]] as const).map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`relative h-12 px-4 text-xs font-medium ${tab === key ? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary" : "text-muted-foreground"}`}>
            {label}{key === "recent" && <span className="ml-2 rounded-full bg-muted px-2 py-0.5">{total}</span>}
          </button>
        ))}
      </nav>

      {tab !== "recent" ? (
        <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">{tab === "available" ? "Report templates are unavailable" : "Report scheduling is unavailable"}</h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
            The current backend contract supports report history and Excel export, but does not provide {tab === "available" ? "a report-template or report-generation API" : "report scheduling or lifecycle operations"}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
            <select value={facilityId} onChange={(event) => { setFacilityId(event.target.value); setLineId(""); setStationId(""); setPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-xs" aria-label="Facility">
              <option value="">All authorized facilities</option>
              {facilities.map((facility) => <option key={facility.facilityId} value={facility.facilityId}>{facility.name}</option>)}
            </select>
            <select value={lineId} disabled={!facilityId} onChange={(event) => { setLineId(event.target.value); setStationId(""); }} className="h-10 rounded-lg border bg-background px-3 text-xs disabled:opacity-50" aria-label="Production line"><option value="">All production lines</option>{lines.map((line) => <option key={line.productionLineId} value={line.productionLineId}>{line.name}</option>)}</select>
            <select value={stationId} disabled={!lineId} onChange={(event) => setStationId(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs disabled:opacity-50" aria-label="Station"><option value="">All stations</option>{stations.map((station) => <option key={station.stationId} value={station.stationId}>{station.name}</option>)}</select>
            <input value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} placeholder="Report source/type" className="h-10 rounded-lg border bg-background px-3 text-xs" />
            <input type="date" value={fromUtc} onChange={(event) => { setFromUtc(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-xs" aria-label="From date" />
            <input type="date" value={toUtc} onChange={(event) => { setToUtc(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-xs" aria-label="To date" />
            <label className="flex h-10 items-center gap-2 rounded-lg border bg-background px-3 text-xs"><input type="checkbox" checked={includeSynthetic} onChange={(event) => setIncludeSynthetic(event.target.checked)} />Include synthetic data</label>
            <button onClick={() => void load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-xs"><RefreshCw className="size-3.5" />Refresh</button>
          </div>
          {canExport&&reportType!=="industrial-analytics"&&<p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">The selected scope is sent to the backend. The current export contract still defines a fixed multi-sheet workbook, so sheet-level separation requires a backend export update.</p>}

          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[50rem] text-left text-xs">
              <thead className="border-b bg-muted/40 font-mono text-[9px] uppercase text-muted-foreground"><tr><th className="p-4">Report</th><th className="p-4">Facility</th><th className="p-4">Rows</th><th className="p-4">Generated by</th><th className="p-4">Generated</th></tr></thead>
              <tbody className="divide-y">
                {reports.map((report) => <tr key={report.reportId}><td className="p-4"><strong>{report.reportType}</strong><p className="mt-1 font-mono text-[9px] text-muted-foreground">{report.reportId}</p></td><td className="p-4">{report.facility || "All authorized facilities"}</td><td className="p-4 font-mono">{report.rowCount.toLocaleString()}</td><td className="p-4">{report.generatedBy}</td><td className="p-4">{new Date(report.generatedAtUtc).toLocaleString()}</td></tr>)}
              </tbody>
            </table>
            {loading ? <div className="h-36 animate-pulse bg-muted/30" /> : !reports.length && <p className="p-10 text-center text-sm text-muted-foreground">No report exports match these filters.</p>}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{total.toLocaleString()} reports</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>
        </div>
      )}
    </section>
  );
}

export default ReportCenter;
