import { Ban, FileKey2, ListChecks, Network, ShieldAlert, UserCog } from "lucide-react";
import type { ApiAuditEvent } from "./api-audit-log-data";

export function ApiAuditLogStats({ events }: { events: ApiAuditEvent[] }) {
  const cards = [
    ["Total API Events", events.length, ListChecks],
    ["Token Events", events.filter((e) => /Token|Secret/.test(e.type)).length, FileKey2],
    ["Client Changes", events.filter((e) => e.type.startsWith("Client")).length, UserCog],
    ["Security Events", events.filter((e) => e.securityEventId).length, ShieldAlert],
    ["IP Whitelist Changes", events.filter((e) => e.type.includes("Whitelist")).length, Network],
    ["Failed / Unauthorized", events.filter((e) => e.result !== "Success").length, Ban],
  ] as const;
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-xl border bg-card p-4 shadow-[var(--dv-shadow)]"><Icon className="size-4 text-primary" /><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></div>)}</section>;
}
