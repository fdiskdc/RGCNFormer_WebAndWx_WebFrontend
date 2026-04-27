/**
 * WorkspaceCanvas - Center canvas divided into three zones: Input, Model, Visualization.
 */

import React from 'react';
import type { SequenceBlock, ModelBlock, VisualizationBlock } from './types';
import SequenceBlockCard from './SequenceBlockCard';
import ModelBlockCard from './ModelBlockCard';
import VizBlockCard from './VizBlockCard';

interface WorkspaceCanvasProps {
  sequenceBlocks: SequenceBlock[];
  modelBlocks: ModelBlock[];
  vizBlocks: VisualizationBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  sequenceBlocks,
  modelBlocks,
  vizBlocks,
  selectedBlockId,
  onSelectBlock,
}) => {
  return (
    <div className="workspace-canvas">
      {/* Input Zone */}
      <div className="canvas-zone zone-input">
        <div className="canvas-zone-label">
          <span className="zone-dot" />
          Input Zone
        </div>
        <div className="canvas-zone-content">
          {sequenceBlocks.length === 0 ? (
            <div className="zone-empty">
              Click a dataset (Human/Plant/3Gen) in the puzzle library to add a sequence block
            </div>
          ) : (
            sequenceBlocks.map((block) => (
              <SequenceBlockCard
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onClick={() => onSelectBlock(block.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Model Zone */}
      <div className="canvas-zone zone-model">
        <div className="canvas-zone-label">
          <span className="zone-dot" />
          Model Zone
        </div>
        <div className="canvas-zone-content">
          {modelBlocks.map((block) => {
            const boundSeqIds = sequenceBlocks
              .filter((s) => s.boundModelId === block.id)
              .map((s) => s.id);
            return (
              <ModelBlockCard
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onClick={() => onSelectBlock(block.id)}
                boundSequenceIds={boundSeqIds}
              />
            );
          })}
        </div>
      </div>

      {/* Visualization Zone */}
      <div className="canvas-zone zone-visualization">
        <div className="canvas-zone-label">
          <span className="zone-dot" />
          Visualization Zone
        </div>
        <div className="canvas-zone-content">
          {vizBlocks.length === 0 ? (
            <div className="zone-empty">
              Click visualization blocks in the puzzle library to add them here
            </div>
          ) : (
            vizBlocks.map((block) => {
              const boundSeq = sequenceBlocks.find((s) => s.id === block.boundSequenceId);
              return (
                <VizBlockCard
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onClick={() => onSelectBlock(block.id)}
                  modelBlocks={modelBlocks}
                  boundSequenceLabel={boundSeq ? `${boundSeq.title} (${boundSeq.dataset})` : undefined}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCanvas;