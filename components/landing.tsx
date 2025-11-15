"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Activity, MessageSquare } from "lucide-react";
import FluidGlass from "./FluidGlass";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  index: number;
}

function FeatureCard({ title, description, icon, href, color, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 + 0.4, ease: "easeOut" }}
      className="relative"
    >
      <Link href={href}>
        <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-10 hover:bg-white/10 transition-all duration-500 cursor-pointer h-full overflow-hidden">
          {/* Glowing gradient on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className={`absolute inset-0 bg-gradient-to-br ${
              index === 0 ? 'from-blue-500/10 to-transparent' :
              index === 1 ? 'from-emerald-500/10 to-transparent' :
              'from-purple-500/10 to-transparent'
            }`} />
          </div>

          {/* Connection node */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 hidden md:flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${
              index === 0 ? 'bg-blue-500' :
              index === 1 ? 'bg-emerald-500' :
              'bg-purple-500'
            } opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
              <div className={`w-3 h-3 rounded-full ${
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-emerald-500' :
                'bg-purple-500'
              } animate-ping opacity-75`} />
            </div>
          </div>

          {/* Icon */}
          <div className="relative z-10 mb-8">
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className="heading text-3xl text-white mb-4 group-hover:translate-x-1 transition-transform duration-300">
              {title}
            </h3>
            <p className="text-[15px] text-white/70 font-light leading-relaxed mb-6">
              {description}
            </p>

            {/* Arrow */}
            <div className="flex items-center gap-2 text-[14px] font-light text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-2">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Border glow effect */}
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 ${
            index === 0 ? 'border-blue-500/30' :
            index === 1 ? 'border-emerald-500/30' :
            'border-purple-500/30'
          }`} />
        </div>
      </Link>
    </motion.div>
  );
}

export function Landing() {
  const features = [
    {
      title: "Transition Docs",
      description: "Generate comprehensive handoff documentation when team members leave. Identify orphaned docs, impacted topics, and create AI-assisted transition plans.",
      icon: <Users className="w-7 h-7 text-blue-600" />,
      href: "/transition",
      color: "bg-blue-50 border border-blue-200/60"
    },
    {
      title: "Resilience Radar",
      description: "Visualize your team's knowledge fragility with real-time bus factor analytics. Discover single points of failure and strengthen your organization's memory.",
      icon: <Activity className="w-7 h-7 text-emerald-600" />,
      href: "/dashboard",
      color: "bg-emerald-50 border border-emerald-200/60"
    },
    {
      title: "Knowledge Assistant",
      description: "Ask questions and get resilience-aware answers from your docs. Generate personalized onboarding plans with key people to meet and docs to read.",
      icon: <MessageSquare className="w-7 h-7 text-purple-600" />,
      href: "/knowledge",
      color: "bg-purple-50 border border-purple-200/60"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Fluid Glass Effect */}
      <section className="relative h-screen overflow-hidden bg-black">
        {/* FluidGlass Canvas - Full screen */}
        <div className="absolute inset-0">
          <FluidGlass
            mode="lens"
            lensProps={{
              scale: 0.25,
              ior: 1.15,
              thickness: 5,
              chromaticAberration: 0.1,
              anisotropy: 0.01
            }}
          />
        </div>
      </section>
     

      {/* Features Section - Connected Flow */}
      <section className="relative z-30 py-32 bg-black">
        {/* Flowing connection lines */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.3 }} />
                <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
              </linearGradient>
            </defs>
            <path
              d="M 0,400 Q 400,200 800,400 T 1600,400"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M 100,500 Q 500,300 900,500 T 1700,500"
              stroke="url(#gradient1)"
              strokeWidth="1.5"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-8 relative">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-20"
          >
            <h2 className="heading text-5xl text-white mb-6">
              The Continuum
            </h2>
            <p className="text-[16px] text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
              A seamless flow of knowledge resilience across your organization
            </p>
          </motion.div>

          {/* Feature Cards - Connected Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines between cards */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px">
              <div className="w-full h-px bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20"></div>
            </div>

            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA - Continuum Flow */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative py-24 px-8 bg-black overflow-hidden"
      >
        {/* Flowing gradient background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="relative bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-16 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>

            <h3 className="heading text-5xl text-white mb-6 relative z-10">
              Join the Continuum
            </h3>
            <p className="text-[16px] text-white/60 font-light mb-12 leading-relaxed max-w-2xl mx-auto relative z-10">
              Transform your organization's knowledge infrastructure with seamless resilience and continuous flow
            </p>

            <div className="flex gap-6 justify-center relative z-10 flex-wrap">
              <Link href="/knowledge">
                <button className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-light text-[16px] hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                  <span className="flex items-center gap-2">
                    Begin Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-light text-[16px] hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30">
                  Explore Dashboard
                </button>
              </Link>
            </div>

            {/* Decorative nodes */}
            <div className="absolute top-8 right-8 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-8 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 right-16 w-2 h-2 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
