"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, FileUp, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import type { ImportBatchDto, PagedEnvelope } from "@/lib/backend-dtos";
import { useFacilityHierarchy } from "@/lib/facility-hierarchy";
import { DataInputTabs, type DataInputTab } from "./data-input-tabs";

export function DataInputPage() {
  const hierarchy = useFacilityHierarchy();
  const [tab, setTab] = useState<DataInputTab>("imports");
  const [data, setData] = useState<PagedEnvelope<ImportBatchDto>>({
    items: [],
    page: 1,
    pageSize: 200,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [facilityId, setFacilityId] = useState("");
  const [source, setSource] = useState("uploaded");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(
        await apiRequest(
          "/api/backend/data-input/batches?page=1&pageSize=200&includeSynthetic=true",
        ),
      );
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Import batches could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setPending(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      if (facilityId) body.set("facilityId", facilityId);
      body.set("source", source);
      body.set("isSynthetic", "false");
      const response = await fetch("/api/backend/data-input/import", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          typeof result.error === "string" ? result.error : "Import failed.",
        );
      setFile(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Import failed.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-5 pb-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
          Data Input
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Telemetry Ingestion Center
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Authenticated import batches and persisted upload metadata
        </p>
      </header>
      <DataInputTabs active={tab} onChange={setTab} />
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}
      {tab === "sources" ? (
        <section className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
          <h2 className="font-semibold">
            Data-source management is unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The backend stores upload-batch metadata only. It has no connection,
            schema-discovery or pipeline-status model, so no sample sources are
            displayed.
          </p>
        </section>
      ) : (
        <>
          <form
            onSubmit={upload}
            className="grid gap-3 rounded-xl border bg-card p-4 lg:grid-cols-[1fr_14rem_12rem_auto]"
          >
            <label className="text-xs">
              File
              <input
                required
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mt-1 block h-10 w-full rounded-lg border bg-background p-2 text-xs"
              />
            </label>
            <label className="text-xs">
              Facility
              <select
                value={facilityId}
                onChange={(event) => setFacilityId(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
              >
                <option value="">Global import</option>
                {(hierarchy.data?.facilities ?? []).map((item) => (
                  <option key={item.facilityId} value={item.facilityId}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Source
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
              />
            </label>
            <button
              disabled={!file || pending}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40"
            >
              <FileUp className="size-4" />
              {pending ? "Uploading…" : "Import File"}
            </button>
          </form>
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              {data.total} server records
            </p>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-1 text-xs text-primary"
            >
              <RefreshCw className="size-3" />
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[65rem] text-left text-xs">
                  <thead className="bg-muted/40 font-mono text-xs uppercase text-muted-foreground">
                    <tr>
                      {[
                        "Batch",
                        "File",
                        "Facility",
                        "Status",
                        "Rows",
                        "Accepted",
                        "Rejected",
                        "Source",
                        "Created",
                      ].map((item) => (
                        <th key={item} className="px-3 py-3">
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.importBatchId} className="border-t">
                        <td className="px-3 py-3 font-mono text-xs">
                          {item.importBatchId}
                        </td>
                        <td className="px-3 py-3">{item.fileName}</td>
                        <td className="px-3 py-3">
                          {item.facilityId
                            ? (hierarchy.data?.facilities.find(
                                (facility) =>
                                  facility.facilityId === item.facilityId,
                              )?.name ?? item.facilityId)
                            : "Global"}
                        </td>
                        <td className="px-3 py-3">{item.status}</td>
                        <td className="px-3 py-3">{item.rowCount}</td>
                        <td className="px-3 py-3">{item.acceptedCount}</td>
                        <td className="px-3 py-3">{item.rejectedCount}</td>
                        <td className="px-3 py-3">{item.source}</td>
                        <td className="px-3 py-3">
                          {new Date(item.createdAtUtc).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {!data.items.length && (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-12 text-center text-muted-foreground"
                        >
                          No import batches are available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
