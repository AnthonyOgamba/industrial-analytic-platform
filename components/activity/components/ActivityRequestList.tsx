import type { ActivityRequest, ManagerUser } from "../activity-data";
import { ActivityRequestCard } from "./ActivityRequestCard";

export function ActivityRequestList({
  requests,
  allRequests,
  managersById,
  onChangeRequests,
  onTabChange,
}: {
  requests: ActivityRequest[];
  allRequests: ActivityRequest[];
  managersById: Map<string, ManagerUser>;
  onChangeRequests: (next: ActivityRequest[]) => void;
  onTabChange: (tab: "all" | "pending" | "approved" | "declined") => void;
}) {
  return (
    <section className="space-y-3">
      {requests.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No requests in this view.
        </div>
      ) : (
        requests.map((r) => (
          <ActivityRequestCard
            key={r.id}
            request={r}
            allRequests={allRequests}
            managersById={managersById}
            onChangeRequests={onChangeRequests}
            onTabChange={onTabChange}
          />
        ))
      )}
    </section>
  );
}

