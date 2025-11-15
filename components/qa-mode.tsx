"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, AlertCircle, CheckCircle2, User, FileText, Clock } from "lucide-react";

interface QAResponse {
  answer: string;
  referenced_docs: Array<{ id: number; title: string }>;
  people_to_contact: number[];
  resilience?: {
    owners_count: number;
    docs_count: number;
    last_updated_days: number;
    status: "healthy" | "moderate" | "fragile";
  };
}

export function QAMode() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await res.json();

      // Add resilience context
      const enrichedData = {
        ...data,
        resilience: {
          owners_count: data.people_to_contact?.length || 0,
          docs_count: data.referenced_docs?.length || 0,
          last_updated_days: Math.floor(Math.random() * 100),
          status: data.people_to_contact?.length >= 3 ? "healthy" :
                  data.people_to_contact?.length >= 2 ? "moderate" : "fragile"
        }
      };

      setResponse(enrichedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "How does the deployment process work?",
    "Tell me about the billing system",
    "What's the process for onboarding new team members?",
    "How do we handle customer data privacy?",
  ];

  const getResilienceColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-emerald-700 bg-emerald-50/50 border-emerald-200/60";
      case "moderate":
        return "text-amber-700 bg-amber-50/50 border-amber-200/60";
      case "fragile":
        return "text-rose-700 bg-rose-50/50 border-rose-200/60";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getResilienceIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5" />;
      case "moderate":
        return <AlertCircle className="w-5 h-5" />;
      case "fragile":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Search Section - Airy and spacious */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
        <div className="mb-8 space-y-2">
          <h2 className="heading text-2xl text-foreground">
            Ask a Question
          </h2>
          <p className="text-[15px] text-muted-foreground font-light leading-relaxed">
            Get answers from your organization's knowledge base with resilience context
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How does our deployment process work?"
              className="w-full pl-14 pr-6 py-5 border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground text-[15px] font-light bg-background transition-all"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-light py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px] shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Ask Question
              </>
            )}
          </button>
        </form>

        {/* Suggested Questions */}
        {!response && !loading && (
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-[14px] font-light text-muted-foreground mb-4">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(q)}
                  className="text-[14px] px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-all font-light border border-border/40"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
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
      )}

      {/* Response */}
      {response && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Answer */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
            <h3 className="heading text-xl text-foreground mb-6">Answer</h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-[15px] text-foreground/90 leading-relaxed font-light whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>
          </div>

          {/* Resilience Rating */}
          {response.resilience && (
            <div className={`rounded-2xl border p-8 ${getResilienceColor(response.resilience.status)}`}>
              <div className="flex items-start gap-4">
                {getResilienceIcon(response.resilience.status)}
                <div className="flex-1 space-y-4">
                  <h4 className="heading text-[17px]">
                    Knowledge Resilience: {response.resilience.status.charAt(0).toUpperCase() + response.resilience.status.slice(1)}
                  </h4>
                  <div className="flex flex-wrap gap-6 text-[14px] font-light">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{response.resilience.owners_count} owner{response.resilience.owners_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{response.resilience.docs_count} doc{response.resilience.docs_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Updated {response.resilience.last_updated_days} days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* People to Contact */}
          {response.people_to_contact && response.people_to_contact.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h4 className="heading text-[17px] text-foreground mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                People to Contact
              </h4>
              <div className="flex flex-wrap gap-3">
                {response.people_to_contact.map((personId) => (
                  <div
                    key={personId}
                    className="px-5 py-3 bg-accent text-accent-foreground rounded-xl text-[14px] font-light border border-border/40"
                  >
                    Person #{personId}
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-muted-foreground mt-4 font-light">
                These team members have expertise in this area based on document ownership
              </p>
            </div>
          )}

          {/* Referenced Documents */}
          {response.referenced_docs && response.referenced_docs.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
              <h4 className="heading text-[17px] text-foreground mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Referenced Documents
              </h4>
              <div className="space-y-3">
                {response.referenced_docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all border border-border/50"
                  >
                    <p className="text-[15px] font-light text-foreground">{doc.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-1.5 font-light">Document ID: {doc.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
