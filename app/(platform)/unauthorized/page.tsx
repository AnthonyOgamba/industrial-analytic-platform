import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center shadow-[var(--dv-shadow)]">
      <ShieldX className="mx-auto size-10 text-destructive" aria-hidden="true" />
      <h1 className="mt-4 text-xl font-bold">Access denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You do not have permission to access this page.
      </p>
      <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg border px-4 text-xs font-semibold">
        Return to dashboard
      </Link>
    </section>
  );
}
