import { Clock3, FileText } from "lucide-react";

import { datasets } from "./governance-data";
import { governancePolicies } from "./policy-data";
import { GovernanceCard } from "./governance-card";
import { ClassificationBadge, StatusBadge } from "./status-badge";

export function RetentionPolicies() {
  return (
    <div className="space-y-3">
      {governancePolicies.map((policy) => {
        const linked = datasets.filter((dataset) => dataset.policy === policy.name);

        return (
          <GovernanceCard key={policy.id}>
            <div className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                  <Clock3 className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{policy.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{policy.appliesTo} · Owner: {policy.owner}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={policy.status} />
              </div>
            </div>

            <div className="grid border-y bg-muted/20 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Retention period", policy.retentionPeriod],
                ["Archive rule", policy.archiveRule],
                ["Deletion rule", policy.deletionRule],
                ["Review cycle", policy.reviewFrequency],
              ].map(([label, value]) => (
                <div key={label} className="border-b px-5 py-4 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:not-last:border-r">
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
                  <p className="mt-1.5 text-xs font-medium leading-5">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex min-h-11 flex-wrap items-center gap-2 px-5 py-2.5">
              <span className="font-mono text-[10px] text-muted-foreground">Linked:</span>
              {linked.length > 0 ? linked.map((dataset) => (
                <span key={dataset.id} className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-[10px]">
                  <FileText className="size-3 text-primary" />
                  {dataset.name}
                  <ClassificationBadge level={dataset.classification} />
                </span>
              )) : <span className="text-[11px] text-muted-foreground">No datasets assigned</span>}
            </div>
          </GovernanceCard>
        );
      })}
    </div>
  );
}
