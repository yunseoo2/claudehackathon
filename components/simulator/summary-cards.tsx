"use client";

import React from "react";

type SummaryCardsProps = {
  criticalDocuments: number;
  totalDocuments: number;
  impactedTopics: number;
  totalTopics: number;
  undocumentedSystems: number;
  totalSystems: number;
};

export function SummaryCards({
  criticalDocuments,
  totalDocuments,
  impactedTopics,
  totalTopics,
  undocumentedSystems,
  totalSystems,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Critical Documents Card */}
      <div className="bg-white border border-red-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-base font-medium text-gray-700 mb-4">
          Documents at Critical Risk
        </div>
        <div className="text-6xl font-semibold text-gray-900">
          {criticalDocuments}
          <span className="text-3xl text-gray-400"> / {totalDocuments}</span>
        </div>
      </div>

      {/* Impacted Topics Card */}
      <div className="bg-white border border-yellow-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-base font-medium text-gray-700 mb-4">
          Topics Impacted
        </div>
        <div className="text-6xl font-semibold text-gray-900">
          {impactedTopics}
          <span className="text-3xl text-gray-400"> / {totalTopics}</span>
        </div>
      </div>

      {/* Undocumented Systems Card */}
      <div className="bg-white border border-yellow-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-base font-medium text-gray-700 mb-4">
          Undocumented Systems Found
        </div>
        <div className="text-6xl font-semibold text-gray-900">
          {undocumentedSystems}
          <span className="text-3xl text-gray-400"> / {totalSystems}</span>
        </div>
      </div>
    </div>
  );
}
