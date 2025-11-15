'use client';

import { motion } from 'framer-motion';
import RiskBadge from './RiskBadge';

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

interface RiskTooltipProps {
  topic: Topic;
  x: number;
  y: number;
}

export default function RiskTooltip({ topic, x, y }: RiskTooltipProps) {
  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y - 10}px`,
        transform: 'translate(-50%, -100%)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Arrow */}
      <div className="relative">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
        </div>

        {/* Tooltip Content */}
        <div className="bg-gray-900 text-white rounded-lg shadow-2xl px-4 py-3 min-w-[240px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-serif font-bold text-base">{topic.name}</h4>
            <RiskBadge riskLevel={topic.riskLevel} />
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Documents:</span>
              <span className="font-semibold">{topic.documentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Bus Factor:</span>
              <span className="font-semibold">{topic.avgBusFactor.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Avg Days Since Update:</span>
              <span className="font-semibold">{Math.round(topic.avgDaysSinceUpdate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Critical Docs:</span>
              <span className="font-semibold text-red-400">{topic.criticalDocs}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-1.5 mt-1.5">
              <span className="text-gray-300">Risk Score:</span>
              <span className="font-bold text-lg">{topic.riskScore}/100</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 italic">
            Click for details
          </p>
        </div>
      </div>
    </motion.div>
  );
}
