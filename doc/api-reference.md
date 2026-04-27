# RGCNFormer Web Frontend API Reference

## Overview

API endpoint configuration is centralized in `config/api.config.ts`.

| Parameter | Config Key | Default | Env Override |
|-----------|------------|---------|--------------|
| Base URL | `BASE_URL` | `/rgcnformer/api/v1` | `VITE_API_BASE_URL` |
| Content-Type | `DEFAULT_HEADERS` | `application/json` | — |
| Legacy Endpoint | `LEGACY_PREDICT_URL` | `http://localhost:5000/rgcnformer/api/predict` | `VITE_LEGACY_PREDICT_URL` |

During local development, the Vite proxy target is controlled by `PROXY_TARGET`, defaulting to `http://localhost:8000`, which can be overridden via the `VITE_PROXY_TARGET` environment variable.

---

## 1. Submit Task

Submit an RNA sequence for full analysis processing.

| Item | Value |
|------|-------|
| Method | `POST` |
| URL | `/rgcnformer/api/v1/submit-task` |

### Request Body

```json
{
  "userId": "user1",
  "rnaSequence": "TCAGGAGTTCGAGACCAG...",
  "jobId": "optional-custom-job-id"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier |
| `rnaSequence` | `string` | Yes | RNA sequence, valid characters: A/C/G/T/U/N, max 1001 |
| `jobId` | `string` | No | Custom job ID (UUID), auto-generated if omitted |

### Response

```json
{
  "jobId": "abc-123-uuid",
  "status": "completed",
  "message": "optional message",
  "classification": { },
  "attention": { },
  "gcn": { },
  "integratedGradients": { }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `jobId` | `string` | Task identifier for subsequent result polling |
| `status` | `string` | Task status: `completed`, `processing`, etc. |
| `message` | `string?` | Optional status message |
| `classification` | `object?` | Classification tree data (see [Classification Tree](#appendix-a-classification-tree-data)) |
| `attention` | `object?` | Attention weights data (see [Attention Data](#appendix-b-attention-data)) |
| `gcn` | `object?` | GCN graph data (see [GCN Graph Data](#appendix-c-gcn-graph-data)) |

### Callers

- `MainPage.tsx` — initial task submission
- `ClassificationViz.tsx` — fallback when no prop data provided
- `GcnViz.tsx` — fallback when no prop data provided

---

## 2. Get Task Result

Poll for task processing results by job ID.

| Item | Value |
|------|-------|
| Method | `GET` |
| URL | `/rgcnformer/api/v1/results/{jobId}` |

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `jobId` | `string` | Task ID returned from submit-task |

### Response

```json
{
  "jobId": "abc-123-uuid",
  "status": "completed",
  "classification": { },
  "attention": { },
  "gcn": { },
  "error": null,
  "errorType": null,
  "step": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `jobId` | `string` | Task identifier |
| `status` | `string` | `completed` \| `processing` \| `failed` \| `unknown` \| `RETRY` |
| `classification` | `object?` | Classification tree data (see [Appendix A](#appendix-a-classification-tree-data)) |
| `attention` | `object?` | Attention weights data (see [Appendix B](#appendix-b-attention-data)) |
| `gcn` | `object?` | GCN graph data (see [Appendix C](#appendix-c-gcn-graph-data)) |
| `error` | `string?` | Error message when status is `failed` |
| `errorType` | `string?` | Error category for client-side handling |
| `step` | `string?` | Processing step where failure occurred |

### Polling Behavior

- The frontend polls at **3-second intervals** while `status === 'processing'`
- Timeout after **5 minutes** (300s) of continuous processing
- Uses TanStack Query with `refetchInterval` for automatic polling

### Callers

- `ResultsPage.tsx` — primary consumer, polls via TanStack Query

---

## 3. Model Graph

Fetch the RGCNFormer model architecture graph (ONNX model structure).

| Item | Value |
|------|-------|
| Method | `GET` |
| URL | `/rgcnformer/api/v1/model-graph` |

### Request

No request body or parameters.

### Response

```json
{
  "nodes": [
    {
      "id": "node_1",
      "label": "Conv",
      "attributes": {
        "kernel_shape": "[3, 3]",
        "strides": "[1, 1]"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_0",
      "target": "node_1"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `nodes` | `array` | Model graph nodes |
| `nodes[].id` | `string` | Unique node identifier (ONNX node name) |
| `nodes[].label` | `string` | ONNX op_type (e.g., `Conv`, `Gemm`, `Relu`) |
| `nodes[].attributes` | `object?` | Node attributes (key-value pairs) |
| `edges` | `array` | Directed edges connecting nodes |
| `edges[].id` | `string?` | Edge identifier (optional) |
| `edges[].source` | `string` | Source node ID |
| `edges[].target` | `string` | Target node ID |

### Callers

- `ModelViz.tsx` — renders interactive React Flow diagram with Dagre auto-layout

---

## 4. Integrated Gradients

Fetch integrated gradients attribution graph for explainability analysis.

| Item | Value |
|------|-------|
| Method | `POST` |
| URL | `/rgcnformer/api/v1/integrated-gradients` |

### Request Body

```json
{
  "rnaSequence": "TCAGGAGTTCGAG...",
  "targetClassId": 0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rnaSequence` | `string` | Yes | RNA sequence to analyze |
| `targetClassId` | `integer` | Yes | Target RNA modification class index (0–11), see [Appendix D](#appendix-d-rna-modification-class-indices) |

### Response

```json
{
  "nodes": [
    {
      "id": "node_0",
      "label": "A0",
      "data": {
        "index": 0,
        "type": "A",
        "name": "Nucleotide 0",
        "attributionScore": 0.0452
      }
    }
  ],
  "edges": [
    {
      "source": "node_0",
      "target": "node_1"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `nodes` | `array` | Graph nodes with attribution data |
| `nodes[].id` | `string` | Unique node identifier |
| `nodes[].data.index` | `integer` | Position index in the RNA sequence |
| `nodes[].data.type` | `string` | Nucleotide type (A/C/G/U) |
| `nodes[].data.name` | `string` | Human-readable name |
| `nodes[].data.attributionScore` | `number?` | Attribution score for the target class (higher = more influential) |
| `edges` | `array` | Graph edges |
| `edges[].source` | `string` | Source node ID |
| `edges[].target` | `string` | Target node ID |

### Callers

- `IntegratedGradientsViz.tsx` — renders 3D force-graph with top-N highlighting

---

## 5. GCN Aggregation Visualization

Visualize message passing through GCN layers for a specific target node.

| Item | Value |
|------|-------|
| Method | `POST` |
| URL | `/rgcnformer/api/v1/visualize-gcn-aggregation` |

### Request Body

```json
{
  "rnaSequence": "TCAGGAGTTCGAG...",
  "targetNodeIdx": 0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rnaSequence` | `string` | Yes | RNA sequence to analyze |
| `targetNodeIdx` | `integer` | Yes | Index of the target nucleotide in the sequence (0-based) |

### Response

```json
{
  "targetNode": 0,
  "nodes": [
    {
      "id": "node_0",
      "data": {
        "index": 0,
        "type": "A"
      }
    }
  ],
  "edges": [
    {
      "source": "node_0",
      "target": "node_1"
    }
  ],
  "aggregationData": [
    {
      "layer": 0,
      "messages": [
        { "from": 1, "strength": 0.75 },
        { "from": 4, "strength": 0.32 }
      ]
    },
    {
      "layer": 1,
      "messages": [
        { "from": 2, "strength": 0.58 }
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `targetNode` | `integer` | Confirmed target node index |
| `nodes` | `array` | Graph nodes |
| `nodes[].id` | `string` | Unique node identifier |
| `nodes[].data.index` | `integer` | Position in the RNA sequence |
| `nodes[].data.type` | `string` | Nucleotide type (A/C/G/U) |
| `edges` | `array` | Graph edges (source → target) |
| `aggregationData` | `array` | Per-layer aggregation details |
| `aggregationData[].layer` | `integer` | GCN layer index (0-based) |
| `aggregationData[].messages` | `array` | Messages received at this layer |
| `aggregationData[].messages[].from` | `integer` | Source node index sending the message |
| `aggregationData[].messages[].strength` | `number` | Message strength/weight (0–1 normalized) |

### Callers

- `TargetGcnViz.tsx` — renders 3D force-graph with N-hop neighbor coloring

---

## 6. Predict (Legacy)

Legacy prediction endpoint currently hardcoded to localhost. Used primarily by Attention visualization.

| Item | Value |
|------|-------|
| Method | `POST` |
| URL | `http://localhost:5000/rgcnformer/api/predict` |

> **Note**: This endpoint should be migrated to the unified base URL `/rgcnformer/api/v1/predict`.

### Request Body

```json
{
  "sequence": "TCAGGAGTTCGAG..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sequence` | `string` | Yes | RNA sequence to analyze |

### Response

```json
{
  "attention": {
    "sequence": "TCAGGAGTTCGAG...",
    "weights": [
      {
        "index": 42,
        "type": "A",
        "score": 0.004532
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `attention` | `object` | Attention data wrapper |
| `attention.sequence` | `string` | The analyzed RNA sequence |
| `attention.weights` | `array` | Attention weights for each position |
| `attention.weights[].index` | `integer` | Position in the sequence |
| `attention.weights[].type` | `string` | Nucleotide type (A/C/G/U) at that position |
| `attention.weights[].score` | `number` | Raw attention score |

### Callers

- `AttentionViz.tsx` — primary consumer for attention weight display

---

## 7. Workspace Task Runner (Planned)

The Workspace page currently uses mock data (`createMockTaskRunner` in `mockData.ts`). In production, the sequence submission flow will call `POST /rgcnformer/api/v1/submit-task` and then poll `GET /rgcnformer/api/v1/results/{jobId}`.

### Sequence Submission Flow

1. **POST** `/rgcnformer/api/v1/submit-task` — with `userId`, `rnaSequence`, `dataset`
2. Status transitions: `idle → submitting → queued → processing → completed`
3. **GET** `/rgcnformer/api/v1/results/{jobId}` — poll until completed
4. Results contain: `classification`, `attention`, `gcn`

### Run Visualization Flow

Each visualization type on the workspace delegates to the corresponding API:

| Visualization | API Call |
|---------------|----------|
| Classification | Uses result from submit-task |
| Attention | Uses result from submit-task |
| GCN Graph | Uses result from submit-task |
| GCN Message Passing | `POST /rgcnformer/api/v1/visualize-gcn-aggregation` |
| Integrated Gradients | `POST /rgcnformer/api/v1/integrated-gradients` |
| Model Graph | `GET /rgcnformer/api/v1/model-graph` |

---

## Error Responses

All endpoints return standard HTTP error codes with a JSON body:

```json
{
  "error": "Human-readable error description",
  "detail": "Optional technical detail"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `200` | Success |
| `400` | Bad request (invalid input) |
| `404` | Resource not found (invalid jobId) |
| `500` | Internal server error |

---

## Appendix A: Classification Tree Data

```typescript
interface ClassificationData {
  name: string;             // Node name (e.g., "Root", "A", "Am")
  isPredicted: boolean;     // Whether this node is a predicted modification
  children: ClassificationData[];  // Child nodes forming the tree hierarchy
}
```

The root node is typically `"Root"`. First-level children are nucleotide groups (A/C/G/U). Second-level children are specific modification types. Predicted modifications have `isPredicted: true`.

---

## Appendix B: Attention Data

```typescript
interface AttentionData {
  sequence: string;         // Full RNA sequence
  weights: Array<{
    index: number;          // Position in the sequence
    type: string;           // Nucleotide type (A/C/G/U)
    score: number;          // Attention weight score (raw)
  }>;
}
```

---

## Appendix C: GCN Graph Data

```typescript
interface GcnGraphData {
  nodes: Array<{
    id: string;             // Node identifier (e.g., "node_0")
    label: string;          // Display label (e.g., "A0")
    data: {
      index: number;        // Sequence position
      type: string;         // Nucleotide type
      name: string;         // Human-readable name
    };
  }>;
  edges: Array<{
    source: string;         // Source node ID
    target: string;         // Target node ID
  }>;
}
```

Edges include:
- **Backbone edges**: consecutive positions (i → i+1)
- **Pairing/structural edges**: non-consecutive nucleotide interactions

---

## Appendix D: RNA Modification Class Indices

12 RNA modification types, indexed 0–11:

| Index | Name | Nucleotide | Description |
|-------|------|------------|-------------|
| 0 | Am | A | 2'-O-methyladenosine |
| 1 | Atol | A | Adenosine-to-inosine |
| 2 | Cm | C | 2'-O-methylcytidine |
| 3 | Gm | G | 2'-O-methylguanosine |
| 4 | Tm | U | 2'-O-methyluridine |
| 5 | Y | U | Pseudouridine |
| 6 | ac4C | C | N4-acetylcytidine |
| 7 | m1A | A | N1-methyladenosine |
| 8 | m5C | C | 5-methylcytidine |
| 9 | m6A | A | N6-methyladenosine |
| 10 | m6Am | A | N6,2'-O-dimethyladenosine |
| 11 | m7G | G | 7-methylguanosine |

---

## Appendix E: Dataset Types

Three supported datasets, passed to the backend via task submission context:

| Dataset | Label |
|---------|-------|
| `Human` | Human RNA modification dataset |
| `Plant` | Plant RNA modification dataset |
| `3Gen` | Third-generation sequencing dataset |
