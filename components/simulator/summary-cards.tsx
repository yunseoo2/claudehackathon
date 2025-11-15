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
      <div className="bg-white dark:bg-dark-700/50 border border-red-200 dark:border-red-900/50 rounded-2xl p-10 shadow-sm hover:shadow-md dark:hover:shadow-red-900/20 transition-shadow">
        <div className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
          Documents at Critical Risk
        </div>
        <div className="text-6xl font-semibold text-gray-900 dark:text-white">
          {criticalDocuments}
          <span className="text-3xl text-gray-400 dark:text-gray-500"> / {totalDocuments}</span>
        </div>
      </div>

      {/* Impacted Topics Card */}
      <div className="bg-white dark:bg-dark-700/50 border border-yellow-200 dark:border-yellow-900/50 rounded-2xl p-10 shadow-sm hover:shadow-md dark:hover:shadow-yellow-900/20 transition-shadow">
        <div className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
          Topics Impacted
        </div>
        <div className="text-6xl font-semibold text-gray-900 dark:text-white">
          {impactedTopics}
          <span className="text-3xl text-gray-400 dark:text-gray-500"> / {totalTopics}</span>
        </div>
      </div>

      {/* Undocumented Systems Card */}
      <div className="bg-white dark:bg-dark-700/50 border border-yellow-200 dark:border-yellow-900/50 rounded-2xl p-10 shadow-sm hover:shadow-md dark:hover:shadow-yellow-900/20 transition-shadow">
        <div className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
          Undocumented Systems
        </div>
        <div className="text-6xl font-semibold text-gray-900 dark:text-white">
          {undocumentedSystems}
          <span className="text-3xl text-gray-400 dark:text-gray-500"> / {totalSystems}</span>
        </div>
      </div>
    </div>
  );
}
