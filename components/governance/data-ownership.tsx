import Link from "next/link";
import { Database, Users } from "lucide-react";

import { datasets } from "./governance-data";
import { GovernanceCard } from "./governance-card";
import { ClassificationBadge, StatusBadge } from "./status-badge";

export function DataOwnership() {
  return (
    <GovernanceCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-muted/40 font-mono text-[10px] uppercase tracking-[0.09em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Dataset</th>
              <th className="px-4 py-3 font-medium">Business owner</th>
              <th className="px-4 py-3 font-medium">Technical owner</th>
              <th className="px-4 py-3 font-medium">Steward</th>
              <th className="px-4 py-3 font-medium">Next review</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="hover:bg-muted/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"><Database className="size-4" /></span>
                    <div><p className="text-[13px] font-semibold">{dataset.name}</p><div className="mt-1 flex gap-1.5"><ClassificationBadge level={dataset.classification} /><StatusBadge status={dataset.status} /></div></div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs font-medium">{dataset.owner}</td>
                <td className="px-4 py-4 text-xs font-medium">{dataset.technicalOwner}</td>
                <td className="px-4 py-4 text-xs font-medium">{dataset.steward}</td>
                <td className="px-4 py-4 font-mono text-[11px] text-muted-foreground">{dataset.nextReview}</td>
                <td className="px-4 py-4 text-right"><Link href="/users" className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium hover:bg-muted"><Users className="size-3.5" />Administration</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GovernanceCard>
  );
}
