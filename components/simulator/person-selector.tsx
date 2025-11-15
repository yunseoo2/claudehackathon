"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { Department, Team, Person } from "@/components/continuity-simulator";

type PersonSelectorProps = {
  departments: Department[];
  teams: Team[];
  people: Person[];
  selectedDepartment: Department | null;
  selectedTeam: Team | null;
  selectedPerson: Person | null;
  onSelectDepartment: (dept: Department) => void;
  onSelectTeam: (team: Team) => void;
  onSelectPerson: (person: Person) => void;
  onSimulate: () => void;
  onReset: () => void;
  isSimulating: boolean;
  hasResults: boolean;
};

export function PersonSelector({
  departments,
  teams,
  people,
  selectedDepartment,
  selectedTeam,
  selectedPerson,
  onSelectDepartment,
  onSelectTeam,
  onSelectPerson,
  onSimulate,
  onReset,
  isSimulating,
  hasResults,
}: PersonSelectorProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-3xl p-8 shadow-lg shadow-blue-100/30">
      <h2 className="text-2xl font-serif font-light mb-8 text-blue-900">Select team member leaving</h2>

      {/* Hierarchical Dropdowns + Button */}
      <div className="flex gap-4 items-end">
        {/* Department Dropdown */}
        <div className="flex-1">
          <label className="block text-sm font-light text-slate-600 mb-2 tracking-wide">
            Department
          </label>
          <select
            value={selectedDepartment?.id || ""}
            onChange={(e) => {
              const dept = departments.find(d => d.id === e.target.value);
              if (dept) onSelectDepartment(dept);
            }}
            disabled={isSimulating}
            className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-white font-light text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:opacity-50 disabled:bg-slate-50 appearance-none transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233b82f6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '12px',
            }}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Team Dropdown */}
        <div className="flex-1">
          <label className="block text-sm font-light text-slate-600 mb-2 tracking-wide">
            Team
          </label>
          <select
            value={selectedTeam?.id || ""}
            onChange={(e) => {
              const team = teams.find(t => t.id === e.target.value);
              if (team) onSelectTeam(team);
            }}
            disabled={!selectedDepartment || isSimulating}
            className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-white font-light text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:opacity-50 disabled:bg-slate-50 appearance-none transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233b82f6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '12px',
            }}
          >
            <option value="">Select team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Person Dropdown */}
        <div className="flex-1">
          <label className="block text-sm font-light text-slate-600 mb-2 tracking-wide">
            Member
          </label>
          <select
            value={selectedPerson?.id || ""}
            onChange={(e) => {
              const person = people.find(p => p.id === e.target.value);
              if (person) onSelectPerson(person);
            }}
            disabled={!selectedTeam || isSimulating}
            className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-white font-light text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:opacity-50 disabled:bg-slate-50 appearance-none transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233b82f6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '12px',
            }}
          >
            <option value="">Select member</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        {/* Simulate Button */}
        <Button
          onClick={onSimulate}
          disabled={!selectedPerson || isSimulating}
          className="px-8"
        >
          {isSimulating ? "Simulating..." : "Simulate"}
        </Button>

        {hasResults && (
          <Button
            onClick={onReset}
            variant="outline"
            disabled={isSimulating}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
