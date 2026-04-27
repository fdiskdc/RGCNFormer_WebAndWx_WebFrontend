/**
 * PuzzleLibrary - Left sidebar containing available blocks that can be added to the workspace.
 */

import React from 'react';
import { VIZ_TYPE_REGISTRY, DATASET_OPTIONS, DATASET_LABELS } from './types';
import type { VizType, DatasetType } from './types';

interface PuzzleLibraryProps {
  onAddSequence: (dataset: DatasetType) => void;
  onAddViz: (vizType: VizType) => void;
}

const DATASET_ICONS: Record<DatasetType, string> = {
  Human: '🧬',
  Plant: '🌱',
  '3Gen': '🧬',
};

const PuzzleLibrary: React.FC<PuzzleLibraryProps> = ({ onAddSequence, onAddViz }) => {
  return (
    <div className="puzzle-library">
      <h3>Input Blocks</h3>
      {DATASET_OPTIONS.map((dataset) => (
        <div
          key={dataset}
          className="puzzle-item"
          onClick={() => onAddSequence(dataset)}
        >
          <div className="puzzle-item-icon input">{DATASET_ICONS[dataset]}</div>
          <div className="puzzle-item-text">
            <span className="puzzle-item-name">{DATASET_LABELS[dataset]}</span>
            <span className="puzzle-item-desc">RNA sequence — {dataset} dataset</span>
          </div>
        </div>
      ))}

      <h3>Visualization Blocks</h3>
      {VIZ_TYPE_REGISTRY.map((viz) => (
        <div
          key={viz.key}
          className="puzzle-item"
          onClick={() => onAddViz(viz.key)}
        >
          <div className="puzzle-item-icon viz">{viz.icon}</div>
          <div className="puzzle-item-text">
            <span className="puzzle-item-name">{viz.label}</span>
            <span className="puzzle-item-desc">{viz.description.slice(0, 30)}...</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PuzzleLibrary;
