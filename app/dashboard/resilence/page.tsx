"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { TopicDetailModal } from "@/components/topic-detail-modal";
import TeamRiskChart from "@/components/dashboard/TeamRiskChart";
import TopicHeatmap from "@/components/dashboard/TopicHeatmap";
import { motion } from "framer-motion";
import Aurora from "@/components/Aurora";
import RiskCounter from "@/components/dashboard/RiskCounter";
import RiskGalaxy from "@/components/dashboard/RiskGalaxy";
import TopicRadarChart from "@/components/dashboard/TopicRadarChart";
import { useResilienceData } from "@/hooks/useResilienceData";

// Mock topic data - replace with actual data from your backend
const MOCK_TOPICS = [
  {
    id: "deployment",
    name: "Deployment & Infrastructure",
    riskLevel: "high" as const,
    riskScore: 85,
    documentCount: 12,
    avgBusFactor: 1.2,
    avgDaysSinceUpdate: 180,
    criticalDocs: 8,
  },
  {
    id: "billing",
    name: "Billing & Payments",
    riskLevel: "medium" as const,
    riskScore: 65,
    documentCount: 8,
    avgBusFactor: 2.1,
    avgDaysSinceUpdate: 90,
    criticalDocs: 4,
  },
  {
    id: "auth",
    name: "Authentication & Security",
    riskLevel: "low" as const,
    riskScore: 35,
    documentCount: 15,
    avgBusFactor: 3.5,
    avgDaysSinceUpdate: 30,
    criticalDocs: 2,
  },
  {
    id: "api",
    name: "API & Integrations",
    riskLevel: "medium" as const,
    riskScore: 55,
    documentCount: 20,
    avgBusFactor: 2.8,
    avgDaysSinceUpdate: 60,
    criticalDocs: 5,
  },
  {
    id: "database",
    name: "Database & Data Management",
    riskLevel: "high" as const,
    riskScore: 75,
    documentCount: 10,
    avgBusFactor: 1.5,
    avgDaysSinceUpdate: 120,
    criticalDocs: 6,
  },
  {
    id: "monitoring",
    name: "Monitoring & Observability",
    riskLevel: "low" as const,
    riskScore: 40,
    documentCount: 9,
    avgBusFactor: 3.2,
    avgDaysSinceUpdate: 45,
    criticalDocs: 2,
  },
];

const MOCK_RISKY_DOCS = [
  {
    id: "doc1",
    title: "Deployment Runbook",
    topic: "Deployment & Infrastructure",
    riskScore: 95,
    busFactor: 1,
    owners: ["Alice Chen"],
    daysSinceUpdate: 260,
    critical: true,
  },
  {
    id: "doc2",
    title: "Billing Incident Playbook",
    topic: "Billing & Payments",
    riskScore: 82,
    busFactor: 1,
    owners: ["Bob Smith (left)"],
    daysSinceUpdate: 20,
    critical: true,
  },
  {
    id: "doc3",
    title: "Database Migration Guide",
    topic: "Database & Data Management",
    riskScore: 78,
    busFactor: 1,
    owners: ["Charlie Davis"],
    daysSinceUpdate: 150,
    critical: true,
  },
  {
    id: "doc4",
    title: "Refunds API Documentation",
    topic: "API & Integrations",
    riskScore: 70,
    busFactor: 2,
    owners: ["Diana Lee", "Eve Martinez"],
    daysSinceUpdate: 95,
    critical: true,
  },
  {
    id: "doc5",
    title: "Kubernetes Configuration",
    topic: "Deployment & Infrastructure",
    riskScore: 68,
    busFactor: 1,
    owners: ["Frank Wilson"],
    daysSinceUpdate: 180,
    critical: false,
  },
];


