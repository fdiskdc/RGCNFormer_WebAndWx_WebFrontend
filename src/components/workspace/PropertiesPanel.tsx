/**
 * PropertiesPanel - Right sidebar that displays configuration for the selected block.
 * Shows different content based on block type (sequence / model / visualization).
 */

import React from 'react';
import type { WorkspaceBlock, SequenceBlock, ModelBlock, VisualizationBlock, DatasetType } from './types';
import { VIZ_TYPE_REGISTRY, DATASET_OPTIONS, DATASET_LABELS } from './types';

interface PropertiesPanelProps {
  block: WorkspaceBlock | null;
  sequenceBlocks: SequenceBlock[];
  modelBlocks: ModelBlock[];
  onUpdateBlock: (id: string, updates: Partial<WorkspaceBlock>) => void;
  onRemoveBlock: (id: string) => void;
  onSubmitSequence: (blockId: string) => void;
  onRunViz: (blockId: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  block,
  sequenceBlocks,
  modelBlocks,
  onUpdateBlock,
  onRemoveBlock,
  onSubmitSequence,
  onRunViz,
}) => {
  if (!block) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <div className="properties-empty-icon">📋</div>
          <div>Select a block on the canvas<br />to view its properties</div>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="properties-panel-header">
        <h3>Properties</h3>
        <button
          className="properties-panel-close"
          onClick={() => onUpdateBlock(block.id, {})}
          title="Close panel"
        >
          ✕
        </button>
      </div>
      <div className="properties-panel-body">
        {block.type === 'sequence' && (
          <SequenceProperties
            block={block}
            modelBlocks={modelBlocks}
            onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            onRemove={() => onRemoveBlock(block.id)}
            onSubmit={() => onSubmitSequence(block.id)}
          />
        )}
        {block.type === 'model' && (
          <ModelProperties
            block={block}
            onRemove={() => onRemoveBlock(block.id)}
          />
        )}
        {block.type === 'visualization' && (
          <VisualizationProperties
            block={block}
            sequenceBlocks={sequenceBlocks}
            modelBlocks={modelBlocks}
            onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            onRemove={() => onRemoveBlock(block.id)}
            onRun={() => onRunViz(block.id)}
          />
        )}
      </div>
    </div>
  );
};

// ==================== Sequence Properties ====================

interface SequencePropertiesProps {
  block: SequenceBlock;
  modelBlocks: ModelBlock[];
  onUpdate: (updates: Partial<SequenceBlock>) => void;
  onRemove: () => void;
  onSubmit: () => void;
}

