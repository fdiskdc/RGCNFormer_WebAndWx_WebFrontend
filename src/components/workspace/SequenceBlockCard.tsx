/**
 * SequenceBlockCard - A card displayed in the Input Zone representing a dataset block.
 */

import React from 'react';
import type { SequenceBlock } from './types';
import { BINDING_COLORS, getBindingColorIndex } from './types';

interface SequenceBlockCardProps {
  block: SequenceBlock;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  validating: 'Validating...',
  validated: 'Validated',
  submitting: 'Submitting...',
  submitted: 'Submitted',
  processing: 'Processing...',
  completed: 'Completed',
  failed: 'Failed',
};

const SequenceBlockCard: React.FC<SequenceBlockCardProps> = ({
  block,
  isSelected,
  onClick,
}) => {
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
        🧬 {block.title}
        <span className="dataset-tag">{block.dataset}</span>
      </div>
      <div className="block-card-subtitle">
        {block.sequenceCount.toLocaleString()} sequences
      </div>
      <div className="block-card-meta" style={{ marginTop: 6 }}>
        <span className={`status-badge ${block.status}`}>
          {STATUS_LABELS[block.status] || block.status}
        </span>
        {block.boundModelId && colors && (
          <span style={{ marginLeft: 4, fontSize: 10, color: colors.accent }}>
            → {block.boundModelId === 'model_rgcnformer' ? 'RGCNFormer' : block.boundModelId}
          </span>
        )}
        {block.boundModelId && !colors && (
          <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--ws-text-muted)' }}>
            → {block.boundModelId === 'model_rgcnformer' ? 'RGCNFormer' : block.boundModelId}
          </span>
        )}
      </div>
    </div>
  );
};

export default SequenceBlockCard;
