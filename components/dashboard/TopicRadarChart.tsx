'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Topic {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  documentCount: number;
  avgBusFactor: number;
  avgDaysSinceUpdate: number;
  criticalDocs: number;
}

interface TopicRadarChartProps {
  topics: Topic[];
}

export default function TopicRadarChart({ topics }: TopicRadarChartProps) {
  // Take top 5 topics by risk score
  const displayTopics = useMemo(() => {
    return [...topics]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [topics]);

  // Dimensions for each topic (normalized 0-100)
  const dimensions = [
    { key: 'riskScore', label: 'Risk Score', max: 100 },
    { key: 'documentCount', label: 'Documents', max: 30 },
    { key: 'criticalDocs', label: 'Critical Docs', max: 10 },
    { key: 'avgBusFactor', label: 'Bus Factor', max: 5, invert: true }, // Higher is better
    { key: 'avgDaysSinceUpdate', label: 'Staleness (days)', max: 200 },
  ];

  const numAxes = dimensions.length;
  const angleSlice = (Math.PI * 2) / numAxes;
  const radius = 140;
  const center = 160;

  // Calculate point on radar
  const getPoint = (value: number, axisIndex: number, max: number, invert = false) => {
    let normalizedValue = (value / max) * 100;
    if (invert) normalizedValue = 100 - normalizedValue; // Invert for metrics where higher is better
    const r = (normalizedValue / 100) * radius;
    const angle = angleSlice * axisIndex - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate path for a topic
  const getTopicPath = (topic: Topic) => {
    const points = dimensions.map((dim, i) => {
      const value = topic[dim.key as keyof Topic] as number;
      return getPoint(value, i, dim.max, dim.invert);
    });

    const pathData = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ') + ' Z';

    return pathData;
  };

  // Colors for topics
  const topicColors = [
    { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.15)' }, // Red
    { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)' }, // Amber
    { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)' }, // Purple
    { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.15)' }, // Blue
    { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.15)' }, // Green
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="font-serif text-2xl font-bold text-white mb-4 text-center">
        Topic Risk Radar
      </h3>

      <div className="flex flex-col items-center gap-4">
        {/* SVG Radar Chart */}
        <svg width={center * 2} height={center * 2} className="overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Circular grid */}
          {[20, 40, 60, 80, 100].map((percent) => (
            <circle
              key={percent}
              cx={center}
              cy={center}
              r={(percent / 100) * radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          {dimensions.map((dim, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            // Label position (extended beyond radius)
            const labelX = center + (radius + 30) * Math.cos(angle);
            const labelY = center + (radius + 30) * Math.sin(angle);

            return (
              <g key={dim.key}>
                {/* Axis line */}
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1"
                />

                {/* Axis label */}
                <text
                  x={labelX}
                  y={labelY}
                  fill="white"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="select-none"
                >
                  {dim.label}
                </text>
              </g>
            );
          })}

          {/* Topic polygons */}
          {displayTopics.map((topic, topicIndex) => {
            const colors = topicColors[topicIndex];
            return (
              <motion.path
                key={topic.id}
                d={getTopicPath(topic)}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: topicIndex * 0.1 }}
                filter="url(#glow)"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            );
          })}

          {/* Center dot */}
          <circle cx={center} cy={center} r="4" fill="white" opacity="0.5" />
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {displayTopics.map((topic, i) => (
            <div key={topic.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: topicColors[i].stroke }}
              />
              <span className="text-xs text-gray-300 truncate max-w-[150px]">
                {topic.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
