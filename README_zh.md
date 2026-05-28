# RGCNFormer Web Frontend

基于 React 的 DCPRES（Deep learning Context-aware Predictor of RNA modification sites）Web 前端，使用图神经网络提供 RNA 修饰位点的交互式可视化和分析。

[[English](README.md)] [[日本語](README_ja.md)] [[Русский](README_ru.md)]

## 启动方式

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint
```

访问 `http://localhost:5173`（默认端口）

## 项目架构

```
src/
├── pages/                    # 页面组件
│   ├── WorkspacePage.tsx     # 工作台主页
│   ├── MainPage.tsx          # 旧版提交页面
│   ├── ResultsPage.tsx       # 任务结果页面
│   ├── ComparePage.tsx       # 模型比较页面
│   ├── VizDisplayPage.tsx   # 可视化展示页面
│   └── *.tsx                # 各类可视化组件
├── components/               # 通用组件
│   └── workspace/           # 工作台相关组件
├── lib/                     # 工具库
│   ├── api.ts               # API 调用
│   └── i18n/                # 国际化
└── context/                 # React Context
```

## 页面介绍

### 1. 工作台 (`/`)

单页拼图式分析工作台，作为根路由。

**功能：**
- 左侧：序列库和可视化库拖放添加
- 中间：画布式工作区
- 右侧：属性面板绑定配置

**输入：**
- RNA 序列（通过库添加或绑定模型）
- 数据集类型（Human / Plant / 3Gen）
- 可视化类型选择

**输出：**
- 分类结果（ClassificationViz）
- 注意力权重（AttentionViz）
- GCN 图结构（GcnViz）
- GCN 消息传递（TargetGcnViz）
- Integrated Gradients

---

### 2. 旧版提交 (`/legacy`)

基于表单的 RNA 序列提交界面。

**功能：**
- 数据集选择
- 数据集索引
- 服务器选择

**输入：**
- Dataset: Human | Plant | 3Gen
- Dataset Index: 数字索引
- Server: server1 | server2 | server3

**输出：**
- 提交后跳转到 ResultsPage (`/results/{jobId}`)

---

### 3. 任务结果 (`/results/:jobId`)

基于轮询的结果展示页面，包含多个可视化选项卡。

**功能：**
- 任务状态轮询（3秒间隔，5分钟超时）
- 六种可视化切换

**输入：**
- Job ID (URL 参数)

**输出：**
- Classification Tree（分类树）
- Attention（注意力权重）
- GCN Graph（GCN 图结构）
- GCN Message Passing（消息传递动画）
- Integrated Gradients（梯度积分）

---

### 4. 模型比较 (`/compare`)

支持多种可视化模式的模型性能比较页面。

**功能：**
- 桌面/移动端自适应布局
- 五种可视化切换

**输入：**
- 无需用户输入，数据从后端获取

**输出：**
- Bar Chart（模型性能柱状图）
- DCPRES Classification Heatmap（热力图）
- Localization（定位性能）
- Loc Comparison（定位模型比较）
- UMAP Visualization（降维可视化）

---

### 5. 可视化展示 (`/viz-display`)

用于展示已完成可视化结果的全屏显示页面。

**功能：**
- 全屏展示工作台生成的可视化结果
- 显示数据来源信息

**输入：**
- Sequence blocks 和 Visualization blocks (通过 state 传递)

**输出：**
- 各可视化组件的完整展示

---

### 6. 独立可视化页面

| 路由 | 组件 | 描述 |
|--------------|------------------|-------------------|
| `/classification` | ClassificationViz | 分类结果可视化 |
| `/attention` | AttentionViz | 注意力权重可视化 |
| `/gcn` | GcnViz | GCN 图结构 |
| `/target-gcn` | TargetGcnViz | GCN 消息传递 |
| `/integrated-gradients` | IntegratedGradientsViz | Integrated Gradients |
| `/model-viz` | ModelViz | 模型架构图 |

