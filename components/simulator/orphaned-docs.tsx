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
    <div className="bg-white dark:bg-dark-700/30 border border-border dark:border-dark-600 rounded-xl p-8 shadow-sm">
      <h2 className="text-3xl font-light mb-3 text-gray-900 dark:text-white">
        Documents at Risk
      </h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        Critical documents that will become orphaned or high-risk
      </p>

      {/* Grid Layout for Document Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-8 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50/50 dark:bg-dark-700/50 hover:bg-gray-100/50 dark:hover:bg-dark-600/50 hover:border-gray-300 dark:hover:border-dark-500 transition-all"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">{doc.title}</h3>
                {doc.critical && (
                  <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full font-medium">
                    Critical
                  </span>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="text-base text-gray-600 dark:text-gray-400">
                  Owner: <span className="font-medium">{doc.owner}</span>
                </div>

                {/* Staleness Warning */}
                {isStale(doc.lastUpdated) && (
                  <div className="flex items-center gap-2 text-base text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2.5 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                    <span>⚠</span>
                    <span className="font-medium">
                      Staleness Warning: Last updated {formatDate(doc.lastUpdated)}
                    </span>
                  </div>
                )}

                {!isStale(doc.lastUpdated) && (
                  <div className="text-base text-gray-600 dark:text-gray-400">
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
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No orphaned documents
          </p>
        )}
      </div>
    </div>
  );
}
