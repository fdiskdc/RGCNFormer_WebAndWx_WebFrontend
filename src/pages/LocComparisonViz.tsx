import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import type { LocComparisonData } from '../lib/api';

interface LocComparisonVizProps {
  data?: LocComparisonData;
}

const RANK_PALETTE = [
  '#27AE60', // 1st (Best) - dark green
  '#82E0AA', // 2nd - medium green
  '#D5F5E3', // 3rd - light green
  '#E8F8F0',
  '#F0FAF5',
];

const BG_COLORS = ['#F7F9F9', '#EAE7E1'];

const RANK_LABELS: Record<number, string> = {
  1: '1st (Best)',
  2: '2nd',
  3: '3rd',
};

function rankLabel(rank: number): string {
  return RANK_LABELS[rank] ?? `${rank}th`;
}

interface ProcessedPoint {
  modelIdx: number;
  kIdx: number;
  value: number;
  rank: number;
}

const LocComparisonViz: React.FC<LocComparisonVizProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const processedData = useMemo(() => {
    if (!data || !data.models || data.models.length === 0) return null;

    const { models, k_labels } = data;

    // Compute mean across all classes for each model × k
    const modelMeans = models.map((model) => {
      const numClasses = model.heatmap.length;
      const numK = k_labels.length;
      const means: number[] = [];
      for (let k = 0; k < numK; k++) {
        let sum = 0;
        for (let c = 0; c < numClasses; c++) {
          sum += model.heatmap[c]?.[k] ?? 0;
        }
        means.push(numClasses > 0 ? sum / numClasses : 0);
      }
      const overallMean = means.reduce((a, b) => a + b, 0) / means.length;
      return { name: model.display_name, means, overallMean };
    });

    // Sort by overall mean ascending (worst first), then reverse (best first for display)
    modelMeans.sort((a, b) => a.overallMean - b.overallMean);
    modelMeans.reverse();

    const numModels = modelMeans.length;
    const numK = k_labels.length;

    // Compute ranks: within each metric, highest value = rank 1
    const points: ProcessedPoint[] = [];
    for (let m = 0; m < numModels; m++) {
      for (let k = 0; k < numK; k++) {
        points.push({ modelIdx: m, kIdx: k, value: modelMeans[m].means[k], rank: 0 });
      }
    }

    for (let k = 0; k < numK; k++) {
      const values = modelMeans.map((m) => m.means[k]);
      const sorted = [...values]
        .map((v, i) => ({ v, i }))
        .sort((a, b) => b.v - a.v);
      const ranks = new Array<number>(numModels);
      sorted.forEach((item, r) => {
        ranks[item.i] = r + 1;
      });
      for (let m = 0; m < numModels; m++) {
        const idx = m * numK + k;
        points[idx].rank = ranks[m];
      }
    }

    return {
      kLabels: k_labels,
      modelNames: modelMeans.map((m) => m.name),
      modelMeans,
      points,
      numModels,
      numK,
      maxRank: numModels,
    };
  }, [data]);

  useEffect(() => {
    if (!processedData || !containerRef.current) return;

    const { kLabels, modelNames, points, numModels, numK, maxRank } = processedData;
    const container = containerRef.current;
    const chart = echarts.init(container);

    const cellSize = 64;
    const gap = 4;
    const labelWidth = 100;
    const headerHeight = 44;
    const radius = cellSize / 2 - 4;
    const bottomPad = 50;

    const chartWidth = labelWidth + numK * (cellSize + gap) + 40;
    const chartHeight = headerHeight + numModels * (cellSize + gap) + bottomPad;

    const graphicElements: object[] = [];

    // Alternating column backgrounds
    for (let k = 0; k < numK; k++) {
      const x = labelWidth + k * (cellSize + gap);
      graphicElements.push({
        type: 'rect',
        shape: {
          x,
          y: headerHeight - 2,
          width: cellSize,
          height: numModels * (cellSize + gap) + 4,
        },
        style: { fill: BG_COLORS[k % 2] },
      });
    }

    // Top-K labels (x-axis)
    for (let k = 0; k < numK; k++) {
      const x = labelWidth + k * (cellSize + gap) + cellSize / 2;
      graphicElements.push({
        type: 'text',
        x,
        y: 16,
        style: {
          text: kLabels[k],
          fill: '#4A4A4A',
          font: 'bold 14px "Times New Roman", serif',
          align: 'center',
        },
      });
    }

    // Model name labels (y-axis)
    for (let m = 0; m < numModels; m++) {
      const y = headerHeight + m * (cellSize + gap) + cellSize / 2;
      graphicElements.push({
        type: 'text',
        x: labelWidth - 10,
        y,
        style: {
          text: modelNames[m],
          fill: '#4A4A4A',
          font: 'bold 14px "Times New Roman", serif',
          align: 'right',
          verticalAlign: 'middle',
        },
      });
    }

    // Bubbles and percentage text
    for (const pt of points) {
      const x = labelWidth + pt.kIdx * (cellSize + gap) + cellSize / 2;
      const y = headerHeight + pt.modelIdx * (cellSize + gap) + cellSize / 2;
      const color = RANK_PALETTE[Math.min(pt.rank - 1, RANK_PALETTE.length - 1)];

      graphicElements.push({
        type: 'circle',
        shape: { cx: x, cy: y, r: radius },
        style: { fill: color },
      });

      graphicElements.push({
        type: 'text',
        x,
        y,
        style: {
          text: `${(pt.value * 100).toFixed(1)}%`,
          fill: '#4A4B4B',
          font: 'bold 12px "Times New Roman", serif',
          align: 'center',
          verticalAlign: 'middle',
        },
      });
    }

    // Legend
    const legendY = chartHeight - 18;
    const legendStartX = labelWidth + 10;
    const legendGap = 130;

    for (let r = 1; r <= maxRank; r++) {
      const color = RANK_PALETTE[Math.min(r - 1, RANK_PALETTE.length - 1)];
      const x = legendStartX + (r - 1) * legendGap;

      graphicElements.push({
        type: 'circle',
        shape: { cx: x, cy: legendY, r: 8 },
        style: { fill: color },
      });
      graphicElements.push({
        type: 'text',
        x: x + 14,
        y: legendY,
        style: {
          text: rankLabel(r),
          fill: '#4A4A4A',
          font: '13px "Times New Roman", serif',
          verticalAlign: 'middle',
        },
      });
    }

    const option: echarts.EChartsOption = {
      width: chartWidth,
      height: chartHeight,
      backgroundColor: '#FFFFFF',
      animation: false,
      graphic: [{ elements: graphicElements }] as unknown as NonNullable<echarts.EChartsOption['graphic']>,
    };

    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [processedData]);

  const height = processedData
    ? 44 + processedData.numModels * 68 + 50
    : 300;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, overflowX: 'auto' }}
    />
  );
};

export default LocComparisonViz;
