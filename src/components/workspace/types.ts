/**
 * Workspace Block Type Definitions
 * Defines the core data structures for the puzzle-style analysis workbench.
 */

// ==================== Dataset Types ====================

export type DatasetType = 'Human' | 'Plant' | '3Gen';

export const DATASET_OPTIONS: DatasetType[] = ['Human', 'Plant', '3Gen'];

export const DATASET_LABELS: Record<DatasetType, string> = {
  Human: 'Human',
  Plant: 'Plant',
  '3Gen': '3Gen',
};

// ==================== Block Types ====================

export type BlockType = 'sequence' | 'model' | 'visualization';

// ==================== Sequence Block ====================

export type SequenceStatus = 'idle' | 'validating' | 'validated' | 'submitting' | 'submitted' | 'queued' | 'processing' | 'completed' | 'failed';

export interface SequenceBlock {
  id: string;
  type: 'sequence';
  title: string;
  dataset: DatasetType;
  sequenceCount: number;
  sequence: string;
  status: SequenceStatus;
  jobId: string | null;
  resultSummary: {
    classification: any;
    attention: any;
    gcn: any;
  } | null;
  boundModelId: string | null;
}

// ==================== Model Block ====================

export type ModelStatus = 'available' | 'disabled' | 'loading';

export interface ModelBlock {
  id: string;
  type: 'model';
  title: string;
  modelName: string;
  status: ModelStatus;
  description: string;
  version: string;
}

// ==================== Visualization Block ====================

export type VizType =
  | 'classification'
  | 'attention'
  | 'gcn-graph'
  | 'gcn-message-passing'
  | 'integrated-gradients'
  | 'model-graph';

export type VizStatus = 'idle' | 'ready' | 'running' | 'completed' | 'failed';

export interface VisualizationBlock {
  id: string;
  type: 'visualization';
  title: string;
  vizType: VizType;
  status: VizStatus;
  boundSequenceId: string | null;
  boundModelId: string | null;
  params: Record<string, any>;
  result: any | null;
  autoRun: boolean;
}

// ==================== Union Block Type ====================

export type WorkspaceBlock = SequenceBlock | ModelBlock | VisualizationBlock;

// ==================== Canvas Zone ====================

export type CanvasZone = 'input' | 'model' | 'visualization';

// ==================== Visualization Metadata ====================

export interface VizTypeMeta {
  key: VizType;
  label: string;
  icon: string;
  description: string;
  defaultParams: Record<string, any>;
}

export const VIZ_TYPE_REGISTRY: VizTypeMeta[] = [
  {
    key: 'classification',
    label: 'Classification',
    icon: '🌳',
    description: 'Hierarchical classification tree showing model prediction paths.',
    defaultParams: {},
  },
  {
    key: 'attention',
    label: 'Attention',
    icon: '👁',
    description: 'Attention weight visualization highlighting important sequence positions.',
    defaultParams: { topX: 3, modificationType: 'all' },
  },
  {
    key: 'gcn-graph',
    label: 'GCN Graph',
    icon: '🔗',
    description: '3D graph structure of RNA sequence as processed by GCN.',
    defaultParams: {},
  },
  {
    key: 'gcn-message-passing',
    label: 'GCN Message Passing',
    icon: '📡',
    description: 'Message propagation through GCN layers for a target node.',
    defaultParams: { targetNodeIdx: 0 },
  },
  {
    key: 'integrated-gradients',
    label: 'Integrated Gradients',
    icon: '📈',
    description: 'Attribution scores showing which nodes contribute most to predictions.',
    defaultParams: { targetClassId: 0, topN: 10 },
  },
  {
    key: 'model-graph',
    label: 'Model Graph',
    icon: '🧠',
    description: 'Interactive data flow visualization of the model architecture.',
    defaultParams: {},
  },
];

// ==================== Binding Colors ====================

export interface BindingColor {
  border: string;
  bg: string;
  accent: string;
  tag: string;
}

export const BINDING_COLORS: BindingColor[] = [
  { border: '#c4a48f', bg: '#fdf6f2', accent: '#b8927a', tag: '#9a7a6a' },  // Dusty Rose
  { border: '#8fae8f', bg: '#f2f8f2', accent: '#7a9c7a', tag: '#6b8a6b' },  // Sage
  { border: '#8a9eb5', bg: '#f0f4f8', accent: '#7890a8', tag: '#637d94' },  // Slate Blue
  { border: '#b5a08a', bg: '#f8f4f0', accent: '#a8906e', tag: '#8a7660' },  // Warm Tan
  { border: '#a08ab5', bg: '#f4f0f8', accent: '#8a74a8', tag: '#7260a0' },  // Lavender
  { border: '#8ab5a0', bg: '#f0f8f4', accent: '#74a88a', tag: '#609a72' },  // Mint
  { border: '#b58a8a', bg: '#f8f0f0', accent: '#a87474', tag: '#9a6060' },  // Blush
  { border: '#a0b58a', bg: '#f4f8f0', accent: '#8aa874', tag: '#729a60' },  // Olive
];

/**
 * Compute a stable binding color index for a model ID.
 * All blocks bound to the same model share the same color scheme.
 */
export function getBindingColorIndex(modelId: string | null): number {
  if (!modelId) return -1;
  // Simple hash from string to get a stable index
  let hash = 0;
  for (let i = 0; i < modelId.length; i++) {
    hash = ((hash << 5) - hash + modelId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % BINDING_COLORS.length;
}

// ==================== Task Execution ====================

export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface TaskRecord {
  id: string;
  sequenceBlockId: string;
  status: TaskStatus;
  createdAt: number;
  completedAt: number | null;
  result: any | null;
  error: string | null;
}