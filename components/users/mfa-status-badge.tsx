import { ShieldOff, Smartphone } from "lucide-react";
import type { MfaStatus } from "./users-data";
const config = { Enforced: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300", Enabled: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300", Disabled: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300" };
export function MfaStatusBadge({ status }: { status: MfaStatus }) { const Icon = status === "Disabled" ? ShieldOff : Smartphone; return <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${config[status]}`}><Icon className="size-3" />{status}</span>; }
