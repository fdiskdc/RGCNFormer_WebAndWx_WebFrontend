import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { fetchRgcnformerLocalization, type RgcnformerLocalizationData } from '../lib/api';

const MORANDI = {
  bgCircle: '#EBEBEB',
  pieFill: '#84A59D',
  textDark: '#4A4A4A',
  gridLine: '#F0F0F0',
  cardBg: '#FFFFFF',
};

interface LocalizationVizProps {
  data?: RgcnformerLocalizationData;
}

const LocalizationViz: React.FC<LocalizationVizProps> = ({ data: propData }) => {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['rgcnformerLocalization'],
    queryFn: fetchRgcnformerLocalization,
    enabled: !propData,
  });

  const data = propData || queryData;

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const container = chartRef.current;
    const isMobile = window.innerWidth < 768;

    const nRows = data.classes.length;
    const donutR = isMobile ? 8 : 11*1.5;
    const donutRGap = donutR * 0.82;

    // Build indicator markers: one per class per statistic type

    const option = {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesType === 'custom') {
            const col = params.data[0];
            const row = params.data[1];
            const value = params.data[2];
            const classIdx = nRows - 1 - row;
            const className = data.class_names[classIdx];
            const kLabel = data.k_labels[col];
            return (
              `${className}<br/>` +
              `${kLabel}: ${(value * 100).toFixed(1)}%`
            );
          }
          return '';
        },
      },
      grid: {
        left: isMobile ? 60 : 80,
        right: isMobile ? 20 : 40,
          top: isMobile ? 20 : 30,
        bottom: isMobile ? 70 : 90,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: data.k_labels,
        position: 'top',
        axisLabel: {
          color: MORANDI.textDark,
          fontWeight: 'bold',
          fontSize: isMobile ? 9 : 11*2,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: [...data.class_names].reverse(),
        axisLabel: {
          color: MORANDI.textDark,
          fontWeight: 'bold',
          fontSize: isMobile ? 9 : 11*2,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: MORANDI.gridLine, type: 'dashed', width: 1 },
        },
      },
      series: [
        {
          type: 'custom',
          name: 'Donuts',
          renderItem: (_params: any, api: any) => {
            const col = api.value(0);
            const row = api.value(1);
            const value = api.value(2);
            const cx = api.coord([col, row])[0];
            const cy = api.coord([col, row])[1];

            return {
              type: 'group',
              children: [
                {
                  type: 'sector',
                  shape: { cx, cy, r0: 0, r: donutR, startAngle: 0, endAngle: Math.PI * 2 },
                  style: { fill: MORANDI.bgCircle, stroke: 'none' },
                },
                {
                  type: 'sector',
                  shape: { cx, cy, r0: 0, r: donutRGap, startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 + Math.PI * 2 * value },
                  style: { fill: MORANDI.pieFill, stroke: MORANDI.pieFill, lineWidth: 0.5 },
                },
              ],
            };
          },
          data: data.heatmap.flatMap((row, rowIdx) =>
            row.map((val, colIdx) => [colIdx, nRows - 1 - rowIdx, val])
          ),
          z: 1,
        },
      ],
      graphic: {
        elements: [
          {
            type: 'text',
            left: 12,
            bottom: isMobile ? 52 : 62,
            style: {
              text: t('Reference'),
              fill: MORANDI.textDark,
              fontWeight: 'bold',
              fontSize: isMobile ? 10 : 12,
            },
          },
          ...[1.0, 0.75, 0.5, 0.25].flatMap((val, i) => {
            const refRad = isMobile ? 8 : 11;
            const gap = refRad * 3.5;
            const y = (container.clientHeight || 600) - (isMobile ? 34 : 48);
            const cx = 16 + refRad + i * gap;
            const labels = ['100%', '75%', '50%', '25%'];
            return [
              {
                type: 'circle' as const,
                shape: { cx, cy: y, r: refRad },
                style: { fill: MORANDI.bgCircle, stroke: 'none' },
              },
              {
                type: 'sector' as const,
                shape: { cx, cy: y, r0: 0, r: refRad * 0.82, startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 + Math.PI * 2 * val },
                style: { fill: MORANDI.pieFill, stroke: 'none' },
              },
              {
                type: 'text' as const,
                left: cx,
                top: y + refRad + 8,
                style: {
                  text: labels[i],
                  fill: MORANDI.textDark,
                  fontWeight: 'bold',
                  fontSize: 9,
                  textAlign: 'center',
                },
              },
            ];
          }),
        ],
      },
      animationDuration: 800,
      animationEasing: 'cubicOut' as any,
    };

    const chart = echarts.getInstanceByDom(container);
    if (chart) chart.dispose();

    const initChart = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      const newChart = echarts.init(container);
      chartInstanceRef.current = newChart;
      newChart.setOption(option as any);
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          initChart();
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe(container);
    initChart();

    const handleResize = () => {
      const c = chartInstanceRef.current;
      if (c) c.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      const c = chartInstanceRef.current;
      if (c) c.dispose();
    };
  }, [data, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, fontSize: 16, color: '#666' }}>
          {t('Loading chart...')}
        </div>
      );
    }
    if (isError) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, fontSize: 16, color: '#d32f2f' }}>
          {t('Failed to load chart data: {message}').replace('{message}', '')}
        </div>
      );
    }
    if (!data) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, fontSize: 16, color: '#666' }}>
          No data available
        </div>
      );
    }
    return (
      <div ref={chartRef} style={{ width: '100%', height: window.innerWidth < 768 ? 450 : 600 }} />
    );
  };

  return (
    <div style={{ backgroundColor: MORANDI.cardBg, borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {renderContent()}
    </div>
  );
};

export default LocalizationViz;
