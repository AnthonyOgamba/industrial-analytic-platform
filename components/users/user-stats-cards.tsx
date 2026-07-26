import { MapPin, LockKeyhole, ShieldOff, UserCheck, UserPlus, Users } from "lucide-react";

import { SummaryMetricCard } from "../ui/summary-metric-card";
import type { PlatformUser } from "./users-data";

export function UserStatsCards({ users }: { users: PlatformUser[] }) {
  const cards = [
    { label: "Total Users", value: users.length, note: "Administrative identities", icon: Users },
    { label: "Active Users", value: users.filter((user) => user.status === "Active").length, note: "Enabled platform access", icon: UserCheck },
    { label: "Locked Users", value: users.filter((user) => user.status === "Locked").length, note: "Security review required", icon: LockKeyhole },
    { label: "Disabled Users", value: users.filter((user) => user.status === "Disabled").length, note: "Access currently removed", icon: ShieldOff },
    { label: "Pending Users", value: users.filter((user) => user.status === "Pending").length, note: "Invitation not completed", icon: UserPlus },
    { label: "Facility Scoped", value: users.filter((user) => user.sites.length > 0).length, note: "Site assignments", icon: MapPin },
  ];
  return <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{cards.map((card) => <SummaryMetricCard key={card.label} {...card} />)}</section>;
}
