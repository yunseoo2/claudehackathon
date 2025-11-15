"use client";

import React from "react";
import { motion } from "framer-motion";
import { OnboardingMode } from "./onboarding-mode";

export function KnowledgeAssist() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Clean and spacious */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-3">
              <h1 className="heading text-4xl text-foreground tracking-tight">
                Onboarding Assistant
              </h1>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed max-w-lg">
                Personalized onboarding experience for new team members
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Generous white space */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <OnboardingMode />
        </motion.div>
      </main>
    </div>
  );
}
