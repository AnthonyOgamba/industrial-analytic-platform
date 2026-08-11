import { RefreshCw } from "lucide-react";

export default function PlatformRouteLoading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading page">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2"><div className="h-7 w-48 animate-pulse rounded bg-muted" /><div className="h-4 w-80 max-w-[65vw] animate-pulse rounded bg-muted" /></div>
        <span className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs text-muted-foreground"><RefreshCw className="size-4 animate-spin" />Loading</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
