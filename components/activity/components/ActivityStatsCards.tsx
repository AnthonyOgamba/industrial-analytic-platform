import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import { SummaryMetricCard } from "@/components/ui/summary-metric-card";
import type { ActivityRequest } from "../activity-data";

export function ActivityStatsCards({ requests }: { requests: ActivityRequest[] }) {
  const cards = [
    { label: "Pending Requests", value: requests.filter((request) => request.status === "pending").length, note: "Awaiting administrative review", icon: Clock3 },
    { label: "Approved Requests", value: requests.filter((request) => request.status === "approved").length, note: "Authorized decisions", icon: CheckCircle2 },
    { label: "Declined Requests", value: requests.filter((request) => request.status === "declined").length, note: "Requests not authorized", icon: XCircle },
  ];
  return <section className="grid gap-3 sm:grid-cols-3">{cards.map((card) => <SummaryMetricCard key={card.label} {...card} />)}</section>;
}
