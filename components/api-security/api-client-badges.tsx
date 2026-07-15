import { cn } from "@/lib/utils";
import type { ClientRisk, ClientStatus, Environment } from "./api-security-data";

const riskStyles: Record<ClientRisk, string> = { Low: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", Medium: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300", High: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300", Critical: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400" };
const statusStyles: Record<ClientStatus, string> = { Active: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400", "Expiring Soon": "bg-amber-500/12 text-amber-700 dark:text-amber-300", Disabled: "bg-slate-500/12 text-slate-600 dark:text-slate-300", Revoked: "bg-red-500/12 text-red-700 dark:text-red-400" };
export function ApiClientRiskBadge({ risk }: { risk: ClientRisk }) { return <span className={cn("inline-flex rounded-full border px-2 py-1 font-mono text-[9px] font-semibold", riskStyles[risk])}>● {risk}</span>; }
export function ApiClientStatusBadge({ status }: { status: ClientStatus }) { return <span className={cn("inline-flex rounded-full px-2 py-1 text-[9px] font-semibold", statusStyles[status])}>◉ {status}</span>; }
export function EnvironmentBadge({ environment }: { environment: Environment }) { const style = environment === "Production" ? "bg-red-500/10 text-red-600" : environment === "Staging" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"; return <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-semibold", style)}>{environment}</span>; }

