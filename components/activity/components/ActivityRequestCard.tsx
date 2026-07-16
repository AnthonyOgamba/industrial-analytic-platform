"use client";

import { useMemo, useState } from "react";
import type {
  ActivityRequest,
  ActivityRequestStatus,
  ManagerUser,
} from "../activity-data";
import { ActivityStatusBadge } from "./ActivityStatusBadge";
import { ActivityTypeIcon } from "./ActivityTypeIcon";
import { AssignManagerModal } from "./AssignManagerModal";
import { DecisionConfirmModal } from "./DecisionConfirmModal";
import { RestoreRequestButton } from "./RestoreRequestButton";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLatestDecision(
  request: ActivityRequest,
): {
  approvedBy?: string;
  approvedAt?: string;
  declinedBy?: string;
  declinedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
} {
  const approved = request.decisionHistory
    .filter((h) => h.type === "approve")
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  const declined = request.decisionHistory
    .filter((h) => h.type === "decline")
    .sort((a, b) => b.timestamp.localeCompare(b.timestamp))[0];
  const reopened = request.decisionHistory
    .filter((h) => h.type === "reopen")
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  return {
    approvedBy: approved?.actorName,
    approvedAt: approved?.timestamp,
    declinedBy: declined?.actorName,
    declinedAt: declined?.timestamp,
    reopenedBy: reopened?.actorName,
    reopenedAt: reopened?.timestamp,
  };
}

