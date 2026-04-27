/**
 * WorkspacePage - Single-page puzzle-style analysis workbench.
 * Replaces the old MainPage as the root route.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkspacePage.css';
import PuzzleLibrary from '../components/workspace/PuzzleLibrary';
import WorkspaceCanvas from '../components/workspace/WorkspaceCanvas';
import PropertiesPanel from '../components/workspace/PropertiesPanel';
import type {
  SequenceBlock,
  ModelBlock,
  VisualizationBlock,
  WorkspaceBlock,
  VizType,
  DatasetType,
} from '../components/workspace/types';
import { BINDING_COLORS, getBindingColorIndex } from '../components/workspace/types';
import {
  DEFAULT_MODELS,
  createDefaultSequenceBlock,
  createVizBlock,
  createMockTaskRunner,
} from '../components/workspace/mockData';

// Re-use existing visualization components for rendering in the viz zone
import ClassificationViz from './ClassificationViz';
import AttentionViz from './AttentionViz';
import GcnViz from './GcnViz';
import TargetGcnViz from './TargetGcnViz';
import IntegratedGradientsViz from './IntegratedGradientsViz';
import ModelViz from './ModelViz';

const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();

  // ==================== State ====================
  const [sequenceBlocks, setSequenceBlocks] = useState<SequenceBlock[]>([]);
  const [modelBlocks] = useState<ModelBlock[]>(DEFAULT_MODELS);
  const [vizBlocks, setVizBlocks] = useState<VisualizationBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const taskRunnerRef = useRef(createMockTaskRunner());

  // ==================== Task Result Listener ====================
  useEffect(() => {
    const unsubscribe = taskRunnerRef.current.onResult((result) => {
      setSequenceBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== result.sequenceBlockId) return block;

          if (result.status === 'processing') {
            return { ...block, status: 'processing' as const };
          }

          if (result.status === 'completed') {
            return {
              ...block,
              status: 'completed' as const,
              resultSummary: result.result,
            } as SequenceBlock;
          }

          if (result.status === 'failed') {
            return {
              ...block,
              status: 'failed' as const,
            } as SequenceBlock;
          }

          return block;
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ==================== Block Operations ====================

  const addSequenceBlock = useCallback(
    (dataset: DatasetType) => {
      const newBlock = createDefaultSequenceBlock(dataset);
      const count = sequenceBlocks.filter((b) => b.dataset === dataset).length + 1;
      newBlock.title = `${dataset}-${String(count).padStart(3, '0')}`;
      setSequenceBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
    },
    [sequenceBlocks]
  );

  const addVizBlock = useCallback(
    (vizType: VizType) => {
      const newBlock = createVizBlock(vizType);
      setVizBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
    },
    []
  );

  const removeBlock = useCallback((id: string) => {
    setSequenceBlocks((prev) => prev.filter((b) => b.id !== id));
    setVizBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId((prev) => (prev === id ? null : prev));
  }, []);

  const updateBlock = useCallback(
    (id: string, updates: Partial<WorkspaceBlock>) => {
      setSequenceBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } as SequenceBlock : b))
      );
      setVizBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          let merged = { ...b, ...updates } as VisualizationBlock;
          // Auto-derive boundModelId from bound sequence when sequence binding changes
          if ('boundSequenceId' in updates && !('boundModelId' in updates)) {
            const seqBlock = sequenceBlocks.find((s) => s.id === merged.boundSequenceId);
            merged = { ...merged, boundModelId: seqBlock?.boundModelId || null };
          }
          return merged;
        })
      );
    },
    [sequenceBlocks]
  );

  // ==================== Submit Sequence ====================

  const submitSequence = useCallback(
    (blockId: string) => {
      const block = sequenceBlocks.find((b) => b.id === blockId);
      if (!block) return;

      // Update to submitting state
      setSequenceBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, status: 'submitting' as const } : b))
      );

      // Start mock task with a sample sequence for processing
      const jobId = taskRunnerRef.current.start(blockId);

      setSequenceBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, status: 'queued' as const, jobId } as SequenceBlock
            : b
        )
      );
    },
    [sequenceBlocks]
  );

  // ==================== Run Visualization ====================

  const runVisualization = useCallback(
    (vizBlockId: string) => {
      const vizBlock = vizBlocks.find((b) => b.id === vizBlockId);
      if (!vizBlock || !vizBlock.boundSequenceId) return;

      const seqBlock = sequenceBlocks.find((s) => s.id === vizBlock.boundSequenceId);
      if (!seqBlock || !seqBlock.resultSummary) {
        // Sequence hasn't been submitted yet
        return;
      }

      setVizBlocks((prev) =>
        prev.map((b) =>
          b.id === vizBlockId
            ? { ...b, status: 'running' as const, result: seqBlock.resultSummary }
            : b
        )
      );

      // Simulate short delay
      setTimeout(() => {
        setVizBlocks((prev) =>
          prev.map((b) =>
            b.id === vizBlockId ? { ...b, status: 'completed' as const } : b
          )
        );
      }, 500);
    },
    [vizBlocks, sequenceBlocks]
  );

  // ==================== Process (Navigate to Viz Display) ====================

  const handleProcess = useCallback(() => {
    const completedVizBlocks = vizBlocks.filter(
      (b) => b.status === 'completed' && b.result
    );
    if (completedVizBlocks.length === 0) return;

    navigate('/viz-display', {
      state: {
        sequenceBlocks: sequenceBlocks.filter((s) => s.resultSummary),
        vizBlocks: completedVizBlocks,
      },
    });
  }, [navigate, sequenceBlocks, vizBlocks]);

  // ==================== Derived State ====================

  const selectedBlock: WorkspaceBlock | null = (() => {
    if (!selectedBlockId) return null;
    return (
      sequenceBlocks.find((b) => b.id === selectedBlockId) ||
      modelBlocks.find((b) => b.id === selectedBlockId) ||
      vizBlocks.find((b) => b.id === selectedBlockId) ||
      null
    );
  })();

  const hasCompletedViz = vizBlocks.some((b) => b.status === 'completed' && b.result);

  return (
    <div className="workspace-root">
      {/* Header */}
      <div className="workspace-header">
        <h1>🧬 RGCNFormer Analysis Workbench</h1>
        <div className="workspace-header-actions">
          <span style={{ fontSize: 12, color: 'var(--ws-text-muted)' }}>
            {sequenceBlocks.length} sequences · {vizBlocks.length} visualizations
          </span>
          <button
            className="process-btn"
            onClick={handleProcess}
            disabled={!hasCompletedViz}
            title={hasCompletedViz ? 'View visualization display' : 'Run visualizations first'}
          >
            Process →
          </button>
        </div>
      </div>

      {/* Body: Library | Canvas | Properties */}
      <div className="workspace-body">
        <PuzzleLibrary onAddSequence={addSequenceBlock} onAddViz={addVizBlock} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <WorkspaceCanvas
            sequenceBlocks={sequenceBlocks}
            modelBlocks={modelBlocks}
            vizBlocks={vizBlocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
          />

          {/* Inline Viz Results Area */}
          {vizBlocks.some((b) => b.status === 'completed' && b.result) && (
            <VizResultsArea vizBlocks={vizBlocks} />
          )}
        </div>

        <PropertiesPanel
          block={selectedBlock}
          sequenceBlocks={sequenceBlocks}
          modelBlocks={modelBlocks}
          onUpdateBlock={updateBlock}
          onRemoveBlock={removeBlock}
          onSubmitSequence={submitSequence}
          onRunViz={runVisualization}
        />
      </div>
    </div>
  );
};

