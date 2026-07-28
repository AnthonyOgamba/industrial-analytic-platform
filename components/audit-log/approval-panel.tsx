"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import type { ApprovalDto } from "@/lib/backend-dtos";
import { useSessionUser } from "@/lib/session-user";
import { normalizeApprovals } from "@/lib/api-normalizers";
import { PERMISSIONS } from "@/lib/permissions";

type Tab = "pending" | "approved" | "rejected" | "executed";

function isPermanentDeletionRequest(item: ApprovalDto) {
  return /permanent.*delete.*user|user.*permanent.*delete/i.test(item.action);
}

export function ApprovalPanel() {
  const session = useSessionUser();
  const [items, setItems] = useState<ApprovalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<Tab>("pending");
  const [deciding, setDeciding] = useState<ApprovalDto | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [comments, setComments] = useState("");
  const [pending, setPending] = useState(false);
  const capabilities = new Set(session.user?.capabilities ?? []);
  const canPermanentlyDeleteUsers = capabilities.has(PERMISSIONS.users.delete) &&
    capabilities.has(PERMISSIONS.approvals.execute);
  const canView = capabilities.has("audit.view") || capabilities.has(PERMISSIONS.approvals.view);
  const canDecide = canView &&
    (capabilities.has(PERMISSIONS.approvals.approve) || capabilities.has(PERMISSIONS.approvals.reject));
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(
        normalizeApprovals(
          await apiRequest<unknown>("/api/backend/approvals"),
        ).map((item) => ({ ...item, status: item.status.toLowerCase() })),
      );
    } catch (cause) {
      setItems([]);
      setError(
        cause instanceof Error
          ? cause.message
          : "Approvals could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!canView) return; // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [canView, load]);
  useEffect(() => {
    if (!canView) return;
    const refresh = () => void load();
    window.addEventListener("divu-approvals-changed", refresh);
    return () => window.removeEventListener("divu-approvals-changed", refresh);
  }, [canView, load]);
  const visible = useMemo(
    () =>
      (Array.isArray(items) ? items : []).filter((item) => item.status === tab),
    [items, tab],
  );
  const isPermanentDeletion = Boolean(
    deciding && isPermanentDeletionRequest(deciding),
  );
  async function submit() {
    if (!deciding) return;
    setPending(true);
    setError("");
    try {
      const decisionPath = isPermanentDeletionRequest(deciding)
        ? `/api/backend/users/permanent-deletions/${deciding.request_id}/decision`
        : `/api/backend/approvals/${deciding.request_id}/decision`;
      await apiRequest(decisionPath, {
          method: "POST",
          body: JSON.stringify({ decision, comments: comments || null }),
        });
      setDeciding(null);
      setComments("");
      setSuccess(`Request ${decision}.`);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The approval decision failed.",
      );
    } finally {
      setPending(false);
    }
  }
  if (!canView) return null;
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" />
            <h2 className="font-bold">Audit & Approvals</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Sensitive deletion and modification requests from the canonical
            approval workflow
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </header>
      {success && (
        <p
          role="status"
          className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700"
        >
          {success}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertTriangle className="size-4" />
          {error}
        </p>
      )}
      <nav role="tablist" className="flex overflow-x-auto border-b">
        {(["pending", "approved", "rejected", "executed"] as const).map(
          (value) => (
            <button
              key={value}
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`h-10 border-b-2 px-4 text-xs capitalize ${tab === value ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              {value}{" "}
              <span className="ml-1 rounded-full bg-muted px-1.5">
                {items.filter((item) => item.status === value).length}
              </span>
            </button>
          ),
        )}
      </nav>
      {loading ? (
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[72rem] text-left text-xs">
            <caption className="sr-only">
              Canonical approval requests and decision status
            </caption>
            <thead>
              <tr className="font-mono text-[9px] uppercase text-muted-foreground">
                {[
                  "Action",
                  "Final action",
                  "Actor",
                  "Target",
                  "Proposed value",
                  "Reason / risk",
                  "Requested",
                  "Deleted or decided by / outcome",
                  "Correlation",
                  "Decision",
                ].map((item) => (
                  <th
                    scope="col"
                    key={item}
                    className={item === "Decision" ? "hidden" : "p-3"}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.request_id} className="border-t">
                  <td className="p-3">{item.action}</td>
                  <td className="p-3">
                    {item.status === "pending" &&
                    isPermanentDeletionRequest(item) ? (
                      <div className="min-w-32">
                        <button
                          type="button"
                          disabled={!canPermanentlyDeleteUsers}
                          title={
                            !canPermanentlyDeleteUsers
                              ? "User-deletion and approval-execution permissions are required."
                              : "Review and complete this permanent deletion."
                          }
                          onClick={() => setDeciding(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-2 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Trash2 className="size-3" />
                          Final Delete
                        </button>
                        {!canPermanentlyDeleteUsers && (
                          <p className="mt-1 max-w-32 text-[9px] leading-3 text-muted-foreground">
                            User management permission required
                          </p>
                        )}
                      </div>
                    ) : (
                      <span aria-hidden="true">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {item.requester_username}
                    <p className="font-mono text-[9px]">
                      #{item.requester_user_id}
                    </p>
                  </td>
                  <td className="p-3">
                    {item.target_type} #{item.target_id}
                  </td>
                  <td className="max-w-48 truncate p-3 font-mono text-[9px]">
                    {JSON.stringify(item.proposed_values)}
                  </td>
                  <td className="p-3">
                    {item.reason}
                    <p className="uppercase text-muted-foreground">
                      {item.risk_level}
                    </p>
                  </td>
                  <td className="p-3">
                    {new Date(item.requested_at_utc).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {item.approver_username ?? "Pending"}
                    <p>{item.status}</p>
                  </td>
                  <td className="p-3 font-mono text-[9px]">
                    {item.correlation_id}
                  </td>
                  <td className="hidden">
                    {item.status === "pending" &&
                    (isPermanentDeletionRequest(item)
                      ? canPermanentlyDeleteUsers
                      : canDecide) &&
                    (!isPermanentDeletionRequest(item) ||
                      item.requester_user_id !== session.user?.uid) ? (
                      <button
                        onClick={() => setDeciding(item)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[10px] font-semibold text-white ${
                          isPermanentDeletionRequest(item)
                            ? "bg-destructive"
                            : "bg-primary"
                        }`}
                      >
                        {isPermanentDeletionRequest(item) && (
                          <Trash2 className="size-3" />
                        )}
                        {isPermanentDeletionRequest(item)
                          ? "Final Delete"
                          : "Review"}
                      </button>
                    ) : item.status === "pending" &&
                      !isPermanentDeletionRequest(item) &&
                      item.requester_user_id === session.user?.uid ? (
                      <span className="text-[9px] text-muted-foreground">
                        Another approver required
                      </span>
                    ) : item.status === "pending" &&
                      isPermanentDeletionRequest(item) &&
                      !canPermanentlyDeleteUsers ? (
                      <span className="text-[9px] text-muted-foreground">
                        User management permission required
                      </span>
                    ) : item.status === "pending" && !canDecide ? (
                      <span className="text-[9px] text-muted-foreground">
                        Decision permission required
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-10 text-center text-muted-foreground"
                  >
                    No {tab} approval requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {deciding && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center sm:p-5"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !pending &&
            setDeciding(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            className="w-full max-w-lg rounded-t-2xl border bg-background p-5 shadow-2xl sm:rounded-2xl"
          >
            <header className="flex items-start">
              <div className="flex-1">
                <h3 id="decision-title" className="font-bold">
                  {isPermanentDeletion
                    ? "Final permanent deletion"
                    : "Review approval request"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {deciding.action} · {deciding.target_type} #
                  {deciding.target_id}
                </p>
              </div>
              <button
                onClick={() => setDeciding(null)}
                aria-label="Close decision dialog"
                className="grid size-9 place-items-center rounded-lg border"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setDecision("approved")}
                className={`h-10 rounded-lg border text-xs ${
                  decision === "approved"
                    ? isPermanentDeletion
                      ? "bg-destructive text-white"
                      : "bg-emerald-600 text-white"
                    : ""
                }`}
              >
                <Check className="mr-1 inline size-4" />
                {isPermanentDeletion ? "Permanently Delete" : "Approve"}
              </button>
              <button
                onClick={() => setDecision("rejected")}
                className={`h-10 rounded-lg border text-xs ${decision === "rejected" ? "bg-destructive text-white" : ""}`}
              >
                <X className="mr-1 inline size-4" />
                Reject
              </button>
            </div>
            <label className="mt-4 block text-xs">
              Comments
              <textarea
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                className="mt-1 min-h-24 w-full rounded-lg border bg-background p-3"
              />
            </label>
            <button
              disabled={pending}
              onClick={() => void submit()}
              className="mt-4 h-10 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground disabled:opacity-40"
            >
              {pending
                ? "Submitting…"
                : isPermanentDeletion && decision === "approved"
                  ? "Confirm Permanent Deletion"
                  : "Submit Decision"}
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
