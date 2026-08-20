"use client";
/* eslint-disable react-hooks/preserve-manual-memoization */

// FEATURE: Reports
// PAGE: /reports lists persisted report records and exports authorized Excel workbooks.
// API: GET /api/backend/reports and /api/backend/reports/export.xlsx.
// PERMISSION: reports.view for the page and reports.export for download.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FilePlus2, RefreshCw } from "lucide-react";

import type { ReportListItem } from "@/lib/page-api";
import { useSessionUser } from "@/lib/session-user";
import { pageRequest } from "@/lib/page-request";
import type { FacilityWorkspace } from "@/lib/backend-dtos";
import type { ReportsPageContract } from "@/lib/page-contracts";
import { apiRequest } from "@/lib/api-client";
import { buildExportQuery, exportFilename, reportTypes, utcDayEnd, utcDayStart, validateExportDates, type ReportType } from "@/lib/report-export";

export function ReportCenter() {
  const session=useSessionUser();
  const [facilityScope,setFacilityScope]=useState<FacilityWorkspace|null>(null);const hierarchy={data:facilityScope};
  const capabilities=session.user?.capabilities??[];
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [facilityId, setFacilityId] = useState("");
  const [lineId, setLineId] = useState("");
  const [stationId, setStationId] = useState("");
  const [source, setSource] = useState("");
  const [reportType, setReportType] = useState<ReportType>("industrial-analytics");
  const [includeSynthetic, setIncludeSynthetic] = useState(true);
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query=new URLSearchParams({page:String(page),pageSize:String(pageSize)});if(facilityId)query.set("facilityId",facilityId);if(source)query.set("source",source);if(fromUtc)query.set("fromUtc",utcDayStart(fromUtc));if(toUtc)query.set("toUtc",utcDayEnd(toUtc));
      const response = await pageRequest<ReportsPageContract>("reports",{query});
      setReports(response.data.items);setTotal(response.data.total);setFacilityScope(response.enrichment);
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

  // HANDLER: Export Report
  // API: GET /api/backend/reports/export.xlsx through the binary-preserving BFF route.
  async function exportWorkbook() {
    const dateError=validateExportDates(fromUtc,toUtc);if(dateError){setError(dateError);return}
    setExporting(true);
    setError("");
    try {
      const params=buildExportQuery({reportType,includeSynthetic,facilityId,lineId,stationId,fromDate:fromUtc,toDate:toUtc});
      const response = await fetch(`/api/backend/reports/export.xlsx?${params}`, { credentials:"same-origin" });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "Report export failed.");
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
        throw new Error("The export service returned an unexpected file format.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download=exportFilename(response.headers.get("content-disposition"));
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

  async function generateReport() {
    const dateError=validateExportDates(fromUtc,toUtc);if(dateError){setError(dateError);return}
    setGenerating(true); setError(""); setSuccess("");
    try {
      const hierarchyAllowed=reportType!=="audit"&&reportType!=="security";await apiRequest<ReportListItem>("/api/backend/reports", { method:"POST", body:JSON.stringify({ reportType, facilityId:facilityId?Number(facilityId):null, productionLineId:hierarchyAllowed&&lineId?Number(lineId):null, stationId:hierarchyAllowed&&stationId?Number(stationId):null, fromUtc:fromUtc?utcDayStart(fromUtc):null, toUtc:toUtc?utcDayEnd(toUtc):null, includeSynthetic }) });
      setPage(1); setSuccess("Report generated successfully and added to report history."); await load();
    } catch (cause) { setError(cause instanceof Error?cause.message:"Report generation failed."); }
    finally { setGenerating(false); }
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const facilities = hierarchy.data?.facilities ?? [];
  const selectedFacility=facilities.find(item=>String(item.facilityId)===facilityId);
  const lines=useMemo(()=>selectedFacility?.halls.flatMap(hall=>hall.lines)??[],[selectedFacility]);
  const stations=lines.find(item=>String(item.productionLineId)===lineId)?.stations??[];
  const hierarchyFiltersAllowed=reportType!=="audit"&&reportType!=="security";
  const canExport = capabilities.includes("reports.export");
  const canGenerate = capabilities.includes("reports.generate") || canExport;

  return (
    <section className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Report Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Facility-scoped report exports and server-generated report history</p>
        </div>
        {(canGenerate||canExport)&&<div className="flex flex-wrap items-center gap-2"><select aria-label="Report type" value={reportType} onChange={event=>{const next=event.target.value as ReportType;setReportType(next);if(next==="audit"||next==="security"){setLineId("");setStationId("")}}} className="h-10 rounded-lg border bg-card px-3 text-xs">{reportTypes.map(value=><option key={value} value={value}>{value==="industrial-analytics"?"Complete Platform Workbook":value.replaceAll("-"," ")}</option>)}</select>{canGenerate&&<button onClick={()=>void generateReport()} disabled={generating||exporting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"><FilePlus2 className="size-4"/>{generating?"Generating…":"Generate Report"}</button>}{canExport&&<button onClick={()=>void exportWorkbook()} disabled={exporting||generating} className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold disabled:opacity-50"><Download className="size-4"/>{exporting?"Exporting…":"Export Excel"}</button>}</div>}
      </header>

      <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
            <select value={facilityId} onChange={(event) => { setFacilityId(event.target.value); setLineId(""); setStationId(""); setPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-xs" aria-label="Facility">
              <option value="">All authorized facilities</option>
              {facilities.map((facility) => <option key={facility.facilityId} value={facility.facilityId}>{facility.name}</option>)}
            </select>
            <select value={lineId} disabled={!facilityId||!hierarchyFiltersAllowed} onChange={(event) => { setLineId(event.target.value); setStationId(""); }} className="h-10 rounded-lg border bg-background px-3 text-xs disabled:opacity-50" aria-label="Production line"><option value="">{hierarchyFiltersAllowed?"All production lines":"Not available for this report type"}</option>{lines.map((line) => <option key={line.productionLineId} value={line.productionLineId}>{line.name}</option>)}</select>
            <select value={stationId} disabled={!lineId||!hierarchyFiltersAllowed} onChange={(event) => setStationId(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-xs disabled:opacity-50" aria-label="Station"><option value="">{hierarchyFiltersAllowed?"All stations":"Not available for this report type"}</option>{stations.map((station) => <option key={station.stationId} value={station.stationId}>{station.name}</option>)}</select>
            <input value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} placeholder="Report source/type" className="h-10 rounded-lg border bg-background px-3 text-xs" />
            <input type="date" value={fromUtc} onChange={(event) => { setFromUtc(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-xs" aria-label="From date" />
            <input type="date" value={toUtc} onChange={(event) => { setToUtc(event.target.value); setPage(1); }} className="h-10 rounded-lg border bg-background px-3 text-xs" aria-label="To date" />
            <label className="flex h-10 items-center gap-2 rounded-lg border bg-background px-3 text-xs"><input type="checkbox" checked={includeSynthetic} onChange={(event) => setIncludeSynthetic(event.target.checked)} />Include synthetic data</label>
            <button onClick={() => void load()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-xs"><RefreshCw className="size-3.5" />Refresh</button>
          </div>
          {canExport&&<p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">Export: <strong className="text-foreground">{reportType==="industrial-analytics"?"Complete platform workbook":reportType.replaceAll("-"," ")}</strong> · Scope: <strong className="text-foreground">{selectedFacility?.name??"All authorized facilities"}</strong>{lineId&&<> · Line: <strong className="text-foreground">{lines.find(item=>String(item.productionLineId)===lineId)?.name}</strong></>}{stationId&&<> · Station: <strong className="text-foreground">{stations.find(item=>String(item.stationId)===stationId)?.name}</strong></>} · Synthetic data: <strong className="text-foreground">{includeSynthetic?"included":"excluded"}</strong> · Format: <strong className="text-foreground">Excel (.xlsx)</strong></p>}

          {success && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700">{success}</p>}
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[50rem] text-left text-xs">
              <thead className="border-b bg-muted/40 font-mono text-xs uppercase text-muted-foreground"><tr><th className="p-4">Report</th><th className="p-4">Facility</th><th className="p-4">Rows</th><th className="p-4">Generated by</th><th className="p-4">Generated</th></tr></thead>
              <tbody className="divide-y">
                {reports.map((report) => <tr key={report.reportId}><td className="p-4"><strong>{report.reportType}</strong><p className="mt-1 font-mono text-xs text-muted-foreground">{report.reportId}</p></td><td className="p-4">{report.facility || "All authorized facilities"}</td><td className="p-4 font-mono">{report.rowCount.toLocaleString()}</td><td className="p-4">{report.generatedBy}</td><td className="p-4">{new Date(report.generatedAtUtc).toLocaleString()}</td></tr>)}
              </tbody>
            </table>
            {loading ? <div className="h-36 animate-pulse bg-muted/30" /> : !reports.length && <p className="p-10 text-center text-sm text-muted-foreground">No report exports match these filters.</p>}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{total.toLocaleString()} reports</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>
      </div>
    </section>
  );
}

export default ReportCenter;
