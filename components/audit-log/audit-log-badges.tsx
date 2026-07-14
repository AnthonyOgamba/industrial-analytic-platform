import { AlertTriangle, Ban, CheckCircle2, CircleX } from "lucide-react";
import type { AuditStatus } from "./audit-log-data";

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const styles = { Success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400", Warning: "bg-amber-500/12 text-amber-700 dark:text-amber-300", Failed: "bg-red-500/12 text-red-600 dark:text-red-400", Blocked: "bg-slate-500/12 text-slate-600 dark:text-slate-300" };
  const Icon = status === "Success" ? CheckCircle2 : status === "Warning" ? AlertTriangle : status === "Failed" ? CircleX : Ban;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${styles[status]}`}><Icon className="size-3" />{status}</span>;
}

export function AuditActionBadge({ action }: { action: string }) { return <span className="font-mono text-[10px] font-semibold text-foreground">{action}</span>; }

const colors: Record<string, string> = { Authentication: "text-blue-600 bg-blue-500/10", Activity: "text-amber-600 bg-amber-500/10", Sensor: "text-teal-600 bg-teal-500/10", Role: "text-violet-600 bg-violet-500/10", Settings: "text-slate-600 bg-slate-500/10", Report: "text-indigo-600 bg-indigo-500/10", Financial: "text-emerald-600 bg-emerald-500/10", Asset: "text-fuchsia-600 bg-fuchsia-500/10", Dashboard: "text-cyan-600 bg-cyan-500/10", Site: "text-orange-600 bg-orange-500/10", User: "text-pink-600 bg-pink-500/10" };
export function AuditResourceBadge({ resource }: { resource: string }) { return <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold ${colors[resource] ?? colors.Settings}`}>{resource}</span>; }

