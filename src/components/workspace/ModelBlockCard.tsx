/**
 * ModelBlockCard - A card displayed in the Model Zone representing a model block.
 */

import React from 'react';
import type { ModelBlock } from './types';
import { BINDING_COLORS, getBindingColorIndex } from './types';

interface ModelBlockCardProps {
  block: ModelBlock;
  isSelected: boolean;
  onClick: () => void;
  boundSequenceIds?: string[];
}

const ModelBlockCard: React.FC<ModelBlockCardProps> = ({
  block,
  isSelected,
  onClick,
  boundSequenceIds = [],
}) => {
  const isDisabled = block.status === 'disabled';

  // Binding color based on own model id (same model = same color across zones)
  const colorIdx = getBindingColorIndex(block.id);
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
      className={`block-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={isDisabled ? undefined : onClick}
      style={cardStyle}
    >
      <div className="block-card-title">
        🧠 {block.title}
      </div>
      <div className="block-card-subtitle">
        {block.description.slice(0, 60)}...
      </div>
      <div className="model-card-status">
        {isDisabled ? (
          <span className="coming-soon-badge">Coming Soon</span>
        ) : (
          <span className={`status-badge ${block.status}`}>
            {block.status === 'available' ? '✓ Available' : block.status}
          </span>
        )}
      </div>
      <div className="block-card-meta" style={{ marginTop: 4 }}>
        Version: {block.version}
      </div>
      {boundSequenceIds.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--ws-text-muted)' }}>Bound:</span>
          {boundSequenceIds.map((seqId) => (
            <span
              key={seqId}
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: colors ? colors.accent : '#ccc',
              }}
              title={seqId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelBlockCard;
