'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  documentCount: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  avgBusFactor: number;
  avgDaysSinceUpdate: number;
  criticalDocs: number;
  memberCount: number;
  topTopics: string[];
}

interface TeamHeatmapProps {
  teams: Team[];
  onTeamClick: (teamId: string) => void;
}

export default function TeamHeatmap({ teams, onTeamClick }: TeamHeatmapProps) {
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
      case 'high': return 'border-red-300/50 bg-red-50/30 hover:bg-red-100/50 hover:border-red-500/60 backdrop-blur-sm';
      case 'medium': return 'border-amber-300/50 bg-amber-50/30 hover:bg-amber-100/50 hover:border-amber-500/60 backdrop-blur-sm';
      case 'low': return 'border-green-300/50 bg-green-50/30 hover:bg-green-100/50 hover:border-green-500/60 backdrop-blur-sm';
      default: return 'border-gray-300/50 bg-gray-50/30 backdrop-blur-sm';
    }
  };

  const getRiskIndicator = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return { icon: '🔴', label: 'High Risk', color: 'text-red-700 bg-red-100 border-red-300' };
      case 'medium': return { icon: '🟡', label: 'Medium Risk', color: 'text-amber-700 bg-amber-100 border-amber-300' };
      case 'low': return { icon: '🟢', label: 'Low Risk', color: 'text-green-700 bg-green-100 border-green-300' };
      default: return { icon: '⚪', label: 'Unknown', color: 'text-gray-700 bg-gray-100 border-gray-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 font-medium">Team Risk Levels:</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-300 rounded-full text-red-700">
              🔴 High
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-700">
              🟡 Medium
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 border border-green-300 rounded-full text-green-700">
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
        {/* Spotlight effect - Magic Bento style */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
          }}
        />

        {teams.map((team, index) => {
          const indicator = getRiskIndicator(team.riskLevel);

          return (
            <motion.button
              key={team.id}
              onClick={() => onTeamClick(team.id)}
              className={`relative group p-6 rounded-xl border-2 transition-all duration-200
                         ${getRiskColor(team.riskLevel)} shadow-sm hover:shadow-lg text-left cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >

              {/* Content */}
              <div>
                {/* Risk Badge & Score */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${indicator.color} text-xs font-semibold uppercase tracking-wide`}>
                    <span>{indicator.icon}</span>
                    <span>{indicator.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{team.riskScore}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Risk</div>
                  </div>
                </div>

                {/* Team Name */}
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {team.name}
                </h3>

                {/* Top Topics */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Top Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.topTopics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="text-xs bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-gray-200/50">
                        {topic}
                      </span>
                    ))}
                    {team.topTopics.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{team.topTopics.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-bold text-gray-900">{team.documentCount}</p>
                      <p className="text-xs text-gray-500">Documents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="font-bold text-gray-900">{team.criticalDocs}</p>
                      <p className="text-xs text-gray-500">Critical</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-bold text-gray-900">{team.memberCount}</p>
                      <p className="text-xs text-gray-500">Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-bold text-gray-900">{Math.round(team.avgDaysSinceUpdate)}d</p>
                      <p className="text-xs text-gray-500">Avg Stale</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      team.riskLevel === 'high' ? 'bg-red-500' :
                      team.riskLevel === 'medium' ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${team.riskScore}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>

                {/* Click Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end text-sm">
                  <div className="flex items-center gap-1 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
