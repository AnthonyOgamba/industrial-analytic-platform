import type { ActivityRequestStatus } from "../activity-data";
import { cn } from "@/lib/utils";

export function ActivityTabs({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: "all" | ActivityRequestStatus;
  onTabChange: (tab: "all" | ActivityRequestStatus) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    declined: number;
  };
}) {
  const tabs: { id: "all" | ActivityRequestStatus; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
    { id: "declined", label: "Declined", count: counts.declined },
  ];

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-xl border bg-card p-2"
      aria-label="Activity tabs"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTabChange(t.id)}
          className={cn(
            "h-9 rounded-lg px-3 text-[12px] font-medium transition-colors",
            activeTab === t.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
          aria-current={activeTab === t.id ? "page" : undefined}
        >
          <span className="flex items-center gap-2">
            {t.label}
            <span
              aria-label={`${t.label} count`}
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                activeTab === t.id
                  ? "bg-primary/15 text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              {t.count}
            </span>
          </span>
        </button>
      ))}
    </nav>
  );
}


