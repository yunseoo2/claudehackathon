"use client";

import { X, Users, Calendar, FileText, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import RiskBadge from "./dashboard/RiskBadge";

interface Document {
  id: string;
  title: string;
  riskScore: number;
  busFactor: number;
  owners: string[];
  daysSinceUpdate: number;
  critical: boolean;
  lastEditor?: string;
  pageViews?: number;
  topic?: string;
}

interface TopicDetailProps {
  topicId: string;
  topicName: string;
  riskLevel: string;
  riskScore: number;
  documents: Document[];
  onClose: () => void;
}

// Mock data for topic documents
const TOPIC_DOCUMENTS: Record<string, Document[]> = {
  deployment: [
    {
      id: "doc1",
      title: "Deployment Runbook",
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
      riskScore: 45,
      busFactor: 3,
      owners: ["Alice Chen", "Frank Wilson", "Grace Lee"],
      daysSinceUpdate: 45,
      critical: false,
      lastEditor: "Grace Lee",
      pageViews: 892,
    },
  ],
  billing: [
    {
      id: "doc2",
      title: "Billing Incident Playbook",
      riskScore: 82,
      busFactor: 1,
      owners: ["Bob Smith (left)"],
      daysSinceUpdate: 20,
      critical: true,
      lastEditor: "Bob Smith",
      pageViews: 654,
    },
    {
      id: "doc7",
      title: "Payment Gateway Integration",
      riskScore: 55,
      busFactor: 2,
      owners: ["Sarah Williams", "Tom Johnson"],
      daysSinceUpdate: 75,
      critical: true,
      lastEditor: "Sarah Williams",
      pageViews: 1089,
    },
  ],
  database: [
    {
      id: "doc3",
      title: "Database Migration Guide",
      riskScore: 78,
      busFactor: 1,
      owners: ["Charlie Davis"],
      daysSinceUpdate: 150,
      critical: true,
      lastEditor: "Charlie Davis",
      pageViews: 432,
    },
  ],
  api: [
    {
      id: "doc4",
      title: "Refunds API Documentation",
      riskScore: 70,
      busFactor: 2,
      owners: ["Diana Lee", "Eve Martinez"],
      daysSinceUpdate: 95,
      critical: true,
      lastEditor: "Diana Lee",
      pageViews: 876,
    },
  ],
};

// Sub-component: Metric Card
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:shadow-2xl hover:border-white/20 transition-all">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">{label}</p>
      <p className={`text-4xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

export function TopicDetailModal({
  topicId,
  topicName,
  riskLevel,
  riskScore,
  documents,
  onClose,
}: TopicDetailProps) {
  // Use provided documents or fall back to mock data
  const displayDocuments = documents.length > 0 ? documents : (TOPIC_DOCUMENTS[topicId] || []);
  const avgBusFactor =
    displayDocuments.length > 0
      ? displayDocuments.reduce((acc, doc) => acc + doc.busFactor, 0) / displayDocuments.length
      : 0;
  const avgDaysSinceUpdate =
    displayDocuments.length > 0
      ? displayDocuments.reduce((acc, doc) => acc + doc.daysSinceUpdate, 0) / displayDocuments.length
      : 0;
  const criticalCount = displayDocuments.filter((d) => d.critical).length;

  return (
    <AnimatePresence>
      {/* Full Page Modal */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-b from-[#0A0A0F] via-[#121218] to-[#0A0A0F] z-50 overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="font-serif text-4xl font-bold text-white mb-3">
                  {topicName}
                </h1>
                <RiskBadge riskLevel={riskLevel as 'low' | 'medium' | 'high'} showLabel size="lg" />
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-xl flex items-center gap-2"
              >
                <X size={24} />
                <span className="text-sm font-medium">Close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-4 gap-6">
              <MetricCard
                label="Risk Score"
                value={`${riskScore}/100`}
                color="text-cyan-400"
              />
              <MetricCard
                label="Documents"
                value={displayDocuments.length.toString()}
                color="text-white"
              />
              <MetricCard
                label="Avg Bus Factor"
                value={avgBusFactor.toFixed(1)}
                color="text-purple-400"
              />
              <MetricCard
                label="Critical Docs"
                value={criticalCount.toString()}
                color="text-red-400"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
            {/* Documents */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-cyan-400" size={26} />
                Documents ({displayDocuments.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayDocuments
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((doc, index) => (
                <motion.div
                  key={doc.id}
                  className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:shadow-2xl
                           hover:shadow-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-serif font-semibold text-lg text-white">{doc.title}</h3>
                        {doc.critical && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                            Critical
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {doc.owners.length} owner{doc.owners.length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {doc.daysSinceUpdate}d ago
                        </span>
                        {doc.pageViews && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {doc.pageViews.toLocaleString()} views
                          </span>
                        )}
                      </div>

                      {/* Owner Avatars */}
                      <div className="flex items-center gap-2 mt-3">
                        {doc.owners.slice(0, 3).map((owner, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center
                                     text-white text-xs font-semibold border border-white/20"
                            title={owner}
                          >
                            {owner.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {doc.owners.length > 3 && (
                          <span className="text-xs text-gray-400">+{doc.owners.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{doc.riskScore}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">risk</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    {doc.busFactor === 1 && (
                      <div className="flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">Single owner</span>
                      </div>
                    )}
                    {doc.daysSinceUpdate > 180 && (
                      <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        <span className="font-medium">Outdated</span>
                      </div>
                    )}
                    {doc.owners.some((o) => o.includes("left")) && (
                      <div className="flex items-center gap-1 bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">Owner left</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 sticky bottom-0 shadow-2xl">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {displayDocuments.length} document{displayDocuments.length !== 1 ? "s" : ""} • {criticalCount} critical
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="rounded-full px-6 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}