export default function ResilienceDashboard() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'galaxy' | 'grid'>('grid');

  // Fetch real data from API
  const { topics, documents, loading, error, refetch } = useResilienceData();

  // Use real data if available, fallback to mock data
  const displayTopics = topics.length > 0 ? topics : MOCK_TOPICS;
  const displayDocuments = documents.length > 0 ? documents.slice(0, 5) : MOCK_RISKY_DOCS;

  const highRiskTopics = displayTopics.filter((t) => t.riskLevel === "high").length;
  const mediumRiskTopics = displayTopics.filter((t) => t.riskLevel === "medium").length;
  const lowRiskTopics = displayTopics.filter((t) => t.riskLevel === "low").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#121218] to-[#0A0A0F] relative overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 opacity-60">
        <Aurora
          colorStops={["#1E40AF", "#7C3AED", "#0F172A"]}
          blend={0.7}
          amplitude={1.5}
          speed={0.3}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 space-y-12">
        {/* Animated Header with Gradient Text */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.h1
            className="font-serif text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            Resilience Radar
          </motion.h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Monitoring organizational knowledge fragility through AI-powered visual analytics
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-gray-300 text-lg">Loading resilience data...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-1">Connection Error</h3>
              <p className="text-red-200/80 text-sm mb-3">
                Unable to fetch data from backend: {error}
              </p>
              <p className="text-red-200/60 text-xs mb-3">
                Make sure the backend server is running at http://localhost:8000
              </p>
              <button
                onClick={refetch}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          </motion.div>
        )}

        {/* Odometer-style Risk Counters */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <RiskCounter
            value={highRiskTopics}
            label="Critical Risk"
            color="#EF4444"
            icon={<AlertTriangle size={32} />}
          />
          <RiskCounter
            value={mediumRiskTopics}
            label="Moderate Risk"
            color="#F59E0B"
            icon={<AlertTriangle size={32} />}
          />
          <RiskCounter
            value={lowRiskTopics}
            label="Healthy"
            color="#10B981"
            icon={<CheckCircle size={32} />}
          />
        </motion.div>

        {/* Risk Comparison */}
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white mb-2">
              Topic Risk Analysis
            </h2>
            <p className="text-gray-300">
              Multi-dimensional view and ranking of knowledge fragility across topics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            {/* Radar Chart */}
            <TopicRadarChart topics={displayTopics} />

            {/* Leaderboard */}
            <TeamRiskChart teams={displayTopics} />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-4">
          <motion.button
            onClick={() => setViewMode('galaxy')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              viewMode === 'galaxy'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Galaxy View
          </motion.button>
          <motion.button
            onClick={() => setViewMode('grid')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Grid View
          </motion.button>
        </div>

        {/* Main Visualization */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div>
            <h2 className="font-serif text-3xl font-bold text-white mb-2">
              {viewMode === 'galaxy' ? 'Risk Galaxy' : 'Topic Knowledge Risk Heatmap'}
            </h2>
            <p className="text-gray-300">
              {viewMode === 'galaxy'
                ? 'Interactive orbital visualization - topics orbit based on risk level'
                : 'Click any topic to view detailed analysis and AI-powered recommendations'}
            </p>
          </div>

          {viewMode === 'galaxy' ? (
            <RiskGalaxy topics={displayTopics} onTopicClick={setSelectedTopic} />
          ) : (
            <TopicHeatmap topics={displayTopics} onTopicClick={setSelectedTopic} />
          )}
        </motion.div>

        {/* Enhanced Risky Documents List */}
        <div className="space-y-6">
          <motion.h2
            className="font-serif text-4xl font-bold text-white flex items-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Highest Risk Documents
          </motion.h2>

          <div className="space-y-4">
            {displayDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/10
                           rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20
                           transition-all group relative overflow-hidden"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Risk score with pulsing effect for high risk */}
                <div className="absolute right-6 top-6 flex flex-col items-center">
                  <motion.div
                    className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b
                               from-red-400 to-red-600"
                    animate={{ scale: doc.riskScore > 80 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {doc.riskScore}
                  </motion.div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">risk</span>
                </div>

                <div className="relative z-10 flex-1 pr-24">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl font-bold text-gray-500 w-10">
                      {index + 1}
                    </span>
                    <h3 className="font-serif font-semibold text-2xl text-white group-hover:text-cyan-300 transition-colors">
                      {doc.title}
                    </h3>
                    {doc.critical && (
                      <motion.span
                        className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Critical
                      </motion.span>
                    )}
                  </div>
                  <div className="ml-14 space-y-2">
                    <p className="text-sm text-gray-400">{doc.topic}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4" />
                        Bus factor: <span className="font-medium text-white">{doc.busFactor}</span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-white">{doc.daysSinceUpdate} days</span> since update
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Owners: </span>
                      <span className="font-medium text-white">
                        {doc.owners.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (() => {
        const topic = displayTopics.find((t) => t.id === selectedTopic);
        // Filter documents by topic name - use ALL documents, not just first 5
        const allDocuments = documents.length > 0 ? documents : displayDocuments;
        const topicDocuments = allDocuments.filter((doc) => doc.topic === topic?.name);

        return (
          <TopicDetailModal
            topicId={selectedTopic}
            topicName={topic?.name || ""}
            riskLevel={topic?.riskLevel || "low"}
            riskScore={topic?.riskScore || 0}
            documents={topicDocuments}
            onClose={() => setSelectedTopic(null)}
          />
        );
      })()}
    </div>
  );
}
