'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import RiskTooltip from './RiskTooltip';

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

interface TooltipData {
  topic: Topic;
  x: number;
  y: number;
}

interface ResilienceRadarProps {
  topics: Topic[];
  onTopicClick: (topicId: string) => void;
}

export default function ResilienceRadar({ topics, onTopicClick }: ResilienceRadarProps) {
  const [hoveredTopic, setHoveredTopic] = useState<TooltipData | null>(null);

  // Calculate bubble positions in a circular/scattered layout
  const getTopicPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radiusVariation = 25 + (index % 3) * 10; // Vary radius for visual interest
    return {
      x: 50 + Math.cos(angle) * radiusVariation,
      y: 50 + Math.sin(angle) * radiusVariation,
    };
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500 hover:bg-red-600';
      case 'medium': return 'bg-amber-500 hover:bg-amber-600';
      case 'low': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-400';
    }
  };

  const getBubbleSize = (docCount: number) => {
    // Scale bubble size based on document count (min 80px, max 200px)
    return Math.min(Math.max(docCount * 12, 80), 200);
  };

  return (
    <div className="relative w-full h-[700px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* SVG Background Grid (optional decorative element) */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Center Label */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-0 pointer-events-none">
        <h3 className="text-5xl font-serif text-gray-200 select-none">
          Resilience Radar
        </h3>
        <p className="text-sm text-gray-300 mt-2">Click bubbles for details</p>
      </div>

      {/* Topic Bubbles */}
      <div className="relative w-full h-full">
        {topics.map((topic, index) => {
          const position = getTopicPosition(index, topics.length);
          const size = getBubbleSize(topic.documentCount);

          return (
            <motion.div
              key={topic.id}
              className={`absolute cursor-pointer ${getRiskColor(topic.riskLevel)}
                         rounded-full flex items-center justify-center shadow-lg
                         transition-all duration-300 hover:shadow-2xl z-10 select-none`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ scale: 1.15, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTopicClick(topic.id)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredTopic({
                  topic,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredTopic(null)}
            >
              <div className="text-center text-white px-4">
                <p className="font-serif font-bold text-sm leading-tight mb-1">
                  {topic.name}
                </p>
                <p className="text-xs opacity-90">
                  {topic.documentCount} docs
                </p>
                <p className="text-xs font-semibold mt-1">
                  Risk: {topic.riskScore}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredTopic && (
        <RiskTooltip
          topic={hoveredTopic.topic}
          x={hoveredTopic.x}
          y={hoveredTopic.y}
        />
      )}
    </div>
  );
}
