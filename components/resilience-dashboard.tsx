"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Activity, AlertCircle, CheckCircle2, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TopicStat {
  topic_id: number;
  topic: string;
  docs_count: number;
  owners_count: number;
  staleness_days: number | null;
}

interface DocumentRisk {
  id: number;
  title: string;
  risk_score: number;
  owners_count: number;
  staleness_days: number;
}

interface DashboardData {
  topic_stats: TopicStat[];
  documents: DocumentRisk[];
  team_resilience_score: number;
}

export function ResilienceDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/documents/at-risk");

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "High", color: "text-rose-700 bg-rose-50/50 border-rose-200/60" };
    if (score >= 40) return { label: "Medium", color: "text-amber-700 bg-amber-50/50 border-amber-200/60" };
    return { label: "Low", color: "text-emerald-700 bg-emerald-50/50 border-emerald-200/60" };
  };

  const getResilienceStatus = (score: number) => {
    if (score >= 70) return { label: "Healthy", color: "text-emerald-700", icon: <CheckCircle2 className="w-6 h-6" /> };
    if (score >= 40) return { label: "Moderate", color: "text-amber-700", icon: <AlertCircle className="w-6 h-6" /> };
    return { label: "Fragile", color: "text-rose-700", icon: <AlertCircle className="w-6 h-6" /> };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6 font-light">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="space-y-3">
            <h1 className="heading text-4xl text-foreground tracking-tight">
              Resilience Radar
            </h1>
            <p className="text-[15px] text-muted-foreground font-light leading-relaxed max-w-2xl">
              Real-time bus factor analytics and knowledge fragility visualization
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-6 flex items-start gap-4"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="heading text-[16px] text-rose-900">Error</h3>
              <p className="text-[14px] text-rose-700 font-light">{error}</p>
            </div>
          </motion.div>
        ) : dashboardData ? (
          <div className="space-y-8">
            {/* Team Resilience Score */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-10"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="heading text-2xl text-foreground">
                    Team Resilience Score
                  </h2>
                  <p className="text-[14px] text-muted-foreground font-light">
                    Overall knowledge distribution health
                  </p>
                </div>
                <div className="text-center">
                  <div className={`flex items-center gap-3 ${getResilienceStatus(dashboardData.team_resilience_score).color}`}>
                    {getResilienceStatus(dashboardData.team_resilience_score).icon}
                    <div>
                      <div className="text-5xl font-light heading">
                        {Math.round(dashboardData.team_resilience_score)}
                      </div>
                      <div className="text-[14px] font-light">
                        {getResilienceStatus(dashboardData.team_resilience_score).label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Topic Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl shadow-sm border border-border p-8"
            >
              <h3 className="heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Topic Distribution
              </h3>
              <div className="space-y-3">
                {dashboardData.topic_stats.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="p-5 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-light text-[15px] text-foreground">{topic.topic}</h4>
                      <div className="flex gap-4 text-[13px] text-muted-foreground font-light">
                        <span>{topic.docs_count} docs</span>
                        <span>{topic.owners_count} owner{topic.owners_count !== 1 ? 's' : ''}</span>
                        {topic.staleness_days && <span>{topic.staleness_days}d old</span>}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          topic.owners_count >= 3 ? 'bg-emerald-500' :
                          topic.owners_count >= 2 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (topic.owners_count / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* At-Risk Documents */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl shadow-sm border border-border p-8"
            >
              <h3 className="heading text-xl text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                High-Risk Documents
              </h3>
              <div className="space-y-3">
                {dashboardData.documents
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .slice(0, 10)
                  .map((doc) => {
                    const risk = getRiskLevel(doc.risk_score);
                    return (
                      <div
                        key={doc.id}
                        className={`p-5 rounded-xl border ${risk.color}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-light text-[15px] text-foreground flex-1">
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-light px-3 py-1 bg-card rounded-lg border border-border/50">
                              {risk.label} Risk
                            </span>
                            <span className="text-[13px] font-light px-3 py-1 bg-card rounded-lg border border-border/50">
                              Score: {doc.risk_score}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4 text-[13px] text-muted-foreground font-light">
                          <span>{doc.owners_count} owner{doc.owners_count !== 1 ? 's' : ''}</span>
                          <span>Last updated {doc.staleness_days} days ago</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