## 所需后端

### API 地址

默认配置：`/rgcnformer/api/v1`（可通过环境变量 `VITE_API_BASE_URL` 修改）

### 后端代理

开发模式下请求代理到：`http://localhost:8000`
可通过环境变量 `VITE_PROXY_TARGET` 修改

### 必需 API 端点

| 端点 | 方法 | 功能 |
|----------------|---------------|-------------------|
| `/submit-task` | POST | 提交分析任务 |
| `/results/{jobId}` | GET | 获取任务结果 |
| `/model-graph` | GET | 获取模型图结构 |
| `/integrated-gradients` | POST | 计算 Integrated Gradients |
| `/visualize-gcn-aggregation` | POST | 获取 GCN 聚合数据 |
| `/model-comparison` | GET | 获取模型比较数据 |
| `/rgcnformer-classification-heatmap` | GET | DCPRES 分类热力图 |
| `/rgcnformer-localization` | GET | 定位性能数据 |
| `/rgcnformer-loc-comparison` | GET | 定位比较数据 |
| `/umap-data` | GET | UMAP 降维数据 |
| `/sample-sequence` | GET | 获取样本序列 |

## 输入与输出

### 主要输入

| 输入项 | 类型 | 说明 |
|---------------|-------------|---------------------|
| RNA Sequence | string | RNA 核苷酸序列 (A, U, G, C) |
| Dataset | enum | Human / Plant / 3Gen |
| Dataset Index | number | 数据集内的索引 |
| Target Class ID | number | Integrated Gradients 目标类别 |
| Target Node Index | number | GCN 消息传递目标节点 |

### 主要输出

| 输出项 | 格式 | 说明 |
|----------------|--------------|---------------------|
| Classification | tree/graph | 修饰位点分类结果 |
| Attention | array | 注意力权重数据 |
| GCN Graph | nodes/edges | 图结构数据 |
| GCN Aggregation | animation | 消息传递动画 |
| Integrated Gradients | scores | 节点属性分数 |
| Model Metrics | percentages | 模型性能指标 |

## 国际化

项目支持中英文切换，通过 `LanguageContext` 实现。

**使用方式：**

```tsx
import { useTranslation } from './lib/i18n/LanguageContext';

const { t, changeLanguage, language } = useTranslation();

// 切换语言
changeLanguage('en'); // 英文
changeLanguage('zh'); // 中文

// 翻译
t('Submit'); // -> "提交" or "Submit"
```

**翻译文件：**
- `src/lib/i18n/en.ts` - English
- `src/lib/i18n/zh.ts` - 中文

页面右上角/右下角有语言切换按钮。

## 技术栈

- **React 19** + TypeScript
- **Vite 7** - 构建工具
- **Ant Design 6** - UI 组件库
- **TanStack Query 5** - 数据请求与缓存
- **React Router 7** - 路由管理
- **ECharts** - 图表可视化
- **@antv/g6** - 图可视化
- **Three.js** + React Three Fiber - 3D 可视化
- **d3** - 数据处理

## 环境变量

| 变量 | 默认值 | 说明 |
|----------------|------------------|---------------------|
| `VITE_API_BASE_URL` | `/rgcnformer/api/v1` | API 基础地址 |
| `VITE_PROXY_TARGET` | `http://localhost:8000` | 开发代理目标 |
| `VITE_LEGACY_PREDICT_URL` | `http://localhost:5000` | 旧版预测接口 |

## 注意事项

1. 工作台页面使用 Mock 数据演示功能，实际使用需后端支持
2. ResultsPage 轮询间隔 3 秒，超时时间 5 分钟
3. ComparePage 为桌面/移动端响应式设计
4. 所有可视化页面均支持中英文切换

---

**相关论文：**
- [DCPRES](https://doi.org/10.3390/app15158626)
- [RGCNFormer](https://doi.org/10.3390/rs17142354)