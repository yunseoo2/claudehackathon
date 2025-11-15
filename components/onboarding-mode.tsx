"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, FileText, User, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";

interface OnboardingPlan {
  plan: string;
  docs_to_read?: Array<{ id: number; title: string }>;
  people_to_meet?: number[];
  fragility_opportunities?: Array<{ topic: string; reason: string }>;
}

export function OnboardingMode() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const teams = [
    "Payments Team",
    "Infrastructure Team",
    "Product Team",
    "Data Team",
    "Security Team",
  ];

  const handleGeneratePlan = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/recommend-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "team",
          team: selectedTeam,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate onboarding plan");
      }

      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Team Selection */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
        <div className="mb-8 space-y-2">
          <h2 className="heading text-2xl text-foreground">
            Generate Onboarding Plan
          </h2>
          <p className="text-[15px] text-muted-foreground font-light leading-relaxed">
            Select a team to receive a personalized onboarding guide with docs, people, and opportunities
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-[14px] font-light text-muted-foreground">
              Select Team
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-6 rounded-xl border transition-all text-left ${
                    selectedTeam === team
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users
                      className={`w-5 h-5 ${
                        selectedTeam === team ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`font-light text-[15px] ${
                        selectedTeam === team ? "text-accent-foreground" : "text-foreground"
                      }`}
                    >
                      {team}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading || !selectedTeam}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-light py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px] shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Generate Onboarding Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-6 flex items-start gap-4"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="heading text-[16px] text-rose-900">Error</h3>
            <p className="text-[14px] text-rose-700 font-light">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Onboarding Plan */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Main Plan */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="heading text-xl text-foreground">
                  Your Onboarding Plan
                </h3>
                <p className="text-[14px] text-muted-foreground font-light">
                  Customized for {selectedTeam}
                </p>
              </div>
            </div>
            <div className="prose prose-slate max-w-none">
              <div className="text-[15px] text-foreground/90 leading-relaxed font-light whitespace-pre-wrap">
                {plan.plan}
              </div>
            </div>
          </div>

          {/* Documents to Read */}
          {plan.docs_to_read && plan.docs_to_read.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h4 className="heading text-[17px] text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Essential Documents to Read
              </h4>
              <div className="space-y-3">
                {plan.docs_to_read.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-accent/30 rounded-xl border border-border/40 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[13px] font-light flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-light text-[15px] text-foreground">{doc.title}</p>
                        <p className="text-[13px] text-muted-foreground font-light">Doc ID: {doc.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People to Meet */}
          {plan.people_to_meet && plan.people_to_meet.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h4 className="heading text-[17px] text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Key People to Meet
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.people_to_meet.map((personId) => (
                  <div
                    key={personId}
                    className="p-5 bg-muted/30 rounded-xl border border-border/40 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-light text-[15px] text-foreground">Person #{personId}</p>
                        <p className="text-[13px] text-muted-foreground font-light">Team Expert</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fragility Opportunities */}
          {plan.fragility_opportunities && plan.fragility_opportunities.length > 0 && (
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200/60 p-8">
              <h4 className="heading text-[17px] text-amber-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Opportunities to Improve Team Resilience
              </h4>
              <p className="text-[14px] text-amber-800/80 mb-6 font-light leading-relaxed">
                These areas have low bus factor. You can help strengthen team knowledge by contributing here.
              </p>
              <div className="space-y-3">
                {plan.fragility_opportunities.map((opp, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-card rounded-xl border border-amber-200/60"
                  >
                    <p className="font-light text-[15px] text-foreground">{opp.topic}</p>
                    <p className="text-[14px] text-amber-700 mt-2 font-light">{opp.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="heading text-[16px] text-emerald-900">Ready to Start</h4>
              <p className="text-[14px] text-emerald-700 font-light leading-relaxed">
                Follow this plan to get up to speed on {selectedTeam}. Reach out to the listed team members for guidance.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
