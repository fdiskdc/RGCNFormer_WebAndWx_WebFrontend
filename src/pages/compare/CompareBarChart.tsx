import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';

interface CompareBarChartProps {
  data: {
    models: Array<{ name: string; display_name: string; metrics: Record<string, number> }>;
    metric_names: string[];
  };
}

const MORANDI_COLORS = [
  '#B8A9C9',  // DCPRES - muted purple
  '#A3B5A6',  // ProCSE - sage green
  '#C4A882',  // GCN - warm sand
  '#D4A0A0',  // K-Means - dusty rose
  '#8BA4B8',  // DSCPS - steel blue
];

const CompareBarChart: React.FC<CompareBarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const isMobile = window.innerWidth < 768;
    const labelFontSize = isMobile ? 8 : 10;
    const labelRotate = isMobile ? 0 : 45;
    const labelTopOffset = isMobile ? 8 : 0;

    const option: echarts.EChartsOption = {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const modelName = params.seriesName;
          const metricName = params.name;
          const value = (params.value * 100).toFixed(1);
          return `${modelName}<br/>${metricName}: ${value}%`;
        },
      },
      legend: {
        bottom: 10,
        left: 'center',
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        left: isMobile ? 40 : 50,
        right: isMobile ? 20 : 50,
        top: isMobile ? 30 : 40,
        bottom: isMobile ? 70 : 80,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.metric_names,
        axisLabel: {
          color: '#4A4A4A',
          fontWeight: 'bold',
          rotate: labelRotate,
          fontSize: labelFontSize,
        },
        axisLine: {
          lineStyle: {
            color: '#333333',
          },
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        axisLabel: {
          color: '#4A4A4A',
          formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          fontSize: isMobile ? 10 : 12,
        },
        splitLine: {
          lineStyle: {
            color: '#E0E0E0',
            type: 'dashed',
          },
        },
      },
      series: data.models.map((model, modelIndex) => {
        const color = MORANDI_COLORS[modelIndex % MORANDI_COLORS.length];
        return {
          name: model.display_name,
          type: 'bar',
          barGap: 0.1,
          barCategoryGap: 0.3,
          data: data.metric_names.map((metricName) => model.metrics[metricName] || 0),
          itemStyle: {
            color: color,
            borderColor: '#333333',
            borderWidth: 0.5,
          },
          label: {
            show: !isMobile,
            position: 'top',
            rotate: labelRotate,
            formatter: (params: any) => `${(params.value * 100).toFixed(1)}`,
            fontWeight: 'bold',
            fontSize: labelFontSize,
            distance: labelTopOffset + 4,
          },
          emphasis: {
            itemStyle: {
              borderColor: '#333333',
              borderWidth: 1,
            },
          },
        };
      }),
      animationDuration: 800,
      animationEasing: 'cubicOut',
    };

    chart.setOption(option);

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const newHeight = mobile ? Math.min(350, window.innerHeight * 0.45) : 500;
      chart.resize({ height: newHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: window.innerWidth < 768 ? Math.min(350, window.innerHeight * 0.45) : 500,
      }}
    />
  );
};

export default CompareBarChart;