"use client";

import React from "react";
import { PersonSelector } from "@/components/simulator/person-selector";
import { SummaryCards } from "@/components/simulator/summary-cards";
import { ImpactVisualization } from "@/components/simulator/impact-visualization";
import { OrphanedDocs } from "@/components/simulator/orphaned-docs";
import { UndocumentedSystems } from "@/components/simulator/undocumented-systems";
import { HandoffPlan } from "@/components/simulator/handoff-plan";

export type Person = {
  id: string;
  name: string;
  teamId: string;
};

export type Team = {
  id: string;
  name: string;
  departmentId: string;
};

export type Department = {
  id: string;
  name: string;
};

export type Topic = {
  id: string;
  name: string;
  busFactor: number;
  previousBusFactor?: number;
  status: "healthy" | "warning" | "critical";
  previousStatus?: "healthy" | "warning" | "critical";
};

export type Document = {
  id: string;
  title: string;
  owner: string;
  lastUpdated: string;
  critical: boolean;
};

export type System = {
  name: string;
  mentioned: boolean;
  documented: boolean;
};

export type HandoffAssignment = {
  person: string;
  documents: string[];
  systems: string[];
};

export function ContinuitySimulator() {
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationResults, setSimulationResults] = React.useState<{
    degradedTopics: Topic[];
    orphanedDocs: Document[];
    undocumentedSystems: System[];
    handoffPlan: HandoffAssignment[];
  } | null>(null);

  // Mock data - replace with actual API calls later
  const departments: Department[] = [
    { id: "1", name: "Engineering" },
    { id: "2", name: "Finance" },
    { id: "3", name: "Operations" },
  ];

  const teams: Team[] = [
    { id: "1", name: "Backend Team", departmentId: "1" },
    { id: "2", name: "Frontend Team", departmentId: "1" },
    { id: "3", name: "Payroll Team", departmentId: "2" },
    { id: "4", name: "Accounting Team", departmentId: "2" },
    { id: "5", name: "Platform Team", departmentId: "3" },
  ];

  const people: Person[] = [
    { id: "1", name: "Megan", teamId: "3" },
    { id: "2", name: "Jason", teamId: "3" },
    { id: "3", name: "Alice", teamId: "1" },
    { id: "4", name: "Tom", teamId: "2" },
    { id: "5", name: "Sarah", teamId: "4" },
    { id: "6", name: "David", teamId: "5" },
  ];

  const filteredTeams = selectedDepartment
    ? teams.filter(t => t.departmentId === selectedDepartment.id)
    : [];

  const filteredPeople = selectedTeam
    ? people.filter(p => p.teamId === selectedTeam.id)
    : [];

  const handleSimulate = async () => {
    if (!selectedPerson) return;

    setIsSimulating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock simulation results
    const mockResults = {
      degradedTopics: [
        {
          id: "1",
          name: "Payroll Onboarding",
          busFactor: 0,
          previousBusFactor: 1,
          status: "critical" as const,
          previousStatus: "warning" as const,
        },
        {
          id: "2",
          name: "Vendor Payments",
          busFactor: 1,
          previousBusFactor: 2,
          status: "warning" as const,
          previousStatus: "healthy" as const,
        },
      ],
      orphanedDocs: [
        {
          id: "1",
          title: "Payroll Onboarding Runbook",
          owner: selectedPerson.name,
          lastUpdated: "2023-10-15",
          critical: true,
        },
        {
          id: "2",
          title: "Vendor Payment Processing Guide",
          owner: selectedPerson.name,
          lastUpdated: "2024-05-01",
          critical: true,
        },
      ],
      undocumentedSystems: [
        { name: "Vendor Payout Engine", mentioned: true, documented: false },
        { name: "ACH Gateway", mentioned: true, documented: false },
        { name: "Sandbox Seeder", mentioned: true, documented: false },
      ],
      handoffPlan: [
        {
          person: "Jason",
          documents: ["Payroll Onboarding Runbook", "Vendor Payout Engine"],
          systems: ["Vendor Payout Engine", "ACH Gateway"],
        },
        {
          person: "Alice",
          documents: ["Vendor Payment Processing Guide"],
          systems: ["Sandbox Seeder"],
        },
      ],
    };

    setSimulationResults(mockResults);
    setIsSimulating(false);
  };

  const handleReset = () => {
    setSelectedDepartment(null);
    setSelectedTeam(null);
    setSelectedPerson(null);
    setSimulationResults(null);
  };

  const handleDepartmentChange = (dept: Department) => {
    setSelectedDepartment(dept);
    setSelectedTeam(null);
    setSelectedPerson(null);
  };

  const handleTeamChange = (team: Team) => {
    setSelectedTeam(team);
    setSelectedPerson(null);
  };

  return (
    <div className="flex flex-col min-w-0 h-[calc(100dvh-52px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Main Content - No Separate Header */}
        <div className="flex-1 px-12 py-12">
          <div className="w-full max-w-7xl mx-auto">
            {/* Title in Content Area */}
            <div className="mb-12">
              <h1 className="text-5xl font-serif font-light text-blue-900">Continuity Simulator</h1>
              <p className="text-lg font-light text-slate-600 mt-3">
                Hand off plan in case of team member absence or leave
              </p>
            </div>
          {/* Hierarchical Selection */}
          <PersonSelector
            departments={departments}
            teams={filteredTeams}
            people={filteredPeople}
            selectedDepartment={selectedDepartment}
            selectedTeam={selectedTeam}
            selectedPerson={selectedPerson}
            onSelectDepartment={handleDepartmentChange}
            onSelectTeam={handleTeamChange}
            onSelectPerson={setSelectedPerson}
            onSimulate={handleSimulate}
            onReset={handleReset}
            isSimulating={isSimulating}
            hasResults={!!simulationResults}
          />

          {/* Results Section - Resilience Radar Style Layout */}
          {simulationResults && (
            <div className="mt-12 space-y-8">
              {/* Summary Cards - 3 Columns */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30">
                <SummaryCards
                  criticalDocuments={simulationResults.orphanedDocs.length}
                  totalDocuments={2}
                  impactedTopics={simulationResults.degradedTopics.length}
                  totalTopics={2}
                  undocumentedSystems={simulationResults.undocumentedSystems.filter(s => !s.documented).length}
                  totalSystems={3}
                />
              </div>

              {/* Stacked Sections */}
              <div className="space-y-8">
                {/* Documents at Risk */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30">
                  <OrphanedDocs documents={simulationResults.orphanedDocs} />
                </div>

                {/* Topics Impacted */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30">
                  <ImpactVisualization topics={simulationResults.degradedTopics} />
                </div>
              </div>

              {/* Full Width Sections Below */}
              <div className="space-y-8">
                {/* Undocumented Systems - Full Width */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30">
                  <UndocumentedSystems
                    systems={simulationResults.undocumentedSystems}
                  />
                </div>

                {/* Handoff Plan - Full Width */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30">
                  <HandoffPlan
                    assignments={simulationResults.handoffPlan}
                    undocumentedSystems={simulationResults.undocumentedSystems.filter(s => !s.documented).map(s => s.name)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!simulationResults && !isSimulating && (
            <div className="mt-24 text-center">
              <p className="text-lg font-light text-slate-500">
                Select a person and click "Run Simulation" to see the impact on
                organizational knowledge
              </p>
            </div>
          )}

          {/* Loading State */}
          {isSimulating && (
            <div className="mt-24 text-center">
              <div className="inline-block animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
              <p className="mt-6 font-light text-slate-600 text-lg">
                Simulating {selectedPerson?.name}'s departure...
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
