"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QAMode } from "./qa-mode";
import { OnboardingMode } from "./onboarding-mode";

type Mode = "qa" | "onboarding";

export function KnowledgeAssist() {
  const [mode, setMode] = useState<Mode>("qa");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Clean and spacious */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-3">
              <h1 className="heading text-4xl text-foreground tracking-tight">
                Knowledge Assistant
              </h1>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed max-w-lg">
                Resilience-aware organizational memory
              </p>
            </div>

            {/* Mode Toggle - Minimal and elegant */}
            <div className="flex gap-1 bg-muted/40 rounded-xl p-1 border border-border/50">
              <button
                onClick={() => setMode("qa")}
                className={`px-6 py-2.5 rounded-lg text-[15px] font-light transition-all duration-200 ${
                  mode === "qa"
                    ? "bg-card text-accent-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Q&A
              </button>
              <button
                onClick={() => setMode("onboarding")}
                className={`px-6 py-2.5 rounded-lg text-[15px] font-light transition-all duration-200 ${
                  mode === "onboarding"
                    ? "bg-card text-accent-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Onboarding
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Generous white space */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          {mode === "qa" ? (
            <motion.div
              key="qa"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <QAMode />
            </motion.div>
          ) : (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <OnboardingMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
