import { cn } from "@/lib/utils";
import type { ApiAuditResult, ApiAuditSeverity } from "./api-audit-log-data";

const severityClass: Record<ApiAuditSeverity, string> = {
  Info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  High: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Critical: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function ApiAuditLogSeverityBadge({ severity }: { severity: ApiAuditSeverity }) {
  return <span className={cn("inline-flex rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase", severityClass[severity])}>{severity}</span>;
}

export function ApiAuditLogActionBadge({ result }: { result: ApiAuditResult }) {
  const style = result === "Success" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : result === "Blocked" ? "bg-red-500/10 text-red-700 dark:text-red-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return <span className={cn("inline-flex rounded-full px-2 py-1 text-[10px] font-semibold", style)}>{result}</span>;
}
