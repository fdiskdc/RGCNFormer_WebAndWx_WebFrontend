/**
 * App.tsx - 顶层路由 + TanStack Query Provider / Top-level router + TanStack Query provider
 *
 * 定义整个应用的所有路由:工作区(/)、旧版首页(/legacy)、可视化套件(/classification、
 * /attention、/gcn、/target-gcn、/integrated-gradients、/model-viz)、VizDisplay、结果
 * 页(/results/:jobId)、对比页(/compare)。可视化套件共用 VizLayout(Sider+Content 布局)。
 * 此外创建全局 QueryClient 并包裹 QueryClientProvider,集中管理数据请求与缓存。
 * Declares all routes of the app: the workspace (/), legacy home (/legacy), the
 * visualization suite (classification/attention/gcn/target-gcn/IG/model-viz — all wrapped
 * in VizLayout), VizDisplay, the results page (/results/:jobId), and the compare page.
 * Also creates a global QueryClient and provides it via QueryClientProvider to centralize
 * data fetching and caching.
 *
 * 功能模块 / Modules:
 * - QueryClient: TanStack Query 客户端(refetchOnWindowFocus=false, retry=1, staleTime 5 分钟)
 *   / TanStack Query client (no refetch on focus, 1 retry, 5-min stale time)
 * - Routes/Route: 9 条路由(2 顶层 + 5 共享 Layout + 2 独立)/ 9 routes total
 * - LanguageProvider: 整树中英双语 / Tree-wide bilingual i18n
 * - QueryClientProvider: 整树数据请求与缓存 / Tree-wide data fetch + cache
 *
 * 输入 / Inputs:
 * - window.location.pathname: 浏览器 URL 路径 / Browser URL pathname
 * - URL 参数 :jobId(结果页动态参数)/ :jobId dynamic param (results page)
 *
 * 输出 / Outputs:
 * - 路由匹配后渲染对应 Page 组件 / Route-matched page component
 *
 * 数据流 / Data Flow:
 * 1. URL 变化 → BrowserRouter 触发路由匹配
 * 2. 命中嵌套路由(/classification 等)→ VizLayout 套 Outlet
 * 3. 各 Page 通过 useQuery 调 lib/api.ts → 后端
 * 4. 数据返回后渲染 ECharts / react-flow 等可视化
 *
 * 相关文件 / Related Files:
 * - 调用 / Calls: pages/* (10 个页面 / 10 pages), components/VizLayout
 * - 被调用 / Called by: main.tsx 根渲染 / main.tsx root render
 * - 依赖 / Depends on: lib/i18n/LanguageContext.tsx, @tanstack/react-query
 *
 * 使用示例 / Usage Example:
 *   // 访问 /rgcnformer/classification
 *   // → 匹配 <Route path="/classification" element={<ClassificationViz />}>
 *   // → 父级 <Route element={<VizLayout />}> 渲染 Sider+Content
 *   // → <Outlet /> 处挂载 ClassificationViz
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import WorkspacePage from './pages/WorkspacePage';
import MainPage from './pages/MainPage';
import ClassificationViz from './pages/ClassificationViz';
import AttentionViz from './pages/AttentionViz';
import GcnViz from './pages/GcnViz';
import TargetGcnViz from './pages/TargetGcnViz';
import IntegratedGradientsViz from './pages/IntegratedGradientsViz';
import ModelViz from './pages/ModelViz';
import ResultsPage from './pages/ResultsPage';
import VizDisplayPage from './pages/VizDisplayPage';
import ComparePage from './pages/ComparePage';
import VizLayout from './components/VizLayout';
import './App.css';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<WorkspacePage />} />
          <Route path="/legacy" element={<MainPage />} />
          <Route element={<VizLayout />}>
            <Route path="/classification" element={<ClassificationViz />} />
            <Route path="/attention" element={<AttentionViz />} />
            <Route path="/gcn" element={<GcnViz />} />
            <Route path="/target-gcn" element={<TargetGcnViz />} />
            <Route path="/integrated-gradients" element={<IntegratedGradientsViz />} />
            <Route path="/model-viz" element={<ModelViz />} />
          </Route>
          <Route path="/viz-display" element={<VizDisplayPage />} />
          <Route path="/results/:jobId" element={<ResultsPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
