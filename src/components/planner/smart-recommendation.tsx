// Smart Recommendation Component
// Displays actionable financial recommendations

'use client';

import Link from 'next/link';
import type { SmartRecommendation } from '@/types';
import {
  getRecommendationIcon,
  getRecommendationColor,
  getPriorityColor,
} from '@/lib/services/recommendation-engine';

interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  onDismiss?: (id: string) => void;
}

export function SmartRecommendationCard({
  recommendation,
  onDismiss,
}: SmartRecommendationCardProps) {
  const icon = getRecommendationIcon(recommendation.type);
  const color = getRecommendationColor(recommendation.type);
  const priorityColor = getPriorityColor(recommendation.priority);

  return (
    <div
      className="p-4 rounded-xl border transition-all hover:shadow-lg"
      style={{
        backgroundColor: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-[var(--foreground)]">
            {recommendation.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <span
            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
            style={{
              backgroundColor: `${priorityColor}20`,
              color: priorityColor,
            }}
          >
            {recommendation.priority}
          </span>
          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={() => onDismiss(recommendation.id)}
              className="p-1 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-[var(--foreground-muted)] mb-3 leading-relaxed">
        {recommendation.message}
      </p>

      {/* Impact */}
      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          <span>{recommendation.impact.description}</span>
        </div>

        {/* Action Button */}
        {recommendation.action && (
          <Link
            href={recommendation.action.href ?? '#'}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            {recommendation.action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

interface SmartRecommendationListProps {
  recommendations: SmartRecommendation[];
  onDismiss?: (id: string) => void;
  maxDisplay?: number;
}

export function SmartRecommendationList({
  recommendations,
  onDismiss,
  maxDisplay = 5,
}: SmartRecommendationListProps) {
  const displayedRecommendations = recommendations.slice(0, maxDisplay);

  if (recommendations.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-[var(--card)] border border-[var(--border)]">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="font-semibold text-[var(--foreground)] mb-1">
          Looking Good
        </h3>
        <p className="text-sm text-[var(--foreground-muted)]">
          No recommendations right now. Keep up the discipline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedRecommendations.map(rec => (
        <SmartRecommendationCard
          key={rec.id}
          recommendation={rec}
          onDismiss={onDismiss}
        />
      ))}

      {recommendations.length > maxDisplay && (
        <p className="text-center text-sm text-[var(--foreground-muted)]">
          +{recommendations.length - maxDisplay} more recommendations
        </p>
      )}
    </div>
  );
}

// Compact recommendation for dashboard widget
interface CompactRecommendationProps {
  recommendation: SmartRecommendation;
}

export function CompactRecommendation({ recommendation }: CompactRecommendationProps) {
  const icon = getRecommendationIcon(recommendation.type);
  const color = getRecommendationColor(recommendation.type);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border"
      style={{
        backgroundColor: `${color}05`,
        borderColor: `${color}20`,
      }}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">
          {recommendation.title}
        </p>
        <p className="text-xs text-[var(--foreground-muted)] truncate">
          {recommendation.impact.description}
        </p>
      </div>
      {recommendation.action && (
        <Link
          href={recommendation.action.href ?? '#'}
          className="shrink-0 p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
          style={{ color }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
