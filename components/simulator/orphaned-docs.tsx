"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/components/continuity-simulator";

type OrphanedDocsProps = {
  documents: Document[];
};

export function OrphanedDocs({ documents }: OrphanedDocsProps) {
  const getStalenessDays = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    const days = getStalenessDays(dateString);

    if (days < 30) {
      return `${days} days ago`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  const isStale = (dateString: string) => {
    return getStalenessDays(dateString) > 180; // 6 months
  };

  return (
    <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">
        Documents at Risk
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Critical documents that will become orphaned or high-risk
      </p>

      {/* Grid Layout for Document Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-6 border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300 transition-all"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 flex-1">{doc.title}</h3>
                {doc.critical && (
                  <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
                    Critical
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="text-sm text-gray-600">
                  Owner: <span className="font-medium">{doc.owner}</span>
                </div>

                {/* Staleness Warning */}
                {isStale(doc.lastUpdated) && (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                    <span>⚠</span>
                    <span className="font-medium">
                      Staleness Warning: Last updated {formatDate(doc.lastUpdated)}
                    </span>
                  </div>
                )}

                {!isStale(doc.lastUpdated) && (
                  <div className="text-sm text-gray-600">
                    Last updated: {formatDate(doc.lastUpdated)}
                  </div>
                )}
              </div>

              {/* View Document Button */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement document view
                    console.log("View document:", doc.id);
                  }}
                >
                  View Document
                </Button>
              </div>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No orphaned documents
          </p>
        )}
      </div>
    </div>
  );
}
