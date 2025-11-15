"use client";

import { X, Users, Calendar, FileText, AlertTriangle, TrendingDown, Lightbulb, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import RiskBadge from "./dashboard/RiskBadge";
import { useState } from "react";

interface Document {
  id: string;
  title: string;
  riskScore: number;
  busFactor: number;
  owners: string[];
  daysSinceUpdate: number;
  critical: boolean;
  lastEditor: string;
  pageViews: number;
  topic: string;
}

interface TeamDetailProps {
  teamId: string;
  teamName: string;
  riskLevel: string;
  riskScore: number;
  memberCount: number;
  topTopics: string[];
  onClose: () => void;
}

// Mock data for team documents
const TEAM_DOCUMENTS: Record<string, Document[]> = {
  engineering: [
    {
      id: "doc1",
      title: "Deployment Runbook",
      topic: "Infrastructure",
      riskScore: 95,
      busFactor: 1,
      owners: ["Alice Chen"],
      daysSinceUpdate: 260,
      critical: true,
      lastEditor: "Alice Chen",
      pageViews: 1247,
    },
    {
      id: "doc5",
      title: "Kubernetes Configuration",
      topic: "Infrastructure",
      riskScore: 68,
      busFactor: 1,
      owners: ["Frank Wilson"],
      daysSinceUpdate: 180,
      critical: false,
      lastEditor: "Frank Wilson",
      pageViews: 523,
    },
    {
      id: "doc6",
      title: "CI/CD Pipeline Setup",
      topic: "DevOps",
      riskScore: 45,
      busFactor: 3,
      owners: ["Alice Chen", "Frank Wilson", "Grace Lee"],
      daysSinceUpdate: 45,
      critical: false,
      lastEditor: "Grace Lee",
      pageViews: 892,
    },
  ],
  product: [
    {
      id: "doc7",
      title: "Product Roadmap Q4",
      topic: "Planning",
      riskScore: 72,
      busFactor: 2,
      owners: ["Sarah Williams", "Tom Johnson"],
      daysSinceUpdate: 85,
      critical: true,
      lastEditor: "Sarah Williams",
      pageViews: 1543,
    },
  ],
  operations: [
    {
      id: "doc2",
      title: "Incident Response Playbook",
      topic: "Security",
      riskScore: 82,
      busFactor: 1,
      owners: ["Bob Smith"],
      daysSinceUpdate: 120,
      critical: true,
      lastEditor: "Bob Smith",
      pageViews: 654,
    },
  ],
};

// Sub-component: Metric Card
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50/60 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">{label}</p>
      <p className={`text-4xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

export function TeamDetailModal({
  teamId,
  teamName,
  riskLevel,
  riskScore,
  memberCount,
  topTopics,
  onClose,
}: TeamDetailProps) {
  const documents = TEAM_DOCUMENTS[teamId] || [];
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterCritical, setFilterCritical] = useState<'all' | 'critical' | 'non-critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const avgBusFactor =
    documents.reduce((acc, doc) => acc + doc.busFactor, 0) / documents.length;
  const avgDaysSinceUpdate =
    documents.reduce((acc, doc) => acc + doc.daysSinceUpdate, 0) /
    documents.length;
  const criticalCount = documents.filter((d) => d.critical).length;

  // Mock AI recommendations
  const recommendations = [
    `Add secondary owners to ${documents.filter(d => d.busFactor === 1).length} single-owner documents`,
    `Update ${documents.filter(d => d.daysSinceUpdate > 90).length} documents that haven't been modified in over 90 days`,
    `Consider creating a knowledge transfer session for ${teamName} team's critical documentation`,
  ];

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    // Risk filter
    if (filterRisk !== 'all') {
      const docRiskLevel = doc.riskScore > 70 ? 'high' : doc.riskScore > 40 ? 'medium' : 'low';
      if (docRiskLevel !== filterRisk) return false;
    }

    // Critical filter
    if (filterCritical === 'critical' && !doc.critical) return false;
    if (filterCritical === 'non-critical' && doc.critical) return false;

    // Search filter
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !doc.topic.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <AnimatePresence>
      {/* Full Page Modal */}
      <motion.div
        className="fixed inset-0 bg-gray-50 z-50 overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">
                  {teamName} Team
                </h1>
                <div className="flex items-center gap-4">
                  <RiskBadge riskLevel={riskLevel as 'low' | 'medium' | 'high'} showLabel size="lg" />
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{memberCount} members</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{topTopics.length} topics</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors p-3 hover:bg-gray-100 rounded-xl flex items-center gap-2"
              >
                <X size={24} />
                <span className="text-sm font-medium">Close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-4 gap-6">
              <MetricCard
                label="Risk Score"
                value={`${riskScore}/100`}
                color="text-blue-600"
              />
              <MetricCard
                label="Documents"
                value={documents.length.toString()}
                color="text-gray-900"
              />
              <MetricCard
                label="Avg Bus Factor"
                value={avgBusFactor.toFixed(1)}
                color="text-purple-600"
              />
              <MetricCard
                label="Critical Docs"
                value={criticalCount.toString()}
                color="text-red-600"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
            {/* AI Recommendations */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="text-blue-500" size={26} />
                AI-Powered Recommendations
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    className="relative bg-white/60 backdrop-blur-md border border-blue-200/50 rounded-xl p-5
                             hover:shadow-lg transition-all group overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-sm text-gray-700 leading-relaxed relative z-10">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Documents */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-blue-500" size={26} />
                  Documents ({filteredDocuments.length})
                </h2>
              </div>

              {/* Filters */}
              <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Risk Level Filter */}
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>

                  {/* Critical Filter */}
                  <select
                    value={filterCritical}
                    onChange={(e) => setFilterCritical(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Documents</option>
                    <option value="critical">Critical Only</option>
                    <option value="non-critical">Non-Critical</option>
                  </select>

                  {/* Clear Filters */}
                  {(filterRisk !== 'all' || filterCritical !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setFilterRisk('all');
                        setFilterCritical('all');
                        setSearchQuery('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredDocuments.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No documents match your filters</p>
                  </div>
                ) : (
                  filteredDocuments
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        className="relative bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-xl p-5 hover:shadow-lg
                                 transition-all cursor-pointer group overflow-hidden"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start justify-between mb-3 relative z-10">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-serif font-semibold text-lg text-gray-900">{doc.title}</h3>
                              {doc.critical && (
                                <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                                  Critical
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{doc.topic}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {doc.owners.length} owner{doc.owners.length !== 1 ? 's' : ''}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {doc.daysSinceUpdate}d ago
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {doc.pageViews.toLocaleString()} views
                              </span>
                            </div>

                            {/* Owner Avatars */}
                            <div className="flex items-center gap-2 mt-3">
                              {doc.owners.slice(0, 3).map((owner, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center
                                           text-white text-xs font-semibold"
                                  title={owner}
                                >
                                  {owner.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {doc.owners.length > 3 && (
                                <span className="text-xs text-gray-500">+{doc.owners.length - 3} more</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 relative z-10">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{doc.riskScore}</div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">risk</div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Factors */}
                        <div className="flex items-center gap-2 text-xs flex-wrap relative z-10">
                          {doc.busFactor === 1 && (
                            <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="font-medium">Single owner</span>
                            </div>
                          )}
                          {doc.daysSinceUpdate > 180 && (
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                              <TrendingDown className="w-3 h-3" />
                              <span className="font-medium">Outdated</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-200 sticky bottom-0 shadow-lg">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? "s" : ""} • {criticalCount} critical
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="rounded-full px-6">
                  Close
                </Button>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 px-6">
                  Generate Action Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
