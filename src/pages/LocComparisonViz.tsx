import React, { useRef, useEffect, useMemo } from 'react';
import * as echarts from 'echarts';
import type { LocComparisonData } from '../lib/api';

interface LocComparisonVizProps {
  data?: LocComparisonData;
}

// Rank colors for emphasis
const RANK_COLORS: Record<number, string> = {
  1: '#27AE60', // Best - green
  2: '#F39C12', // 2nd - amber
  3: '#E74C3C', // 3rd - red
};

const RANK_LABELS: Record<number, string> = {
  1: '1st (Best)',
  2: '2nd',
  3: '3rd',
};

function rankLabel(rank: number): string {
  return RANK_LABELS[rank] ?? `${rank}th`;
}

const LocComparisonViz: React.FC<LocComparisonVizProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const processedData = useMemo(() => {
    if (!data || !data.model_names || data.model_names.length === 0) return null;

    const { model_names, k_labels, heatmap } = data;
    const numModels = model_names.length;
    const numK = k_labels.length;

    // Compute ranks within each Top-K column
    const ranks: number[][] = [];
    for (let k = 0; k < numK; k++) {
      const values = model_names.map((_, i) => ({
        idx: i,
        value: heatmap[i]?.[k] ?? 0,
      }));
      values.sort((a, b) => b.value - a.value); // descending
      const colRanks = new Array<number>(numModels);
      values.forEach((v, rank) => {
        colRanks[v.idx] = rank + 1;
      });
      ranks.push(colRanks);
    }

    return {
      modelNames: model_names,
      kLabels: k_labels,
      heatmap,
      ranks,
      numModels,
      numK,
    };
  }, [data]);

  useEffect(() => {
    if (!processedData || !chartRef.current) return;

    const { modelNames, kLabels, heatmap, ranks, numModels, numK } = processedData;

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    // Build series - one per model
    const series: echarts.SeriesOption[] = modelNames.map((modelName, modelIdx) => ({
      name: modelName,
      type: 'scatter',
      data: Array.from({ length: numK }, (_, kIdx) => {
        const value = heatmap[modelIdx]?.[kIdx] ?? 0;
        const rank = ranks[kIdx]?.[modelIdx] ?? 1;
        return {
          value: [kIdx, modelIdx, value, rank],
          itemStyle: {
            color: RANK_COLORS[rank] ?? '#95A5A6',
            borderColor: '#fff',
            borderWidth: 2,
          },
        };
      }),
      symbolSize: (val: number[]) => {
        const rank = val[3];
        // Larger for better rank
        return rank === 1 ? 48 : rank === 2 ? 40 : 34;
      },
      emphasis: {
        scale: true,
        scaleSize: 12,
        itemStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      },
      label: {
        show: true,
        formatter: (params: any) => {
          const value = params.value[2];
          return `${(value * 100).toFixed(1)}%`;
        },
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowBlur: 2,
      },
      tooltip: {
        formatter: (params: any) => {
          const [kIdx, , value, rank] = params.value;
          const kLabel = kLabels[kIdx];
          const name = params.seriesName;
          return `
            <div style="font-weight:bold;margin-bottom:4px">${name}</div>
            <div>Top-K: <b>${kLabel}</b></div>
            <div>Mean Accuracy: <b>${(value * 100).toFixed(2)}%</b></div>
            <div>Rank: <b style="color:${RANK_COLORS[rank]}">${rankLabel(rank)}</b></div>
          `;
        },
      },
    }));

    const option: echarts.EChartsOption = {
      backgroundColor: '#FFFFFF',
      legend: {
        bottom: 10,
        itemGap: 30,
        textStyle: { fontSize: 13 },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: { color: '#333' },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      },
      grid: {
        left: 110,
        right: 40,
        top: 30,
        bottom: 60,
      },
      xAxis: {
        type: 'category',
        data: kLabels,
        axisLabel: {
          color: '#4A4A4A',
          fontWeight: 'bold',
          fontSize: 13,
        },
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: '#f0f0f0', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'category',
        data: modelNames,
        axisLabel: {
          color: '#4A4A4A',
          fontWeight: 'bold',
          fontSize: 13,
        },
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
      },
      series,
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [processedData]);

  if (!processedData) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Rank legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 12,
        fontSize: 13,
      }}>
        {[1, 2, 3].map((rank) => (
          <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: RANK_COLORS[rank],
            }} />
            <span>{rankLabel(rank)}</span>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div
        ref={chartRef}
        style={{ width: '100%', height: 360 }}
      />
    </div>
  );
};

export default LocComparisonViz;
