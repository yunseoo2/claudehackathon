"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { HandoffAssignment } from "@/components/continuity-simulator";

type HandoffPlanProps = {
  assignments: HandoffAssignment[];
  undocumentedSystems?: string[];
};

export function HandoffPlan({ assignments, undocumentedSystems = [] }: HandoffPlanProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateHandoffChecklist = () => {
    setIsGenerating(true);

    // Build checklist text
    let checklist = "# HANDOFF PLAN CHECKLIST\n\n";
    checklist += "Generated: " + new Date().toLocaleDateString() + "\n\n";

    checklist += "## SUCCESSOR ASSIGNMENTS\n\n";
    assignments.forEach((assignment, index) => {
      checklist += `### ${index + 1}. ${assignment.person}\n\n`;

      if (assignment.documents.length > 0) {
        checklist += "**Documents to take over:**\n";
        assignment.documents.forEach(doc => {
          checklist += `- [ ] ${doc}\n`;
        });
        checklist += "\n";
      }

      if (assignment.systems.length > 0) {
        checklist += "**Systems to learn:**\n";
        assignment.systems.forEach(sys => {
          checklist += `- [ ] ${sys}\n`;
        });
        checklist += "\n";
      }
    });

    if (undocumentedSystems.length > 0) {
      checklist += "## DOCUMENTATION TASKS\n\n";
      checklist += "**Create documentation for these systems:**\n";
      undocumentedSystems.forEach(sys => {
        checklist += `- [ ] Write documentation for ${sys}\n`;
      });
      checklist += "\n";
    }

    checklist += "## ACTION ITEMS\n\n";
    checklist += "- [ ] Schedule knowledge transfer sessions\n";
    checklist += "- [ ] Update document ownership records\n";
    checklist += "- [ ] Set up shadowing/pairing sessions\n";
    checklist += "- [ ] Review and validate documentation\n";

    // Download as text file
    const blob = new Blob([checklist], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'handoff-plan-checklist.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <div className="bg-white dark:bg-dark-700/30 border border-border dark:border-dark-600 rounded-xl p-8 shadow-sm">
      <h2 className="text-3xl font-light mb-3 text-gray-900 dark:text-white">
        Recommended Handoff Plan
      </h2>

      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        Suggested assignments to minimize knowledge loss
      </p>

      {/* Grid Layout for Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment, index) => (
          <div
            key={index}
            className="p-8 border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg hover:border-blue-300 dark:hover:border-blue-800 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-sm">
                {assignment.person.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign to {assignment.person}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {assignment.documents.length} document
                  {assignment.documents.length !== 1 ? "s" : ""} •{" "}
                  {assignment.systems.length} system
                  {assignment.systems.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Documents */}
            {assignment.documents.length > 0 && (
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Documents to take over:
                </h4>
                <ul className="space-y-2">
                  {assignment.documents.map((doc, docIndex) => (
                    <li
                      key={docIndex}
                      className="text-base pl-4 py-2.5 border-l-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-dark-700/50 rounded-r dark:text-gray-300"
                    >
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Systems */}
            {assignment.systems.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Systems to learn:
                </h4>
                <ul className="space-y-2">
                  {assignment.systems.map((system, sysIndex) => (
                    <li
                      key={sysIndex}
                      className="text-base pl-4 py-2.5 border-l-2 border-yellow-400 dark:border-yellow-600 bg-white dark:bg-dark-700/50 rounded-r dark:text-gray-300"
                    >
                      {system}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {assignments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No handoff assignments needed
          </p>
        )}
      </div>

      {/* Action Items Summary */}
      {assignments.length > 0 && (
        <>
          <div className="mt-6 p-6 bg-gray-50 dark:bg-dark-700/50 border border-gray-200 dark:border-dark-600 rounded-lg">
            <h4 className="font-semibold text-base mb-4 text-gray-900 dark:text-white">Action Items:</h4>
            <ul className="text-base space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Schedule knowledge transfer sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Create documentation for undocumented systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Update document ownership records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Set up shadowing/pairing sessions</span>
              </li>
            </ul>
          </div>

          {/* Generate Handoff Plan Button */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={generateHandoffChecklist}
              disabled={isGenerating}
              className="px-8"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Handoff Plan & Export Checklist"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