// ==================== VizResultsArea ====================
// Renders actual visualization results inline below the canvas

interface VizResultsAreaProps {
  vizBlocks: VisualizationBlock[];
}

const VizResultsArea: React.FC<VizResultsAreaProps> = ({
  vizBlocks,
}) => {
  const completedViz = vizBlocks.filter((b) => b.status === 'completed' && b.result);

  if (completedViz.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--ws-surface)',
        borderTop: '1px solid var(--ws-border)',
        padding: 16,
        maxHeight: '50vh',
        overflow: 'auto',
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--ws-text-primary)',
          margin: '0 0 12px 0',
        }}
      >
        Visualization Results
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {completedViz.map((vizBlock) => {
            const colorIdx = getBindingColorIndex(vizBlock.boundModelId);
            const colors = colorIdx >= 0 ? BINDING_COLORS[colorIdx] : null;
            return (
              <div
                key={vizBlock.id}
                style={colors ? {
                  borderLeft: `3px solid ${colors.accent}`,
                  paddingLeft: 12,
                  background: colors.bg,
                  borderRadius: 4,
                } : {}}
              >
                <VizRenderer vizBlock={vizBlock} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ==================== VizRenderer ====================

interface VizRendererProps {
  vizBlock: VisualizationBlock;
}

const VizRenderer: React.FC<VizRendererProps> = ({ vizBlock }) => {
  if (!vizBlock.result) {
    return (
      <div className="viz-result-placeholder">
        <div className="placeholder-icon">📊</div>
        <div>No results available</div>
      </div>
    );
  }

  const vizType = vizBlock.vizType;

  // Render based on visualization type
  try {
    switch (vizType) {
      case 'classification':
        return (
          <div style={{ border: '1px solid var(--ws-border)', borderRadius: 8, padding: 12, background: 'white' }}>
            <ClassificationViz data={vizBlock.result.classification} />
          </div>
        );
      case 'attention':
        return (
          <div style={{ border: '1px solid var(--ws-border)', borderRadius: 8, padding: 12, background: 'white' }}>
            <AttentionViz data={vizBlock.result.attention} />
          </div>
        );
      case 'gcn-graph':
        return (
          <div style={{ border: '1px solid var(--ws-border)', borderRadius: 8, padding: 12, background: 'white' }}>
            <GcnViz data={vizBlock.result.gcn} />
          </div>
        );
      case 'gcn-message-passing':
        return (
          <div style={{ border: '1px solid var(--ws-border)', borderRadius: 8, padding: 12, background: 'white' }}>
            <TargetGcnViz targetNodeIdx={vizBlock.params.targetNodeIdx || 0} />
          </div>
        );
      case 'integrated-gradients':
        return (
          <div style={{ border: '1px solid var(--ws-border)', borderRadius: 8, padding: 12, background: 'white' }}>
            <IntegratedGradientsViz />
          </div>
        );
      case 'model-graph':
        return (
          <div style={{ border: '1px solid var(--ws-border)', borderRadius: 8, padding: 12, background: 'white' }}>
            <ModelViz />
          </div>
        );
      default:
        return (
          <div className="viz-result-placeholder">
            <div className="placeholder-icon">❓</div>
            <div>Unknown visualization type: {vizType}</div>
          </div>
        );
    }
  } catch (e: any) {
    return (
      <div style={{ padding: 16, background: '#f0dede', borderRadius: 8 }}>
        <strong>Error rendering {vizType}:</strong> {e.message}
      </div>
    );
  }
};

export default WorkspacePage;
