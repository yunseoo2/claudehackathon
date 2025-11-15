"use client";

import React from "react";
import type { Topic } from "@/components/continuity-simulator";

type ImpactVisualizationProps = {
  topics: Topic[];
};

const statusColors = {
  healthy: "text-green-500",
  warning: "text-yellow-500",
  critical: "text-red-500",
};

export function ImpactVisualization({ topics }: ImpactVisualizationProps) {
  const calculateKnowledgeLoss = (previous: number, current: number) => {
    if (previous === 0) return 0;
    const lossPercent = Math.round(((previous - current) / previous) * 100);
    return lossPercent;
  };

  return (
    <div className="bg-white dark:bg-dark-700/30 border border-border dark:border-dark-600 rounded-xl p-8 shadow-sm">
      <h2 className="text-3xl font-light mb-3 text-gray-900 dark:text-white">
        Topics Impacted
      </h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        Knowledge areas that will degrade in health
      </p>

      {/* Grid Layout for Topic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topics.map((topic) => {
          const knowledgeLoss = topic.previousBusFactor !== undefined
            ? calculateKnowledgeLoss(topic.previousBusFactor, topic.busFactor)
            : 0;

          return (
            <div
              key={topic.id}
              className="p-8 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50/50 dark:bg-dark-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{topic.name}</h3>
                <div className={`font-medium text-sm px-3 py-1.5 rounded-full ${
                  topic.status === "critical" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                  topic.status === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                }`}>
                  {topic.status === "critical" && "Critical Risk"}
                  {topic.status === "warning" && "Moderate Risk"}
                  {topic.status === "healthy" && "Healthy"}
                </div>
              </div>

              <div className="space-y-3">
                {/* Bus Factor Change */}
                <div className="flex items-center gap-2 text-base">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Bus Factor:</span>
                  {topic.previousBusFactor !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold dark:text-white">{topic.previousBusFactor}</span>
                      <span className="text-gray-400 dark:text-gray-500">→</span>
                      <span className={`font-semibold ${statusColors[topic.status]}`}>
                        {topic.busFactor}
                      </span>
                    </div>
                  ) : (
                    <span className={`font-semibold ${statusColors[topic.status]}`}>
                      {topic.busFactor}
                    </span>
                  )}
                </div>

                {/* Knowledge Loss Indicator */}
                {knowledgeLoss > 0 && (
                  <div className="flex items-center gap-2 text-base bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
                    <span className="text-red-600 dark:text-red-400">↓</span>
                    <span className="font-medium text-red-700 dark:text-red-400">
                      {knowledgeLoss}% knowledge loss
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {topics.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No topics degraded
          </p>
        )}
      </div>
    </div>
  );
}
