"use client";

import { useMemo, useState } from "react";
import type {
  ActivityRequest,
  ActivityRequestStatus,
  ManagerUser,
} from "./activity-data";
import { mockActivityRequests, activityManagers } from "./activity-data";
import { ActivityStatsCards } from "./components/ActivityStatsCards";
import { ActivityTabs } from "./components/ActivityTabs";
import { ActivityRequestList } from "./components/ActivityRequestList";

export default function ActivityPage() {
  const [requests, setRequests] = useState<ActivityRequest[]>(mockActivityRequests);

  const [activeTab, setActiveTab] = useState<"all" | ActivityRequestStatus>("all");

  const managersById = useMemo(() => {
    const map = new Map<string, ManagerUser>();
    for (const m of activityManagers) map.set(m.id, m);
    return map;
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const tabCounts = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const declined = requests.filter((r) => r.status === "declined").length;
    return {
      all: requests.length,
      pending,
      approved,
      declined,
    };
  }, [requests]);

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Activity Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor user actions and approve or decline requests.
        </p>
      </header>

      <ActivityStatsCards requests={requests} />

      <ActivityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
      />

      <ActivityRequestList
        requests={filtered}
        allRequests={requests}
        managersById={managersById}
        onChangeRequests={setRequests}
        onTabChange={setActiveTab}
      />
    </div>
  );
}



