"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { initialAssets } from "@/components/assets/assets-data";
import { initialFacilities } from "@/components/facilities/facilities-data";
import { ActiveEventsTable } from "./active-events-table";
import { DowntimeAnalytics } from "./downtime-analytics";
import {
  downtimeEvents,
  initialDowntimeFactors,
  type DowntimeCategory,
  type DowntimeFactor,
  type DowntimeSeverity,
} from "./downtime-data";
import { DowntimeFactorCards } from "./downtime-factor-cards";
import { DowntimeFactorModal } from "./downtime-factor-modal";
import { DowntimeFilters } from "./downtime-filters";
import { DowntimeTabs, type DowntimeTab } from "./downtime-tabs";

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; factor: DowntimeFactor }
  | null;

export function DowntimePage() {
  const [activeTab, setActiveTab] = useState<DowntimeTab>("factors");
  const [factors, setFactors] = useState(initialDowntimeFactors);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | DowntimeCategory>("All");
  const [severity, setSeverity] = useState<"All" | DowntimeSeverity>("All");
  const [modal, setModal] = useState<ModalState>(null);

  const filteredFactors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return factors.filter((factor) => {
      const matchesQuery =
        !normalizedQuery ||
        [factor.name, factor.code, factor.description, factor.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory = category === "All" || factor.category === category;
      const matchesSeverity = severity === "All" || factor.severity === severity;

      return matchesQuery && matchesCategory && matchesSeverity;
    });
  }, [category, factors, query, severity]);

  const activeEventCount = downtimeEvents.filter((event) =>
    ["Active", "Escalated", "Investigating"].includes(event.status),
  ).length;

  function saveFactor(nextFactor: DowntimeFactor) {
    setFactors((current) => {
      const exists = current.some((factor) => factor.id === nextFactor.id);
      return exists
        ? current.map((factor) => (factor.id === nextFactor.id ? nextFactor : factor))
        : [nextFactor, ...current];
    });
    setModal(null);
  }

  function deleteFactor(factor: DowntimeFactor) {
    if (window.confirm(`Delete ${factor.name}?`)) {
      setFactors((current) => current.filter((item) => item.id !== factor.id));
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
            Operations intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Downtime Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Downtime factors, live events, and analytics across all sites
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "add" })}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Factor
        </button>
      </header>

      <DowntimeTabs
        active={activeTab}
        factorCount={factors.length}
        activeEventCount={activeEventCount}
        onChange={setActiveTab}
      />

      {activeTab === "factors" && (
        <section className="space-y-4" aria-label="Downtime factors">
          <DowntimeFilters
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            severity={severity}
            onSeverityChange={setSeverity}
          />
          <DowntimeFactorCards
            factors={filteredFactors}
            onEdit={(factor) => setModal({ mode: "edit", factor })}
            onDelete={deleteFactor}
          />
        </section>
      )}

      {activeTab === "events" && <ActiveEventsTable events={downtimeEvents} />}
      {activeTab === "analytics" && <DowntimeAnalytics />}

      {modal && (
        <DowntimeFactorModal
          key={modal.mode === "edit" ? modal.factor.id : "new-factor"}
          factor={modal.mode === "edit" ? modal.factor : null}
          facilities={initialFacilities}
          assets={initialAssets}
          onClose={() => setModal(null)}
          onSave={saveFactor}
        />
      )}
    </div>
  );
}
