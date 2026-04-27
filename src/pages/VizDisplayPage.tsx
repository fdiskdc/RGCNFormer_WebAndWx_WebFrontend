/**
 * VizDisplayPage - Full-screen visualization display interface.
 * Receives completed visualization data from the workspace and renders all results.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { SequenceBlock, VisualizationBlock } from '../components/workspace/types';

import ClassificationViz from './ClassificationViz';
import AttentionViz from './AttentionViz';
import GcnViz from './GcnViz';
import TargetGcnViz from './TargetGcnViz';
import IntegratedGradientsViz from './IntegratedGradientsViz';
import ModelViz from './ModelViz';

interface VizDisplayState {
  sequenceBlocks: SequenceBlock[];
  vizBlocks: VisualizationBlock[];
}

const VizDisplayPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as VizDisplayState | null;

  if (!state || !state.vizBlocks || state.vizBlocks.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f3ef',
        color: '#7d7872',
        gap: 16,
      }}>
        <div style={{ fontSize: 48, opacity: 0.4 }}>📊</div>
        <p>No visualization data available.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 24px',
            border: 'none',
            borderRadius: 6,
            background: '#8a9eb5',
            color: 'white',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Back to Workspace
        </button>
      </div>
    );
  }

  const { sequenceBlocks, vizBlocks } = state;

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f3ef',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
        background: '#ffffff',
        borderBottom: '1px solid #ddd8d2',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleBack}
            style={{
              padding: '6px 16px',
              border: '1px solid #ddd8d2',
              borderRadius: 6,
              background: '#f5f3ef',
              color: '#3a3632',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <h1 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#3a3632',
            margin: 0,
          }}>
            📊 Visualization Display
          </h1>
        </div>
        <div style={{ fontSize: 12, color: '#a8a29e' }}>
          {vizBlocks.length} visualization{vizBlocks.length > 1 ? 's' : ''} · {sequenceBlocks.length} sequence source{vizBlocks.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: 24,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {vizBlocks.map((vizBlock) => {
          if (!vizBlock.result) return null;

          const seqBlock = sequenceBlocks.find((s) => s.id === vizBlock.boundSequenceId);
          const vizTitle = vizBlock.title || vizBlock.vizType;

          return (
            <div
              key={vizBlock.id}
              style={{
                background: '#ffffff',
                border: '1px solid #ddd8d2',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* Viz Block Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#faf9f7',
                borderBottom: '1px solid #ece8e3',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#3a3632' }}>
                  {vizTitle}
                </div>
                <div style={{ fontSize: 11, color: '#a8a29e' }}>
                  {seqBlock ? `Source: ${seqBlock.title} (${seqBlock.dataset})` : 'No source'}
                </div>
              </div>

              {/* Viz Block Content */}
              <div style={{ padding: 16 }}>
                <VizDisplayContent vizBlock={vizBlock} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== Viz Display Content ====================

interface VizDisplayContentProps {
  vizBlock: VisualizationBlock;
}

const VizDisplayContent: React.FC<VizDisplayContentProps> = ({ vizBlock }) => {
  const vizType = vizBlock.vizType;

  if (!vizBlock.result) {
    return <div style={{ color: '#a8a29e', textAlign: 'center', padding: 40 }}>No result data</div>;
  }

  try {
    switch (vizType) {
      case 'classification':
        return <ClassificationViz data={vizBlock.result.classification} />;
      case 'attention':
        return <AttentionViz data={vizBlock.result.attention} />;
      case 'gcn-graph':
        return <GcnViz data={vizBlock.result.gcn} />;
      case 'gcn-message-passing':
        return (
          <TargetGcnViz targetNodeIdx={vizBlock.params.targetNodeIdx || 0} />
        );
      case 'integrated-gradients':
        return <IntegratedGradientsViz />;
      case 'model-graph':
        return <ModelViz />;
      default:
        return (
          <div style={{ color: '#a8a29e', textAlign: 'center', padding: 40 }}>
            Unknown visualization type: {vizType}
          </div>
        );
    }
  } catch (e: any) {
    return (
      <div style={{ padding: 16, background: '#f0dede', borderRadius: 8, color: '#c48a8a' }}>
        <strong>Error rendering {vizType}:</strong> {e.message}
      </div>
    );
  }
};

export default VizDisplayPage;
