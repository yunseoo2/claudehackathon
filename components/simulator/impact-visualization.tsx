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

const statusEmoji = {
  healthy: "🟢",
  warning: "🟡",
  critical: "🔴",
};

export function ImpactVisualization({ topics }: ImpactVisualizationProps) {
  const calculateKnowledgeLoss = (previous: number, current: number) => {
    if (previous === 0) return 0;
    const lossPercent = Math.round(((previous - current) / previous) * 100);
    return lossPercent;
  };

  return (
    <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">
        Topics Impacted
      </h2>
      <p className="text-sm text-gray-600 mb-6">
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
              className="p-6 border border-gray-200 rounded-lg bg-gray-50/50"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base text-gray-900">{topic.name}</h3>
                <div className={`font-medium text-sm px-3 py-1 rounded-full ${
                  topic.status === "critical" ? "bg-red-100 text-red-700" :
                  topic.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {topic.status === "critical" && "Critical Risk"}
                  {topic.status === "warning" && "Moderate Risk"}
                  {topic.status === "healthy" && "Healthy"}
                </div>
              </div>

              <div className="space-y-2">
                {/* Bus Factor Change */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 font-medium">Bus Factor:</span>
                  {topic.previousBusFactor !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{topic.previousBusFactor}</span>
                      <span className="text-gray-400">→</span>
                      <span className={`font-semibold ${statusColors[topic.status]}`}>
                        {topic.busFactor}
                      </span>
                      <span className="text-gray-500 text-xs">
                        [{statusEmoji[topic.previousStatus!]} → {statusEmoji[topic.status]}]
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
                  <div className="flex items-center gap-2 text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    <span className="text-red-600">↓</span>
                    <span className="font-medium text-red-700">
                      {knowledgeLoss}% knowledge loss
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {topics.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No topics degraded
          </p>
        )}
      </div>
    </div>
  );
}
