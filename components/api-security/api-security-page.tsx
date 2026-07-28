import { KeyRound } from "lucide-react";

export function ApiSecurityPage(){
  return <div className="space-y-5 pb-6"><header><h1 className="text-2xl font-bold tracking-tight">API Security Management</h1><p className="mt-1 text-xs text-muted-foreground">API clients, tokens, scopes and access control</p></header><section className="rounded-xl border border-dashed bg-muted/20 p-12 text-center"><KeyRound className="mx-auto size-9 text-muted-foreground"/><h2 className="mt-4 font-semibold">API-client management is unavailable</h2><p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">The platform currently has no API-client, token, scope, expiry, or usage model. Sample credentials and traffic totals have been removed. Connect the required platform service before enabling this workspace.</p></section></div>
}
