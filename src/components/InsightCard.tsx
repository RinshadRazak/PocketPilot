import React from 'react';
import { TriangleAlert, Sparkles, Activity, ArrowUpRight } from 'lucide-react';
import { Insight } from '../types';

interface InsightCardProps {
  insight: Insight;
  compact?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, compact = false }) => {
  const IconComponent =
    insight.tone === 'warning'
      ? TriangleAlert
      : insight.tone === 'positive'
      ? Sparkles
      : Activity;

  return (
    <article className={`insight-card ${insight.tone} ${compact ? 'compact' : ''}`}>
      <div className="insight-icon">
        <IconComponent size={19} strokeWidth={1.9} />
      </div>
      <div>
        <h3>{insight.title}</h3>
        <p>{insight.detail}</p>
      </div>
      <ArrowUpRight className="insight-arrow" size={18} />
    </article>
  );
};
