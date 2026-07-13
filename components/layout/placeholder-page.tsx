import { ArrowUpRight, CheckCircle2, Construction, ShieldCheck } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  area: string;
};

export function PlaceholderPage({ title, description, area }: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {area}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--dv-shadow)]">
          <Construction className="size-3.5 text-primary" />
          Phase 1 foundation
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border bg-card p-5 shadow-[var(--dv-shadow)]">
          <div className="mb-8 grid size-10 place-items-center rounded-lg bg-[var(--dv-badge-ok-bg)] text-[var(--dv-badge-ok-text)]">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-sm font-semibold">Route ready</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The App Router page and shared platform layout are in place.
          </p>
        </article>

        <article className="rounded-xl border bg-card p-5 shadow-[var(--dv-shadow)]">
          <div className="mb-8 grid size-10 place-items-center rounded-lg bg-[var(--dv-badge-in-bg)] text-[var(--dv-badge-in-text)]">
            <ShieldCheck className="size-5" />
          </div>
          <p className="text-sm font-semibold">Design system active</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            DIVU semantic colors, typography, surfaces, and dark theme are available.
          </p>
        </article>

        <article className="rounded-xl border border-dashed bg-muted/40 p-5">
          <div className="mb-8 grid size-10 place-items-center rounded-lg bg-background text-muted-foreground">
            <ArrowUpRight className="size-5" />
          </div>
          <p className="text-sm font-semibold">Feature migration pending</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Production components and data integrations will be added in a later phase.
          </p>
        </article>
      </div>
    </section>
  );
}
