'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Topic {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  documentCount: number;
  avgBusFactor?: number;
  avgDaysSinceUpdate?: number;
  criticalDocs?: number;
}

interface RiskGalaxyProps {
  topics: Topic[];
  onTopicClick: (id: string) => void;
}

export default function RiskGalaxy({ topics, onTopicClick }: RiskGalaxyProps) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const getTopicColor = (riskLevel: string) => {
    switch(riskLevel) {
      case 'high': return {
        base: 'from-red-500 to-pink-500',
        glow: 'shadow-red-500/50',
        ring: 'ring-red-400/30'
      };
      case 'medium': return {
        base: 'from-amber-500 to-orange-500',
        glow: 'shadow-amber-500/50',
        ring: 'ring-amber-400/30'
      };
      case 'low': return {
        base: 'from-green-500 to-emerald-500',
        glow: 'shadow-green-500/50',
        ring: 'ring-green-400/30'
      };
      default: return {
        base: 'from-gray-500 to-gray-600',
        glow: 'shadow-gray-500/50',
        ring: 'ring-gray-400/30'
      };
    }
  };

  // Calculate bubble size based on risk score (bigger risk = bigger circle)
  const getBubbleSize = (riskScore: number) => {
    // Min 80px, max 180px based on risk score (0-100)
    return 80 + (riskScore / 100) * 100;
  };

  // Scatter topics across the canvas with some randomness but keep them within bounds
  const getPosition = (index: number, total: number, size: number) => {
    // Use golden angle to distribute points
    const goldenAngle = 137.5;
    const angle = (index * goldenAngle * Math.PI) / 180;
    const radius = 25 + (index / total) * 35; // 25-60% from center

    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  };

  return (
    <div className="relative w-full h-[800px] bg-gradient-to-b from-black via-gray-900 to-black rounded-3xl border border-white/10 overflow-visible">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none rounded-3xl overflow-hidden">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Topic Bubbles */}
      <div className="relative w-full h-full">
        {topics.map((topic, index) => {
          const colors = getTopicColor(topic.riskLevel);
          const size = getBubbleSize(topic.riskScore);
          const position = getPosition(index, topics.length, size);

          return (
            <div key={topic.id} className="absolute" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
              <motion.div
                className="relative cursor-pointer group"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{ scale: 1.15, zIndex: 100 }}
                onClick={() => onTopicClick(topic.id)}
                onHoverStart={() => setHoveredTopic(topic.id)}
                onHoverEnd={() => setHoveredTopic(null)}
              >
                {/* Glow effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.base} rounded-full blur-xl opacity-60`}
                  animate={{
                    scale: topic.riskLevel === 'high' ? [1, 1.4, 1] : [1, 1.2, 1],
                  }}
                  transition={{
                    duration: topic.riskLevel === 'high' ? 2 : 3,
                    repeat: Infinity,
                  }}
                />

                {/* Circle body */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.base} rounded-full shadow-2xl ${colors.glow} ring-2 ${colors.ring} backdrop-blur-sm flex items-center justify-center`}
                >
                  <div className="text-center px-2 text-white">
                    <p className="font-bold text-sm leading-tight mb-1 drop-shadow-lg line-clamp-2">
                      {topic.name}
                    </p>
                    <p className="text-xs opacity-90 font-semibold">
                      {topic.riskScore}
                    </p>
                  </div>
                </div>

                {/* Pulsing ring for high risk */}
                {topic.riskLevel === 'high' && (
                  <motion.div
                    className="absolute inset-0 border-2 border-red-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}

                {/* Hover tooltip - shows on top */}
                {hoveredTopic === topic.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-24 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white min-w-[200px] z-50 pointer-events-none"
                    style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                  >
                    <h4 className="font-serif text-base font-bold mb-2">{topic.name}</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-bold text-white">{topic.riskScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="font-bold text-white">{topic.documentCount}</span>
                      </div>
                      {topic.criticalDocs !== undefined && (
                        <div className="flex justify-between">
                          <span>Critical:</span>
                          <span className="font-bold text-red-400">{topic.criticalDocs}</span>
                        </div>
                      )}
                      {topic.avgBusFactor !== undefined && (
                        <div className="flex justify-between">
                          <span>Bus Factor:</span>
                          <span className="font-bold text-white">{topic.avgBusFactor.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-black/90 border-b border-r border-white/20 rotate-45" />
                  </motion.div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
