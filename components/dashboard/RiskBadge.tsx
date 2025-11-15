interface RiskBadgeProps {
  riskLevel: 'low' | 'medium' | 'high';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ riskLevel, showLabel = false, size = 'md' }: RiskBadgeProps) {
  const config = {
    high: { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'High Risk' },
    medium: { emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Medium Risk' },
    low: { emoji: '🟢', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Low Risk' },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const { emoji, color, bg, border, label } = config[riskLevel];

  return (
    <span className={`inline-flex items-center gap-1.5 ${bg} ${color} ${border}
                      border rounded-full font-medium ${sizeClasses[size]}`}>
      <span>{emoji}</span>
      {showLabel && <span className="font-serif font-semibold">{label}</span>}
    </span>
  );
}
