"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock3,
  FileCheck2,
  UserRoundCog,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { AlertsCenter } from "./alerts-center";
import { ClassificationRegistry } from "./classification-registry";
import { ComplianceControls } from "./compliance-controls";
import { governanceSections, type GovernanceSection } from "./governance-data";
import { GovernanceSummary } from "./governance-summary";
import { DataOwnership } from "./data-ownership";
import { PoliciesStandards } from "./policies-standards";
import { RetentionPolicies } from "./retention-policies";

const sectionIcons: Record<GovernanceSection, React.ElementType> = {
  classification: Tags,
  policies: FileCheck2,
  retention: Clock3,
  ownership: UserRoundCog,
  compliance: ShieldCheck,
  alerts: AlertTriangle,
};

export function GovernanceWorkspace() {
  const [activeSection, setActiveSection] = useState<GovernanceSection>("policies");

  return (
    <div className="space-y-5 pb-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Governance Command Center</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Data Governance</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Managed by <span className="font-medium text-foreground">Admin User</span> · Policies, classification, retention, ownership, compliance, and governance alerts.</p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--dv-badge-cr-text)]/35 bg-[var(--dv-badge-cr-bg)] px-4 py-3 text-[var(--dv-badge-cr-text)] sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><div><p className="text-[13px] font-semibold">2 critical governance issues require immediate attention.</p><p className="mt-0.5 text-[11px] opacity-80">Retention and PII controls are outside approved thresholds.</p></div></div>
        <button type="button" onClick={() => setActiveSection("alerts")} className="whitespace-nowrap text-left font-mono text-[10px] font-semibold uppercase tracking-[0.06em] hover:underline">View alerts →</button>
      </div>

      <GovernanceSummary onSelect={setActiveSection} />

      <div className="overflow-x-auto border-b">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Data governance sections">
          {governanceSections.map((section) => {
            const Icon = sectionIcons[section.key];
            const active = activeSection === section.key;
            return (
              <button
                key={section.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSection(section.key)}
                className={`relative inline-flex h-12 items-center gap-2 px-3 text-xs font-medium transition-colors sm:px-4 ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                <span className="hidden sm:inline">{section.label}</span>
                <span className="sm:hidden">{section.shortLabel}</span>
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel">
        {activeSection === "policies" && <PoliciesStandards />}
        {activeSection === "classification" && <ClassificationRegistry />}
        {activeSection === "retention" && <RetentionPolicies />}
        {activeSection === "ownership" && <DataOwnership />}
        {activeSection === "compliance" && <ComplianceControls />}
        {activeSection === "alerts" && <AlertsCenter />}
      </div>
    </div>
  );
}
