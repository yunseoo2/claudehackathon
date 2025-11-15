"use client";

import React from "react";
import type { System } from "@/components/continuity-simulator";

type UndocumentedSystemsProps = {
  systems: System[];
};

export function UndocumentedSystems({ systems }: UndocumentedSystemsProps) {
  const undocumentedSystems = systems.filter((s) => !s.documented);

  return (
    <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold text-gray-900">Undocumented Systems</h2>
        {undocumentedSystems.length > 0 && (
          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
            {undocumentedSystems.length} system{undocumentedSystems.length !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Systems mentioned in documents but lacking dedicated documentation
      </p>

      <div className="space-y-2">
        {undocumentedSystems.map((system, index) => (
          <div
            key={index}
            className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠</span>
              <span className="font-medium text-gray-900">{system.name}</span>
              <span className="text-xs text-gray-600 ml-auto">
                Needs documentation
              </span>
            </div>
          </div>
        ))}

        {undocumentedSystems.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            All systems are documented
          </p>
        )}
      </div>
    </div>
  );
}
