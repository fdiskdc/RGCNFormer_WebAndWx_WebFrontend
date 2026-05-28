/**
 * Unified API client for DCPRES backend
 * Centralized API endpoint management
 */

// ==================== Import from Config ====================

import { ENDPOINTS, DEFAULT_HEADERS } from '../../config/api.config';
import { uuidv7 } from './uuidv7';

// ==================== Type Definitions ====================

export interface ResultData {
  jobId: string;
  status: 'completed' | 'processing' | 'failed' | 'unknown' | 'RETRY';
  classification?: any;
  attention?: {
    sequence: string;
    weights: Array<{
      index: number;
      type: string;
      score: number;
    }>;
  };
  gcn?: {
    nodes: Array<{
      id: string;
      label: string;
      data: {
        index: number;
        type: string;
        name: string;
      };
    }>;
    edges: Array<{
      source: string;
      target: string;
    }>;
  };
  error?: string;
  errorType?: string;
  step?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

export type DatasetType = 'Human' | 'Plant' | '3Gen';

export interface SubmitTaskRequest {
  userId: string;
  rnaSequence: string;
  dataset?: DatasetType;
  datasetIndex?: number;
  jobId?: string;
}

export interface SubmitTaskResponse {
  jobId: string;
  status: string;
  message?: string;
  classification?: any;
  attention?: any;
  gcn?: any;
  integratedGradients?: any;
}

export interface IntegratedGradientsRequest {
  rnaSequence: string;
  targetClassId: number;
}

export interface GcnAggregationRequest {
  rnaSequence: string;
  targetNodeIdx: number;
}

export interface CompareData {
  models: Array<{
    name: string;
    display_name: string;
    metrics: Record<string, number>;
  }>;
  metric_names: string[];
}

export interface RgcnformerHeatmapData {
  model_name: string;
  classes: string[];
  metric_names: string[];
  data: Array<Record<string, string | number>>;
}

export interface DatasetComparisonData {
  dataset_names: string[];
  metric_names: string[];
  model_names: string[];
  row_labels: string[];
  data: Array<Record<string, string | number | null>>;
}

export interface RgcnformerLocalizationData {
  model_name: string;
  classes: string[];
  class_names: string[];
  k_labels: string[];
  k_values: number[];
  heatmap: number[][];
  statistics: Array<{
    class: string;
    Mean: number;
    Median: number;
    Mode: number;
    Mode_Ratio: number;
    Sequence_Count: number;
    Min_Value: number;
    Max_Value: number;
    Standard_Deviation: number;
  }>;
}

export interface LocComparisonData {
  models: Array<{
    name: string;
    display_name: string;
    classes: string[];
    class_names: string[];
    heatmap: number[][];
  }>;
  k_labels: string[];
  k_values: number[];
  class_names: string[];
}

export interface UmapPoint {
  u1: number;
  u2: number;
  label: string;
  group: string;
  seq: string;
  probs: number[];
}

export interface DensityContour {
  level: number;
  polygons: number[][][];
}

export interface UmapMetadata {
  n_per_class: number;
  total_points: number;
  valid_classes: number[];
  color_map: Record<string, string>;
  group_colors: Record<string, string>;
  label_names: string[];
  group_mapping: Record<string, number[]>;
  label_num_samples: Record<string, number>;
  subsampled?: boolean;
}

export interface UmapData {
  points: UmapPoint[];
  density_contours: Record<string, DensityContour[]>;
  metadata: UmapMetadata;
}

// ==================== Utility Functions ====================

/**
 * Generate a time-sortable UUID v7 job identifier
 */
export function generateJobId(): string {
  return uuidv7();
}

/**
 * Create standardized error object
 */
async function createApiError(response: Response): Promise<ApiError> {
  const error: ApiError = {
    message: `HTTP ${response.status}: ${response.statusText}`,
    status: response.status,
  };

  try {
    const errorData = await response.json();
    error.detail = errorData.error || errorData.detail;
  } catch {
    // Ignore JSON parsing errors for error responses
  }

  return error;
}

/**
 * Check if result data indicates processing is still in progress
 */
export function isProcessing(data: ResultData | undefined): boolean {
  if (!data) return false;
  return data.status === 'processing' || data.status === 'unknown' || data.status === 'RETRY';
}

/**
 * Check if result data indicates success
 */
export function isCompleted(data: ResultData | undefined): boolean {
  if (!data) return false;
  return data.status === 'completed' || !!data.classification;
}

/**
 * Check if result data indicates failure
 */
export function isFailed(data: ResultData | undefined): boolean {
  if (!data) return false;
  return data.status === 'failed' || !!data.error;
}

/**
 * Get error message from result data
 */
export function getErrorMessage(data: ResultData | undefined): string | null {
  if (!data) return null;
  if (data.error) return data.error;
  return null;
}

// ==================== API Functions ====================

/**
 * Submit a new task for processing
 */
export async function submitTask(request: SubmitTaskRequest): Promise<SubmitTaskResponse> {
  const response = await fetch(ENDPOINTS.SUBMIT_TASK, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch result by job ID
 */
export async function fetchResult(jobId: string): Promise<ResultData> {
  const response = await fetch(ENDPOINTS.GET_RESULT(jobId));

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch model graph data
 */
export async function fetchModelGraph(): Promise<any> {
  const response = await fetch(ENDPOINTS.MODEL_GRAPH);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch integrated gradients data
 */
export async function fetchIntegratedGradients(request: IntegratedGradientsRequest): Promise<any> {
  const response = await fetch(ENDPOINTS.INTEGRATED_GRADIENTS, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch GCN aggregation visualization data
 */
export async function fetchGcnAggregation(request: GcnAggregationRequest): Promise<any> {
  const response = await fetch(ENDPOINTS.VISUALIZE_GCN_AGGREGATION, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch model comparison data
 */
export async function fetchModelComparison(): Promise<CompareData> {
  const response = await fetch(ENDPOINTS.MODEL_COMPARISON);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch DCPRES classification heatmap data
 */
export async function fetchRgcnformerHeatmap(): Promise<RgcnformerHeatmapData> {
  const response = await fetch(ENDPOINTS.RGCNFORMER_CLASSIFICATION_HEATMAP);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch dataset comparison heatmap data
 */
export async function fetchDatasetComparison(): Promise<DatasetComparisonData> {
  const response = await fetch(ENDPOINTS.DATASET_COMPARISON);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch DCPRES localization data
 */
export async function fetchRgcnformerLocalization(): Promise<RgcnformerLocalizationData> {
  const response = await fetch(ENDPOINTS.RGCNFORMER_LOCALIZATION);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch DCPRES localization comparison data
 */
export async function fetchRgcnformerLocComparison(): Promise<LocComparisonData> {
  const response = await fetch(ENDPOINTS.RGCNFORMER_LOC_COMPARISON);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

export async function fetchUmapData(): Promise<UmapData> {
  const response = await fetch(ENDPOINTS.UMAP_DATA);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

export async function fetchCoraUmapData(): Promise<UmapData> {
  const response = await fetch(ENDPOINTS.UMAP_CORA_DATA);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Fetch a random sample sequence for workspace input block
 */
export async function fetchSampleSequence(): Promise<{ sequence: string }> {
  const response = await fetch(ENDPOINTS.SAMPLE_SEQUENCE);

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

/**
 * Legacy predict function (hardcoded localhost - consider updating)
 */
export async function predict(request: any): Promise<any> {
  const response = await fetch(ENDPOINTS.PREDICT, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
}

// ==================== Export Constants ====================
export { ENDPOINTS };