export function ActivityRequestCard({
  request,
  allRequests,
  managersById,
  onChangeRequests,
  onTabChange,
}: {
  request: ActivityRequest;
  allRequests: ActivityRequest[];
  managersById: Map<string, ManagerUser>;
  onChangeRequests: (next: ActivityRequest[]) => void;
  onTabChange: (tab: "all" | ActivityRequestStatus) => void;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<
    null | { type: "approve" | "decline" }
  >(null);

  const [assignNote, setAssignNote] = useState("");
  const [decisionNote, setDecisionNote] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState(
    request.assignedManagerId,
  );

  const latest = useMemo(() => getLatestDecision(request), [request]);

  const canAct = request.status === "pending";

  function updateRequest(mutator: (prev: ActivityRequest) => ActivityRequest) {
    onChangeRequests(allRequests.map((r) => (r.id === request.id ? mutator(r) : r)));
  }

  function handleAssign() {
    const nextManager = managersById.get(selectedManagerId);
    if (!nextManager) return;

    updateRequest((prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        assignedManagerId: nextManager.id,
        assignedManagerName: nextManager.name,
        lastUpdatedAt: now,
        decisionHistory: [
          ...prev.decisionHistory,
          {
            id: `dh-${prev.id}-${now}`,
            type: "assign",
            actorName: "Admin User",
            actorRole: "Administrator",
            timestamp: now,
            note: assignNote.trim() || undefined,
            meta: {
              from: prev.assignedManagerName,
              to: nextManager.name,
            },
          },
        ],
      };
    });

    setAssignOpen(false);
    setAssignNote("");
  }

  function handleDecision(type: "approve" | "decline") {
    const actorName = type === "approve" ? "Admin User" : "Admin User";

    updateRequest((prev) => {
      const now = new Date().toISOString();
      const nextStatus: ActivityRequestStatus = type === "approve" ? "approved" : "declined";
      return {
        ...prev,
        status: nextStatus,
        lastUpdatedAt: now,
        decisionHistory: [
          ...prev.decisionHistory,
          {
            id: `dh-${prev.id}-${now}`,
            type,
            actorName,
            actorRole: "Administrator",
            timestamp: now,
            note: decisionNote.trim() || undefined,
          },
        ],
      };
    });

    setDecisionOpen(null);
    setDecisionNote("");
    onTabChange(type === "approve" ? "approved" : "declined");
  }

  function handleRestore() {
    updateRequest((prev) => {
      const now = new Date().toISOString();
      return {
        ...prev,
        status: "pending",
        lastUpdatedAt: now,
        decisionHistory: [
          ...prev.decisionHistory,
          {
            id: `dh-${prev.id}-${now}`,
            type: "reopen",
            actorName: "Admin User",
            actorRole: "Administrator",
            timestamp: now,
            note: "Request reopened for review",
          },
        ],
      };
    });

    onTabChange("pending");
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4",
        request.status === "pending" ? "hover:bg-muted/20" : "",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <ActivityTypeIcon activityType={request.activityType} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{request.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>Requested by {request.requestedByName}</span>
              <span className="text-muted-foreground/70">•</span>
              <span>{request.requestedByRole}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActivityStatusBadge status={request.status} />
          {request.status === "approved" && latest.approvedAt && (
            <div className="text-[11px] text-muted-foreground">
              Approved by <span className="font-medium text-foreground">{latest.approvedBy}</span>
              <div>{formatDateTime(latest.approvedAt)}</div>
            </div>
          )}
          {request.status === "declined" && latest.declinedAt && (
            <div className="text-[11px] text-muted-foreground">
              Declined by <span className="font-medium text-foreground">{latest.declinedBy}</span>
              <div>{formatDateTime(latest.declinedAt)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg border bg-muted/10 p-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Assigned manager</p>
          <p className="mt-1 text-sm font-medium">{request.assignedManagerName}</p>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Resource affected: <span className="font-medium text-foreground">{request.resourceAffected.title}</span>
          </div>
          {Object.keys(request.resourceAffected.details).length > 0 && (
            <dl className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {Object.entries(request.resourceAffected.details).map(([k, v]) => (
                <div key={k} className="flex items-start gap-2">
                  <dt className="w-[130px] shrink-0 text-muted-foreground/80">{k}</dt>
                  <dd className="flex-1 text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="rounded-lg border bg-muted/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Requested</p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(request.requestedAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Last updated</p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(request.lastUpdatedAt)}</p>
            </div>
          </div>

          {request.decisionHistory.length > 0 && (
            <div className="mt-3 rounded-lg bg-background/60 p-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Decision history</p>
              <div className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                {request.decisionHistory
                  .slice()
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                  .slice(0, 3)
                  .map((h) => (
                    <div key={h.id} className="flex gap-2">
                      <span className="w-20 shrink-0 text-foreground/90">
                        {h.type === "approve"
                          ? "Approved"
                          : h.type === "decline"
                            ? "Declined"
                            : h.type === "reopen"
                              ? "Reopened"
                              : "Assigned"}
                      </span>
                      <span className="flex-1">
                        {h.actorName}
                        <span className="text-muted-foreground/70"> · {new Date(h.timestamp).toLocaleDateString()}</span>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {request.status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDecisionNote("");
                  setDecisionOpen({ type: "approve" });
                }}
                className="h-9 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecisionNote("");
                  setDecisionOpen({ type: "decline" });
                }}
                className="h-9 rounded-lg bg-destructive px-3 text-xs font-semibold text-white hover:bg-destructive/90"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedManagerId(request.assignedManagerId);
                  setAssignOpen(true);
                }}
                className="h-9 rounded-lg border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted/30"
              >
                Assign / Reassign Manager
              </button>
            </>
          ) : (
            <RestoreRequestButton onRestore={handleRestore} />
          )}
        </div>

        {request.status !== "pending" && latest.reopenedAt && (
          <p className="text-[11px] text-muted-foreground">
            Reopened: {formatDateTime(latest.reopenedAt)}
          </p>
        )}
      </div>

      <AssignManagerModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        requestTitle={request.title}
        currentManager={request.assignedManagerName}
        selectedManagerId={selectedManagerId}
        onSelectedManagerIdChange={setSelectedManagerId}
        managers={Array.from(managersById.values())}
        note={assignNote}
        onNoteChange={setAssignNote}
        onAssign={handleAssign}
      />

      <DecisionConfirmModal
        open={!!decisionOpen}
        decisionType={decisionOpen?.type ?? "approve"}
onOpenChange={(next: boolean) => {
          if (!next) setDecisionOpen(null);
        }}
        requestTitle={request.title}
        note={decisionNote}
        onNoteChange={setDecisionNote}
onConfirm={(type: "approve" | "decline") => handleDecision(type)}
      />
    </article>
  );
}

