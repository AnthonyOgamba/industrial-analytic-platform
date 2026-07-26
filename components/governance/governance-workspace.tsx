"use client";

import { useState } from "react";
import { AlertTriangle, Clock3, FileCheck2, ShieldCheck, Tags, UserRoundCog } from "lucide-react";

import { governanceSections, type GovernanceSection } from "./governance-data";
import { PoliciesStandards } from "./policies-standards";

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
      <header>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Governance Command Center</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight">Data Governance</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Facility-scoped policy registry, retention rules, classification, and retirement controls.</p>
      </header>

      <div className="overflow-x-auto border-b">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Data governance sections">
          {governanceSections.map((section) => {
            const Icon = sectionIcons[section.key];
            const active = activeSection === section.key;
            return <button key={section.key} type="button" role="tab" aria-selected={active} onClick={() => setActiveSection(section.key)} className={`relative inline-flex h-12 items-center gap-2 px-3 text-xs font-medium transition-colors sm:px-4 ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Icon className={`size-4 ${active ? "text-primary" : ""}`} /><span className="hidden sm:inline">{section.label}</span><span className="sm:hidden">{section.shortLabel}</span>{active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />}</button>;
          })}
        </div>
      </div>

      <div role="tabpanel">
        {activeSection === "policies" ? <PoliciesStandards /> : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
            <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-3 font-semibold">This governance domain is not available</h2>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-muted-foreground">The confirmed backend currently exposes the governance policy registry only. No API contract is available for this section, so sample records and controls are not displayed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
