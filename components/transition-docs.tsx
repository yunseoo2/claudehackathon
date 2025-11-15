"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, FileText, AlertTriangle, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Person {
  id: number;
  name: string;
}

interface TransitionData {
  person: { id: number; name: string };
  orphaned_docs: Array<{ id: number; title: string }>;
  impacted_topics: Array<{ topic_id: number; name: string; reason: string }>;
  under_documented_systems: Array<{ system_id: number; name: string }>;
  claude_handoff: string;
}

export function TransitionDocs() {
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitionData, setTransitionData] = useState<TransitionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock people data - replace with API call
  const people: Person[] = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Carol Williams" },
    { id: 4, name: "David Brown" },
  ];

  const handleGenerateTransition = async () => {
    if (!selectedPerson) return;

    setLoading(true);
    setError(null);
    setTransitionData(null);

    try {
      const res = await fetch("/api/simulate-departure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person_id: selectedPerson }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate transition documentation");
      }

      const data = await res.json();
      setTransitionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6 font-light">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="space-y-3">
            <h1 className="heading text-4xl text-foreground tracking-tight">
              Transition Documentation
            </h1>
            <p className="text-[15px] text-muted-foreground font-light leading-relaxed max-w-2xl">
              Generate comprehensive handoff documentation when team members leave
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="space-y-10">
          {/* Person Selection */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
            <div className="mb-8 space-y-2">
              <h2 className="heading text-2xl text-foreground">
                Select Person Leaving
              </h2>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed">
                Choose a team member to simulate their departure and generate transition docs
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-[14px] font-light text-muted-foreground">
                  Team Member
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {people.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => setSelectedPerson(person.id)}
                      className={`p-6 rounded-xl border transition-all text-left ${
                        selectedPerson === person.id
                          ? "border-primary bg-accent shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users
                          className={`w-5 h-5 ${
                            selectedPerson === person.id ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`font-light text-[15px] ${
                            selectedPerson === person.id ? "text-accent-foreground" : "text-foreground"
                          }`}
                        >
                          {person.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateTransition}
                disabled={loading || !selectedPerson}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-light py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px] shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Documentation...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Transition Docs
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

          {/* Transition Results */}
          {transitionData && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* AI-Generated Handoff Summary */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="heading text-xl text-foreground">
                    Handoff Summary
                  </h3>
                  <button className="flex items-center gap-2 px-4 py-2 text-[14px] font-light text-primary hover:bg-accent rounded-lg transition-all">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-[15px] text-foreground/90 leading-relaxed font-light whitespace-pre-wrap">
                    {transitionData.claude_handoff}
                  </p>
                </div>
              </div>

              {/* Orphaned Documents */}
              {transitionData.orphaned_docs.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                  <h4 className="heading text-[17px] text-foreground mb-5 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Orphaned Documents ({transitionData.orphaned_docs.length})
                  </h4>
                  <div className="space-y-3">
                    {transitionData.orphaned_docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-5 bg-amber-50/50 rounded-xl border border-amber-200/60"
                      >
                        <p className="font-light text-[15px] text-foreground">{doc.title}</p>
                        <p className="text-[13px] text-muted-foreground mt-1.5 font-light">
                          Doc ID: {doc.id} • Requires new owner
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impacted Topics */}
              {transitionData.impacted_topics.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                  <h4 className="heading text-[17px] text-foreground mb-5 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Impacted Topics ({transitionData.impacted_topics.length})
                  </h4>
                  <div className="space-y-3">
                    {transitionData.impacted_topics.map((topic) => (
                      <div
                        key={topic.topic_id}
                        className="p-5 bg-rose-50/50 rounded-xl border border-rose-200/60"
                      >
                        <p className="font-light text-[15px] text-foreground">{topic.name}</p>
                        <p className="text-[14px] text-rose-700 mt-2 font-light">{topic.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Under-Documented Systems */}
              {transitionData.under_documented_systems.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                  <h4 className="heading text-[17px] text-foreground mb-5 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Under-Documented Systems ({transitionData.under_documented_systems.length})
                  </h4>
                  <div className="space-y-3">
                    {transitionData.under_documented_systems.map((system) => (
                      <div
                        key={system.system_id}
                        className="p-5 bg-orange-50/50 rounded-xl border border-orange-200/60"
                      >
                        <p className="font-light text-[15px] text-foreground">{system.name}</p>
                        <p className="text-[13px] text-muted-foreground mt-1.5 font-light">
                          System ID: {system.system_id} • Needs documentation
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
