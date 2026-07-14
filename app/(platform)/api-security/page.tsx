import Link from "next/link";
import { ClipboardList, ShieldCheck } from "lucide-react";

export default function ApiSecurityPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">Security Center</p><h1 className="mt-2 text-2xl font-bold tracking-tight">API Security Management</h1><p className="mt-1 text-sm text-muted-foreground">Manage API inventory, access policies, credentials, and security observations.</p></div>
        <Link href="/api-security/logs" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-card px-4 text-xs font-semibold shadow-[var(--dv-shadow)] hover:bg-muted"><ClipboardList className="size-4" />Audit Log</Link>
      </header>
      <section className="rounded-xl border bg-card p-8 text-center shadow-[var(--dv-shadow)]"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></span><h2 className="mt-4 text-lg font-bold">API security workspace</h2><p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">API client management remains available at this route. Review token, client, scope, whitelist, and access history in the dedicated audit log.</p></section>
    </div>
  );
}