const SequenceProperties: React.FC<SequencePropertiesProps> = ({
  block,
  modelBlocks,
  onUpdate,
  onRemove,
  onSubmit,
}) => {
  const canSubmit = !['submitting', 'processing'].includes(block.status);

  return (
    <>
      {/* Title */}
      <div className="prop-group">
        <label className="prop-label">Title</label>
        <input
          className="prop-input"
          value={block.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      {/* Dataset */}
      <div className="prop-group">
        <label className="prop-label">Dataset</label>
        <select
          className="prop-select"
          value={block.dataset}
          onChange={(e) => onUpdate({ dataset: e.target.value as DatasetType })}
        >
          {DATASET_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {DATASET_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      {/* Dataset Size */}
      <div className="prop-group">
        <label className="prop-label">Sequences in Dataset</label>
        <div className="prop-value">{block.sequenceCount.toLocaleString()}</div>
      </div>

      <div className="prop-divider" />

      {/* Bind Model */}
      <div className="prop-group">
        <label className="prop-label">Bind Model</label>
        <select
          className="prop-select"
          value={block.boundModelId || ''}
          onChange={(e) => onUpdate({ boundModelId: e.target.value || null })}
        >
          <option value="">-- Select Model --</option>
          {modelBlocks.map((m) => (
            <option key={m.id} value={m.id} disabled={m.status === 'disabled'}>
              {m.title} {m.status === 'disabled' ? '(Coming Soon)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="prop-group">
        <label className="prop-label">Status</label>
        <div className="prop-value">
          <span className={`status-badge ${block.status}`}>
            {block.status}
          </span>
        </div>
      </div>

      {/* Job ID */}
      {block.jobId && (
        <div className="prop-group">
          <label className="prop-label">Job ID</label>
          <div className="prop-value" style={{ fontSize: 11, wordBreak: 'break-all' }}>
            {block.jobId}
          </div>
        </div>
      )}

      <div className="prop-divider" />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="prop-btn prop-btn-primary"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {['submitting', 'processing'].includes(block.status) ? 'Processing...' : 'Submit'}
        </button>
        <button
          className="prop-btn"
          style={{ background: '#f0dede', color: 'var(--ws-status-error)' }}
          onClick={onRemove}
        >
          Remove
        </button>
      </div>

      {/* Result Summary */}
      {block.resultSummary && (
        <>
          <div className="prop-divider" />
          <div className="prop-group">
            <label className="prop-label">Result Summary</label>
            <div className="prop-value" style={{ fontSize: 12 }}>
              ✓ Classification data available
              <br />
              ✓ Attention data available
              <br />
              ✓ GCN data available
            </div>
          </div>
        </>
      )}
    </>
  );
};

// ==================== Model Properties ====================

interface ModelPropertiesProps {
  block: ModelBlock;
  onRemove?: () => void;
}

const ModelProperties: React.FC<ModelPropertiesProps> = ({ block }) => {
  return (
    <>
      <div className="prop-group">
        <label className="prop-label">Model Name</label>
        <div className="prop-value">{block.modelName}</div>
      </div>

      <div className="prop-group">
        <label className="prop-label">Version</label>
        <div className="prop-value">{block.version}</div>
      </div>

      <div className="prop-group">
        <label className="prop-label">Status</label>
        <div className="prop-value">
          {block.status === 'available' ? (
            <span className="status-badge available">✓ Available</span>
          ) : (
            <span className="coming-soon-badge">Coming Soon</span>
          )}
        </div>
      </div>

      <div className="prop-group">
        <label className="prop-label">Description</label>
        <div className="prop-value" style={{ fontSize: 12, lineHeight: 1.5 }}>
          {block.description}
        </div>
      </div>

      {block.status === 'disabled' && (
        <div
          style={{
            padding: '10px 12px',
            background: '#ede9e5',
            borderRadius: 'var(--ws-radius-sm)',
            fontSize: 12,
            color: 'var(--ws-text-muted)',
            fontStyle: 'italic',
          }}
        >
          This model is not yet available. It will be enabled in a future release.
        </div>
      )}
    </>
  );
};

// ==================== Visualization Properties ====================

interface VisualizationPropertiesProps {
  block: VisualizationBlock;
  sequenceBlocks: SequenceBlock[];
  modelBlocks: ModelBlock[];
  onUpdate: (updates: Partial<VisualizationBlock>) => void;
  onRemove: () => void;
  onRun: () => void;
}

const VisualizationProperties: React.FC<VisualizationPropertiesProps> = ({
  block,
  sequenceBlocks,
  modelBlocks,
  onUpdate,
  onRemove,
  onRun,
}) => {
  const meta = VIZ_TYPE_REGISTRY.find((v) => v.key === block.vizType);

  return (
    <>
      {/* Viz Type */}
      <div className="prop-group">
        <label className="prop-label">Visualization Type</label>
        <div className="prop-value">
          {meta?.icon} {meta?.label || block.vizType}
        </div>
      </div>

      {/* Description */}
      <div className="prop-group">
        <label className="prop-label">Description</label>
        <div className="prop-value" style={{ fontSize: 12, lineHeight: 1.5 }}>
          {meta?.description}
        </div>
      </div>

      <div className="prop-divider" />

      {/* Bind Sequence (Data Source) */}
      <div className="prop-group">
        <label className="prop-label">Data Source (Sequence)</label>
        <select
          className="prop-select"
          value={block.boundSequenceId || ''}
          onChange={(e) => onUpdate({ boundSequenceId: e.target.value || null })}
        >
          <option value="">-- Select Sequence Block --</option>
          {sequenceBlocks.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.dataset})
            </option>
          ))}
        </select>
        {sequenceBlocks.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--ws-text-muted)', marginTop: 4 }}>
            No sequence blocks available. Add one from the puzzle library first.
          </div>
        )}
      </div>

      {/* Bind Model */}
      <div className="prop-group">
        <label className="prop-label">Model</label>
        <select
          className="prop-select"
          value={block.boundModelId || ''}
          onChange={(e) => onUpdate({ boundModelId: e.target.value || null })}
        >
          <option value="">-- Select Model --</option>
          {modelBlocks.map((m) => (
            <option key={m.id} value={m.id} disabled={m.status === 'disabled'}>
              {m.title} {m.status === 'disabled' ? '(Coming Soon)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="prop-divider" />

      {/* Parameters */}
      {block.vizType === 'attention' && (
        <div className="prop-group">
          <label className="prop-label">Top X</label>
          <input
            className="prop-input"
            type="number"
            min={1}
            max={100}
            value={block.params.topX || 3}
            onChange={(e) =>
              onUpdate({ params: { ...block.params, topX: parseInt(e.target.value) || 3 } })
            }
          />
        </div>
      )}

      {block.vizType === 'integrated-gradients' && (
        <>
          <div className="prop-group">
            <label className="prop-label">Target Class ID</label>
            <select
              className="prop-select"
              value={block.params.targetClassId ?? 0}
              onChange={(e) =>
                onUpdate({
                  params: { ...block.params, targetClassId: parseInt(e.target.value) },
                })
              }
            >
              {[
                'Am (0)', 'Atol (1)', 'Cm (2)', 'Gm (3)', 'Tm (4)', 'Y (5)',
                'ac4C (6)', 'm1A (7)', 'm5C (8)', 'm6A (9)', 'm6Am (10)', 'm7G (11)',
              ].map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="prop-group">
            <label className="prop-label">Top N Nodes</label>
            <input
              className="prop-input"
              type="number"
              min={1}
              max={100}
              value={block.params.topN || 10}
              onChange={(e) =>
                onUpdate({ params: { ...block.params, topN: parseInt(e.target.value) || 10 } })
              }
            />
          </div>
        </>
      )}

      {block.vizType === 'gcn-message-passing' && (
        <div className="prop-group">
          <label className="prop-label">Target Node Index</label>
          <input
            className="prop-input"
            type="number"
            min={0}
            value={block.params.targetNodeIdx ?? 0}
            onChange={(e) =>
              onUpdate({
                params: { ...block.params, targetNodeIdx: parseInt(e.target.value) || 0 },
              })
            }
          />
        </div>
      )}

      {/* Status */}
      <div className="prop-group">
        <label className="prop-label">Status</label>
        <div className="prop-value">
          <span className={`status-badge ${block.status}`}>
            {block.status}
          </span>
        </div>
      </div>

      {/* Result */}
      {block.result && (
        <div className="prop-group">
          <label className="prop-label">Result</label>
          <div className="prop-value" style={{ fontSize: 12 }}>
            ✓ Data available ({JSON.stringify(block.result).length} bytes)
          </div>
        </div>
      )}


      <div className="prop-divider" />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="prop-btn prop-btn-primary"
          onClick={onRun}
          disabled={!block.boundSequenceId || block.status === 'running'}
        >
          {block.status === 'running' ? 'Running...' : 'Run'}
        </button>
        <button
          className="prop-btn"
          style={{ background: '#f0dede', color: 'var(--ws-status-error)' }}
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
    </>
  );
};

export default PropertiesPanel;