/**
 * VizBlockCard - A card displayed in the Visualization Zone representing a visualization block.
 * Binding is primarily model-based: same model = same color.
 */

import React from 'react';
import type { VisualizationBlock, ModelBlock } from './types';
import { VIZ_TYPE_REGISTRY, BINDING_COLORS, getBindingColorIndex } from './types';

interface VizBlockCardProps {
  block: VisualizationBlock;
  isSelected: boolean;
  onClick: () => void;
  modelBlocks: ModelBlock[];
  boundSequenceLabel?: string;
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  ready: 'Ready',
  running: 'Running...',
  completed: 'Completed',
  failed: 'Failed',
};

const VizBlockCard: React.FC<VizBlockCardProps> = ({
  block,
  isSelected,
  onClick,
  modelBlocks,
  boundSequenceLabel,
}) => {
  const meta = VIZ_TYPE_REGISTRY.find((v) => v.key === block.vizType);
  const boundModel = modelBlocks.find((m) => m.id === block.boundModelId);

  // Binding color based on model (same model = same color)
  const colorIdx = getBindingColorIndex(block.boundModelId);
  const colors = colorIdx >= 0 ? BINDING_COLORS[colorIdx] : null;

  const cardStyle: React.CSSProperties = colors
    ? {
        borderColor: isSelected ? colors.accent : colors.border,
        background: colors.bg,
        ...(isSelected ? { boxShadow: `0 0 0 2px ${colors.accent}33` } : {}),
      }
    : {};

  return (
    <div
      className={`block-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={cardStyle}
    >
      <div className="block-card-title">
        {meta?.icon || '📊'} {block.title}
      </div>
      <div className="block-card-subtitle">
        {meta?.label || block.vizType}
      </div>
      <div className="viz-card-binding">
        {boundModel ? (
          <span style={colors ? { color: colors.accent } : undefined}>
            Model: {boundModel.title}
          </span>
        ) : (
          <span style={{ color: 'var(--ws-text-muted)', fontStyle: 'italic' }}>
            No model bound
          </span>
        )}
      </div>
      {boundSequenceLabel && (
        <div className="block-card-meta" style={{ marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--ws-text-muted)' }}>
            Data: {boundSequenceLabel}
          </span>
        </div>
      )}
      <div className="block-card-meta" style={{ marginTop: 6 }}>
        <span className={`status-badge ${block.status}`}>
          {STATUS_LABELS[block.status] || block.status}
        </span>
        {block.autoRun && (
          <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--ws-text-muted)' }}>
            Auto-run
          </span>
        )}
      </div>
    </div>
  );
};

export default VizBlockCard;
