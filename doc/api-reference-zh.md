# RGCNFormer Web 前端 API 参考文档

## 概述

API 端点配置统一由 `config/api.config.ts` 管理。

| 参数 | 配置项 | 默认值 | 环境变量覆盖 |
|------|--------|--------|--------------|
| 基础 URL | `BASE_URL` | `/rgcnformer/api/v1` | `VITE_API_BASE_URL` |
| Content-Type | `DEFAULT_HEADERS` | `application/json` | — |
| 旧版端点 | `LEGACY_PREDICT_URL` | `http://localhost:5000/rgcnformer/api/predict` | `VITE_LEGACY_PREDICT_URL` |

本地开发时，Vite 代理目标由 `PROXY_TARGET` 控制，默认 `http://localhost:8000`，可通过 `VITE_PROXY_TARGET` 环境变量覆盖。

---

## 1. 提交任务

提交数据集条目进行全流程分析处理。

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/rgcnformer/api/v1/submit-task` |

### 请求体

```json
{
  "userId": "user1",
  "dataset": "Human",
  "datasetIndex": 0,
  "jobId": "018f3a2e-9b1c-7000-a1b2-c3d4e5f6a7b8"
}
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `userId` | `string` | 是 | 用户标识 |
| `dataset` | `string` | 是 | 数据集名称：`Human`、`Plant`、`3Gen`（参见[附录E](#附录e数据集类型)） |
| `datasetIndex` | `number` | 是 | 数据集中条目的索引（从 0 开始） |
| `jobId` | `string` | 否 | 任务 ID（UUID v7 格式），由前端自动生成。包含毫秒时间戳前缀，支持按时间排序；省略时后端自动生成 |

### 响应

```json
{
  "jobId": "abc-123-uuid",
  "status": "completed",
  "message": "可选消息",
  "classification": { },
  "attention": { },
  "gcn": { },
  "integratedGradients": { }
}
```

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `jobId` | `string` | 任务标识，用于后续结果轮询 |
| `status` | `string` | 任务状态：`completed`（已完成）、`processing`（处理中）等 |
| `message` | `string?` | 可选状态消息 |
| `classification` | `object?` | 分类树数据（参见[附录A](#附录a分类树数据)） |
| `attention` | `object?` | 注意力权重数据（参见[附录B](#附录b注意力数据)） |
| `gcn` | `object?` | GCN 图数据（参见[附录C](#附录c-gcn-图数据)） |

### 调用位置

- `MainPage.tsx` — 初始任务提交
- `ClassificationViz.tsx` — 无 prop 数据时的回退方式
- `GcnViz.tsx` — 无 prop 数据时的回退方式

---

## 2. 获取任务结果

通过任务 ID 轮询任务处理结果。

| 项目 | 值 |
|------|-----|
| 方法 | `GET` |
| URL | `/rgcnformer/api/v1/results/{jobId}` |

### 路径参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `jobId` | `string` | submit-task 返回的任务 ID |

### 响应

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

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `jobId` | `string` | 任务标识 |
| `status` | `string` | `completed`（已完成）\| `processing`（处理中）\| `failed`（失败）\| `unknown`（未知）\| `RETRY`（重试） |
| `classification` | `object?` | 分类树数据（参见[附录A](#附录a分类树数据)） |
| `attention` | `object?` | 注意力权重数据（参见[附录B](#附录b注意力数据)） |
| `gcn` | `object?` | GCN 图数据（参见[附录C](#附录c-gcn-图数据)） |
| `error` | `string?` | 状态为 `failed` 时的错误信息 |
| `errorType` | `string?` | 错误类别，便于前端处理 |
| `step` | `string?` | 发生失败时的处理步骤 |

### 轮询行为

- 状态为 `processing` 时，前端每 **3 秒**轮询一次
- 连续处理超过 **5 分钟**（300s）后超时
- 使用 TanStack Query 的 `refetchInterval` 实现自动轮询

### 调用位置

- `ResultsPage.tsx` — 主要消费者，通过 TanStack Query 轮询

---

## 3. 模型结构图

获取 RGCNFormer 模型架构图（ONNX 模型结构）。

| 项目 | 值 |
|------|-----|
| 方法 | `GET` |
| URL | `/rgcnformer/api/v1/model-graph` |

### 请求

无请求体或参数。

### 响应

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

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `nodes` | `array` | 模型图节点 |
| `nodes[].id` | `string` | 唯一节点标识（ONNX 节点名） |
| `nodes[].label` | `string` | ONNX 操作类型（如 `Conv`、`Gemm`、`Relu`） |
| `nodes[].attributes` | `object?` | 节点属性（键值对） |
| `edges` | `array` | 节点之间的有向边 |
| `edges[].id` | `string?` | 边标识（可选） |
| `edges[].source` | `string` | 源节点 ID |
| `edges[].target` | `string` | 目标节点 ID |

### 调用位置

- `ModelViz.tsx` — 渲染交互式 React Flow 图，使用 Dagre 自动布局

---

## 4. 积分归因分析

获取积分归因分析图，用于模型可解释性分析。

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/rgcnformer/api/v1/integrated-gradients` |

### 请求体

```json
{
  "rnaSequence": "TCAGGAGTTCGAG...",
  "targetClassId": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `rnaSequence` | `string` | 是 | 待分析的 RNA 序列 |
| `targetClassId` | `integer` | 是 | 目标 RNA 修饰类别索引（0–11），参见[附录D](#附录drna-修饰类别索引) |

### 响应

```json
{
  "nodes": [
    {
      "id": "node_0",
      "label": "A0",
      "data": {
        "index": 0,
        "type": "A",
        "name": "核苷酸 0",
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

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `nodes` | `array` | 带归因数据的图节点 |
| `nodes[].id` | `string` | 唯一节点标识 |
| `nodes[].data.index` | `integer` | RNA 序列中的位置索引 |
| `nodes[].data.type` | `string` | 核苷酸类型（A/C/G/U） |
| `nodes[].data.name` | `string` | 可读名称 |
| `nodes[].data.attributionScore` | `number?` | 目标类别的归因分数（越高表示影响越大） |
| `edges` | `array` | 图边 |
| `edges[].source` | `string` | 源节点 ID |
| `edges[].target` | `string` | 目标节点 ID |

### 调用位置

- `IntegratedGradientsViz.tsx` — 渲染带 Top-N 高亮的 3D 力导向图

---

## 5. GCN 消息聚合可视化

可视化特定目标节点在 GCN 层中的消息传递过程。

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/rgcnformer/api/v1/visualize-gcn-aggregation` |

### 请求体

```json
{
  "rnaSequence": "TCAGGAGTTCGAG...",
  "targetNodeIdx": 0
}
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `rnaSequence` | `string` | 是 | 待分析的 RNA 序列 |
| `targetNodeIdx` | `integer` | 是 | 目标核苷酸在序列中的索引（从 0 开始） |

### 响应

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

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `targetNode` | `integer` | 确认的目标节点索引 |
| `nodes` | `array` | 图节点 |
| `nodes[].id` | `string` | 唯一节点标识 |
| `nodes[].data.index` | `integer` | RNA 序列中的位置 |
| `nodes[].data.type` | `string` | 核苷酸类型（A/C/G/U） |
| `edges` | `array` | 图边（source → target） |
| `aggregationData` | `array` | 每层聚合详情 |
| `aggregationData[].layer` | `integer` | GCN 层索引（从 0 开始） |
| `aggregationData[].messages` | `array` | 该层收到的消息列表 |
| `aggregationData[].messages[].from` | `integer` | 发送消息的源节点索引 |
| `aggregationData[].messages[].strength` | `number` | 消息强度/权重（0–1 归一化值） |

### 调用位置

- `TargetGcnViz.tsx` — 渲染带 N-hop 邻居着色的 3D 力导向图

---

## 6. 预测（旧版接口）

旧版预测端点，目前硬编码指向 localhost，主要由注意力可视化组件使用。

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `http://localhost:5000/rgcnformer/api/predict` |

> **注意**：此端点应迁移至统一基础 URL `/rgcnformer/api/v1/predict`。

### 请求体

```json
{
  "sequence": "TCAGGAGTTCGAG..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `sequence` | `string` | 是 | 待分析的 RNA 序列 |

### 响应

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

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `attention` | `object` | 注意力数据 |
| `attention.sequence` | `string` | 被分析的 RNA 序列 |
| `attention.weights` | `array` | 每个位置的注意力权重 |
| `attention.weights[].index` | `integer` | 序列中的位置 |
| `attention.weights[].type` | `string` | 该位置的核苷酸类型（A/C/G/U） |
| `attention.weights[].score` | `number` | 原始注意力分数 |

### 调用位置

- `AttentionViz.tsx` — 注意力权重展示的主要消费者

---

## 7. 工作台任务执行流程（规划中）

工作台页面目前使用模拟数据（`mockData.ts` 中的 `createMockTaskRunner`）。实际生产环境中，序列提交流程将调用 `POST /rgcnformer/api/v1/submit-task`，然后轮询 `GET /rgcnformer/api/v1/results/{jobId}`。

### 序列提交流程

1. **POST** `/rgcnformer/api/v1/submit-task` — 携带 `userId`、`rnaSequence`、`dataset`
2. 状态转换：`idle → submitting → queued → processing → completed`
3. **GET** `/rgcnformer/api/v1/results/{jobId}` — 轮询至完成
4. 结果包含：`classification`、`attention`、`gcn`

### 可视化运行流程

工作台上的每种可视化类型对应如下 API 调用：

| 可视化类型 | API 调用 |
|-----------|----------|
| 分类 | 使用 submit-task 返回的结果 |
| 注意力 | 使用 submit-task 返回的结果 |
| GCN 图 | 使用 submit-task 返回的结果 |
| GCN 消息传递 | `POST /rgcnformer/api/v1/visualize-gcn-aggregation` |
| 积分归因 | `POST /rgcnformer/api/v1/integrated-gradients` |
| 模型结构 | `GET /rgcnformer/api/v1/model-graph` |

---

## 错误响应

所有端点返回标准 HTTP 错误码，响应体为 JSON：

```json
{
  "error": "人类可读的错误描述",
  "detail": "可选的技术详情"
}
```

| HTTP 状态码 | 含义 |
|-------------|------|
| `200` | 请求成功 |
| `400` | 请求参数错误（输入无效） |
| `404` | 资源不存在（jobId 无效） |
| `500` | 服务器内部错误 |

---

## 附录 A：分类树数据

```typescript
interface ClassificationData {
  name: string;             // 节点名称（如 "Root"、"A"、"Am"）
  isPredicted: boolean;     // 该节点是否为预测到的修饰
  children: ClassificationData[];  // 子节点，构成树形层级结构
}
```

根节点通常为 `"Root"`。一级子节点为核苷酸分组（A/C/G/U）。二级子节点为具体的修饰类型。预测到的修饰 `isPredicted` 为 `true`。

---

## 附录 B：注意力数据

```typescript
interface AttentionData {
  sequence: string;         // 完整 RNA 序列
  weights: Array<{
    index: number;          // 序列中的位置
    type: string;           // 核苷酸类型（A/C/G/U）
    score: number;          // 注意力权重分数（原始值）
  }>;
}
```

---

## 附录 C：GCN 图数据

```typescript
interface GcnGraphData {
  nodes: Array<{
    id: string;             // 节点标识（如 "node_0"）
    label: string;          // 显示标签（如 "A0"）
    data: {
      index: number;        // 序列位置
      type: string;         // 核苷酸类型
      name: string;         // 可读名称
    };
  }>;
  edges: Array<{
    source: string;         // 源节点 ID
    target: string;         // 目标节点 ID
  }>;
}
```

边分为两类：
- **骨架边（backbone edges）**：连续位置间的连接（i → i+1）
- **配对/结构边（pairing/structural edges）**：非连续核苷酸之间的相互作用

---

## 附录 D：RNA 修饰类别索引

共 12 种 RNA 修饰类型，索引 0–11：

| 索引 | 名称 | 核苷酸 | 说明 |
|-------|------|------------|-------------|
| 0 | Am | A | 2'-O-甲基腺苷 |
| 1 | Atol | A | 腺苷-肌苷转换 |
| 2 | Cm | C | 2'-O-甲基胞苷 |
| 3 | Gm | G | 2'-O-甲基鸟苷 |
| 4 | Tm | U | 2'-O-甲基尿苷 |
| 5 | Y | U | 假尿苷 |
| 6 | ac4C | C | N4-乙酰胞苷 |
| 7 | m1A | A | N1-甲基腺苷 |
| 8 | m5C | C | 5-甲基胞苷 |
| 9 | m6A | A | N6-甲基腺苷 |
| 10 | m6Am | A | N6,2'-O-二甲基腺苷 |
| 11 | m7G | G | 7-甲基鸟苷 |

---

## 附录 E：数据集类型

三种支持的数据集，通过任务提交上下文传递给后端：

| 数据集 | 标签 |
|---------|-------|
| `Human` | 人类 RNA 修饰数据集 |
| `Plant` | 植物 RNA 修饰数据集 |
| `3Gen` | 三代测序数据集 |
