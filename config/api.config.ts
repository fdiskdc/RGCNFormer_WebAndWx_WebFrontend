/**
 * Centralized API configuration for RGCNFormer frontend
 * All API-related constants should be configured here
 */

/// <reference types="vite/client" />

// ==================== Base URL Configuration ====================

export const DEFAULT_BASE_URL = '/rgcnformer/api/v1';
export const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ?? DEFAULT_BASE_URL;

// ==================== Default Headers ====================

export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
} as const;

// ==================== Legacy Endpoint Configuration ====================

export const DEFAULT_LEGACY_PREDICT_URL = 'http://localhost:5000/rgcnformer/api/predict';
export const LEGACY_PREDICT_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LEGACY_PREDICT_URL) ?? DEFAULT_LEGACY_PREDICT_URL;

// ==================== API Endpoints ====================

export const ENDPOINTS = {
    SUBMIT_TASK: `${BASE_URL}/submit-task`,
    GET_RESULT: (jobId: string) => `${BASE_URL}/results/${jobId}`,
    MODEL_GRAPH: `${BASE_URL}/model-graph`,
    INTEGRATED_GRADIENTS: `${BASE_URL}/integrated-gradients`,
    VISUALIZE_GCN_AGGREGATION: `${BASE_URL}/visualize-gcn-aggregation`,
    PREDICT: LEGACY_PREDICT_URL,
} as const;

// ==================== Vite Proxy Configuration ====================

export const DEFAULT_PROXY_TARGET = 'http://localhost:8000';
export const PROXY_TARGET = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PROXY_TARGET) ?? DEFAULT_PROXY_TARGET;

// ==================== TypeScript Interface ====================

export interface ApiConfig {
    baseUrl: string;
    defaultHeaders: typeof DEFAULT_HEADERS;
    legacyPredictUrl: string;
    proxyTarget: string;
    endpoints: typeof ENDPOINTS;
}
