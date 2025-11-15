"use client";

import React from "react";
import { SummaryCards } from "@/components/simulator/summary-cards";
import { OrphanedDocs } from "@/components/simulator/orphaned-docs";
import { ImpactVisualization } from "@/components/simulator/impact-visualization";
import { HandoffPlan } from "@/components/simulator/handoff-plan";

// Lanyard placeholder component instead of loading the 3D version
function LanyardPlaceholder() {
  return (
    <div className="text-center p-8">
      <div className="w-32 h-40 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl shadow-lg flex items-center justify-center border-2 border-blue-300 dark:border-blue-700">
        <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      </div>
      <p className="text-sm font-light text-slate-600 dark:text-slate-300 font-serif">ID Badge</p>
      <p className="text-xs font-light text-slate-400 dark:text-slate-500 mt-1">Employee Credentials</p>
    </div>
  );
}

type Props = { personId: string };

export default function PersonDetail2({ personId }: Props) {
  const personMap: Record<string, { name: string; team?: string }> = {
    "1": { name: "Megan", team: "Payroll" },
    "2": { name: "Jason", team: "Payroll" },
    "3": { name: "Alice", team: "Backend" },
    "4": { name: "Tom", team: "Frontend" },
    "5": { name: "Sarah", team: "Accounting" },
    "6": { name: "David", team: "Platform" },
    "megan": { name: "Megan", team: "Payroll Lead" },
    "jason": { name: "Jason", team: "Payroll Specialist" },
    "jane": { name: "Jane", team: "Senior Manager" },
    "tim": { name: "Tim", team: "Staff Engineer" },
    "blake": { name: "Blake", team: "Engineering Manager" },
    "lily": { name: "Lily", team: "Software Engineer" },
    "james": { name: "James", team: "Software Engineer" },
    "tom": { name: "Tom", team: "Frontend Lead" },
    "uma": { name: "Uma", team: "Frontend Engineer" },
    "sarah": { name: "Sarah", team: "Accounting Manager" },
    "david": { name: "David", team: "Platform Lead" },
  };

  const person = personMap[personId] || { name: personId.charAt(0).toUpperCase() + personId.slice(1), team: "Team Member" };

  const mockResults = {
    orphanedDocs: [
      { id: "1", title: "Payroll Onboarding Runbook", owner: person.name, lastUpdated: "2023-10-15", critical: true },
      { id: "2", title: "Vendor Payment Processing Guide", owner: person.name, lastUpdated: "2024-05-01", critical: false },
    ],
    degradedTopics: [
      { id: "1", name: "Payroll Onboarding", busFactor: 0, status: "critical" as const, previousBusFactor: 2, previousStatus: "healthy" as const },
      { id: "2", name: "Tax Compliance Procedures", busFactor: 1, status: "warning" as const, previousBusFactor: 3, previousStatus: "healthy" as const },
      { id: "3", name: "Benefits Administration", busFactor: 0, status: "critical" as const, previousBusFactor: 2, previousStatus: "warning" as const },
      { id: "4", name: "Vendor Management", busFactor: 1, status: "warning" as const, previousBusFactor: 2, previousStatus: "healthy" as const },
      { id: "5", name: "Payment Processing", busFactor: 0, status: "critical" as const, previousBusFactor: 1, previousStatus: "warning" as const },
    ],
    undocumentedSystems: [
      { name: "Vendor Payout Engine", mentioned: true, documented: false },
    ],
    handoffPlan: [
      { person: "Jason", documents: ["Payroll Onboarding Runbook"], systems: ["Vendor Payout Engine"] },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 p-8">
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="col-span-1">
          <div className="h-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-900/50 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/30 flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-light text-blue-900 dark:text-blue-100">{person.name}</h2>
              <div className="text-sm font-light text-slate-500 dark:text-slate-400 mt-1">{person.team}</div>
            </div>

            <div className="flex-1 flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100/50 to-blue-50/30 dark:from-dark-700/50 dark:to-blue-950/30" style={{ minHeight: '400px' }}>
              <LanyardPlaceholder />
            </div>

            <div className="mt-8 pt-6 border-t border-blue-100 dark:border-blue-900/50">
              <div className="text-xs font-light text-slate-400 dark:text-slate-500 tracking-wide">ID: {personId}</div>
            </div>
          </div>
        </aside>

        <main className="col-span-1 md:col-span-3">
          <div className="space-y-8">
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 dark:border-blue-900/50 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20">
              <SummaryCards criticalDocuments={3} totalDocuments={8} impactedTopics={5} totalTopics={23} undocumentedSystems={2} totalSystems={7} />
            </div>

            <OrphanedDocs documents={mockResults.orphanedDocs} />

            <ImpactVisualization topics={mockResults.degradedTopics} />

            <HandoffPlan assignments={mockResults.handoffPlan} undocumentedSystems={mockResults.undocumentedSystems.filter(s => !s.documented).map(s => s.name)} />
          </div>
        </main>
      </div>
    </div>
  );
}
