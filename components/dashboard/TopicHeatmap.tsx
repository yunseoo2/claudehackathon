'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Clock, AlertTriangle } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  documentCount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  avgBusFactor: number;
  avgDaysSinceUpdate: number;
  criticalDocs: number;
}

interface TopicHeatmapProps {
  topics: Topic[];
  onTopicClick: (topicId: string) => void;
}

export default function TopicHeatmap({ topics, onTopicClick }: TopicHeatmapProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/60 backdrop-blur-xl';
      case 'medium': return 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500/60 backdrop-blur-xl';
      case 'low': return 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/60 backdrop-blur-xl';
      default: return 'border-gray-500/30 bg-gray-500/10 backdrop-blur-xl';
    }
  };

  const getRiskIndicator = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return { icon: '🔴', label: 'High Risk', color: 'text-red-300 bg-red-500/20 border-red-500/30' };
      case 'medium': return { icon: '🟡', label: 'Medium Risk', color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
      case 'low': return { icon: '🟢', label: 'Low Risk', color: 'text-green-300 bg-green-500/20 border-green-500/30' };
      default: return { icon: '⚪', label: 'Unknown', color: 'text-gray-300 bg-gray-500/20 border-gray-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300 font-medium">Risk Levels:</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300">
              🔴 High
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300">
              🟡 Medium
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300">
              🟢 Low
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div
        ref={containerRef}
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        onMouseMove={handleMouseMove}
      >
        {/* Spotlight effect */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
          }}
        />

        {topics.map((topic, index) => {
          const indicator = getRiskIndicator(topic.riskLevel);

          return (
            <motion.button
              key={topic.id}
              onClick={() => onTopicClick(topic.id)}
              className={`relative group p-6 rounded-xl border-2 transition-all duration-200
                         ${getRiskColor(topic.riskLevel)} shadow-sm hover:shadow-lg text-left cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Risk Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${indicator.color} text-xs font-semibold uppercase tracking-wide`}>
                  <span>{indicator.icon}</span>
                  <span>{indicator.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{topic.riskScore}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Risk</div>
                </div>
              </div>

              {/* Topic Name */}
              <h3 className="font-serif text-xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                {topic.name}
              </h3>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-bold text-white">{topic.documentCount}</p>
                    <p className="text-xs text-gray-400">Documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="font-bold text-white">{topic.criticalDocs}</p>
                    <p className="text-xs text-gray-400">Critical</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-bold text-white">{topic.avgBusFactor.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">Bus Factor</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-bold text-white">{Math.round(topic.avgDaysSinceUpdate)}d</p>
                    <p className="text-xs text-gray-400">Stale</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    topic.riskLevel === 'high' ? 'bg-red-500' :
                    topic.riskLevel === 'medium' ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.riskScore}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>

              {/* Click Indicator */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-end text-sm">
                <div className="flex items-center gap-1 text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
