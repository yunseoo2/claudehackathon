'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TeamRisk {
  name: string;
  riskScore: number;
  documentCount: number;
  criticalDocs: number;
  memberCount?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TeamRiskChartProps {
  teams: TeamRisk[];
}

export default function TeamRiskChart({ teams }: TeamRiskChartProps) {
  const maxRisk = Math.max(...teams.map(t => t.riskScore));
  const sortedTeams = [...teams].sort((a, b) => b.riskScore - a.riskScore);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return { bg: 'bg-red-500', text: 'text-red-300', light: 'bg-red-500/10' };
      case 'medium': return { bg: 'bg-amber-500', text: 'text-amber-300', light: 'bg-amber-500/10' };
      case 'low': return { bg: 'bg-green-500', text: 'text-green-300', light: 'bg-green-500/10' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-300', light: 'bg-gray-500/10' };
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-serif text-2xl font-bold text-white text-center">
            Risk Leaderboard
          </h3>
        </div>
        <div className="divide-y divide-white/10">
          {sortedTeams.map((team, index) => {
            const colors = getRiskColor(team.riskLevel);
            const percentage = (team.riskScore / maxRisk) * 100;

            return (
              <motion.div
                key={team.name}
                className="p-6 hover:bg-white/5 transition-colors relative overflow-hidden group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Background bar */}
                <motion.div
                  className={`absolute left-0 top-0 h-full ${colors.light} opacity-30`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />

                <div className="relative z-10 flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-2xl font-bold text-gray-500">
                      {index + 1}
                    </span>
                  </div>

                  {/* Team Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl font-bold text-white">
                        {team.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                     ${colors.light} ${colors.text} border border-current`}>
                        {team.riskLevel} risk
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-300">
                      {team.memberCount !== undefined && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <Users size={14} />
                            {team.memberCount} members
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span>{team.documentCount} documents</span>
                      <span>•</span>
                      <span className="text-red-400 font-medium">
                        {team.criticalDocs} critical
                      </span>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-4xl font-bold text-white">
                      {team.riskScore}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Risk Score
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-shrink-0 w-32">
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${colors.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${team.riskScore}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
  );
}
