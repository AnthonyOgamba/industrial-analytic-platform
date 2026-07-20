import {
  AlertTriangle,
  Database,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import type { GovernanceSection } from "./governance-data";
import { SummaryMetricCard } from "../ui/summary-metric-card";

const summaryItems: Array<{
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  target: GovernanceSection;
  tone?: "good" | "bad";
}> = [
  { label: "Total Datasets", value: "1,248", detail: "+4% this month", icon: Database, target: "classification", tone: "good" },
  { label: "Active Policies", value: "3", detail: "5 total", icon: ShieldCheck, target: "policies" },
  { label: "Compliance Score", value: "88%", detail: "2 controls failing", icon: UserRoundCheck, target: "compliance", tone: "good" },
  { label: "Open Alerts", value: "5", detail: "2 critical", icon: AlertTriangle, target: "alerts", tone: "bad" },
  { label: "Restricted Datasets", value: "7", detail: "Access controlled", icon: LockKeyhole, target: "classification" },
  { label: "PII Datasets", value: "1", detail: "Audit ready", icon: UserRoundCheck, target: "classification", tone: "good" },
];

export function GovernanceSummary({ onSelect }: { onSelect: (section: GovernanceSection) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {summaryItems.map((item) => {
        return (
          <SummaryMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.detail}
            icon={item.icon}
            onClick={() => onSelect(item.target)}
          />
        );
      })}
    </div>
  );
}
