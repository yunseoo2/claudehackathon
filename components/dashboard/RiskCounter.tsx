'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface RiskCounterProps {
  value: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}

export default function RiskCounter({ value, label, color, icon }: RiskCounterProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-lg opacity-50"
        style={{
          background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center mb-2 text-current" style={{ color }}>
          {icon}
        </div>
        <motion.div
          className="text-5xl font-bold font-serif mb-2"
          style={{ color }}
        >
          {display}
        </motion.div>
        <div className="text-sm text-gray-400 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
