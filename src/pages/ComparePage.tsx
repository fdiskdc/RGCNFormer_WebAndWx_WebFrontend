import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { fetchModelComparison, fetchRgcnformerHeatmap, fetchRgcnformerLocalization, fetchRgcnformerLocComparison, fetchUmapData, fetchCoraUmapData, fetchDatasetComparison } from '../lib/api';
import CompareBarChart from './compare/CompareBarChart';
import RgcnformerHeatmap from './RgcnformerHeatmap';
import DatasetComparisonHeatmap from './DatasetComparisonHeatmap';
import LocalizationViz from './LocalizationViz';
import LocComparisonViz from './LocComparisonViz';
import UMapViz from './UMapViz';

const { Content, Sider } = Layout;

const DESKTOP_BREAKPOINT = 768;

type VizType = 'bar' | 'heatmap' | 'localization' | 'locComparison' | 'umap' | 'coraUmap' | 'datasetComparison';

const MORANDI = {
  sidebarBg: '#9E9288',
  sidebarLogoBg: '#8B7E74',
  sidebarText: '#F0EBE6',
  sidebarActive: '#B8A9C9',
  sidebarActiveText: '#FFFFFF',
  contentBg: '#F0EBE6',
  cardBg: '#FFFFFF',
  cardBorder: '#D4CEC6',
  titleColor: '#4A4A4A',
  titleUnderline: '#B8A9C9',
  btnBrown: '#C4A882',
  tableHeaderBg: '#9E9288',
  tableEvenRow: '#F5F0EB',
  tableHover: '#EBE5DE',
};

const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, changeLanguage, language } = useTranslation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > DESKTOP_BREAKPOINT);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [selectedVizType, setSelectedVizType] = useState<VizType>('bar');

  const { data: modelComparisonData, isLoading, isError } = useQuery({
    queryKey: ['modelComparison'],
    queryFn: fetchModelComparison,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['rgcnformerHeatmap'],
    queryFn: fetchRgcnformerHeatmap,
  });

  const { data: localizationData } = useQuery({
    queryKey: ['rgcnformerLocalization'],
    queryFn: fetchRgcnformerLocalization,
  });

  const { data: locComparisonData } = useQuery({
    queryKey: ['rgcnformerLocComparison'],
    queryFn: fetchRgcnformerLocComparison,
  });

  const { data: umapData } = useQuery({
    queryKey: ['umapData'],
    queryFn: fetchUmapData,
  });

  const { data: coraUmapData } = useQuery({
    queryKey: ['coraUmapData'],
    queryFn: fetchCoraUmapData,
  });

  const { data: datasetComparisonData } = useQuery({
    queryKey: ['datasetComparison'],
    queryFn: fetchDatasetComparison,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      if (!desktop) {
        setSiderCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: 16,
          color: '#666'
        }}>
          {t('Loading comparison data...')}
        </div>
      );
    }

    if (isError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: 16,
          color: '#d32f2f'
        }}>
          {t('Failed to load comparison data')}
        </div>
      );
    }

    if (!modelComparisonData || modelComparisonData.models.length === 0) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: 16,
          color: '#666'
        }}>
          No data available
        </div>
      );
    }

    switch (selectedVizType) {
      case 'bar':
        return <CompareBarChart data={modelComparisonData} />;
      case 'heatmap':
        return <RgcnformerHeatmap data={heatmapData} />;
      case 'localization':
        return <LocalizationViz data={localizationData} />;
      case 'locComparison':
        return <LocComparisonViz data={locComparisonData} />;
      case 'umap':
        return <UMapViz data={umapData} />;
      case 'coraUmap':
        return <UMapViz data={coraUmapData} />;
      case 'datasetComparison':
        return <DatasetComparisonHeatmap data={datasetComparisonData} />;
      default:
        return null;
    }
  };

  const renderSummaryTable = () => {
    if (!modelComparisonData || modelComparisonData.models.length === 0 || isLoading || isError) return null;

    return (
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: 24,
      }}>
        <thead>
          <tr>
            {['Model Name', ...modelComparisonData.metric_names].map((col) => (
              <th
                key={col}
                style={{
                  backgroundColor: MORANDI.tableHeaderBg,
                  color: '#FFFFFF',
                  padding: '8px 12px',
                  textAlign: 'center',
                  fontWeight: 600,
                  border: `1px solid ${MORANDI.cardBorder}`,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modelComparisonData.models.map((model, rowIdx) => (
            <tr
              key={model.name}
              style={{
                backgroundColor: rowIdx % 2 === 0 ? MORANDI.tableEvenRow : MORANDI.cardBg,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = MORANDI.tableHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 ? MORANDI.tableEvenRow : MORANDI.cardBg)}
            >
              <td style={{
                padding: '6px 12px',
                textAlign: 'left',
                fontWeight: 600,
                color: MORANDI.titleColor,
                border: `1px solid ${MORANDI.cardBorder}`,
              }}>
                {model.display_name}
              </td>
              {modelComparisonData.metric_names.map((metricName) => (
                <td
                  key={metricName}
                  style={{
                    padding: '6px 12px',
                    textAlign: 'center',
                    color: MORANDI.titleColor,
                    border: `1px solid ${MORANDI.cardBorder}`,
                  }}
                >
                  {(model.metrics[metricName] * 100).toFixed(1)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const cardBase = (isSelected: boolean) => ({
    borderRadius: 16,
    padding: '12px 16px',
    backgroundColor: isSelected ? MORANDI.sidebarActive : 'transparent',
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 8,
    margin: '0 16px',
    color: isSelected ? MORANDI.sidebarActiveText : MORANDI.sidebarText,
    fontWeight: 500 as const,
  });

  const desktopSidebar = (
    <div style={{ flexGrow: 1 }}>
      <div style={{
        height: 'auto',
        minHeight: 32,
        margin: 16,
        backgroundColor: MORANDI.sidebarLogoBg,
        borderRadius: 8,
        padding: '12px 8px',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        wordBreak: 'break-word',
        overflow: 'hidden',
      }}>
        {siderCollapsed ? 'RNA' : t('Model Performance Comparison')}
      </div>

      <div
        onClick={() => setSelectedVizType('heatmap')}
        style={{
          ...cardBase(selectedVizType === 'heatmap'),
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>🔬</span>
        {!siderCollapsed && <span>{t('DCPRES Classification')}</span>}
      </div>

      <div
        onClick={() => setSelectedVizType('datasetComparison')}
        style={{
          ...cardBase(selectedVizType === 'datasetComparison'),
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>📋</span>
        {!siderCollapsed && <span>{t('Dataset Comparison')}</span>}
      </div>

      <div
        onClick={() => setSelectedVizType('localization')}
        style={{
          ...cardBase(selectedVizType === 'localization'),
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>🎯</span>
        {!siderCollapsed && <span>{t('Localization')}</span>}
      </div>

      <div
        onClick={() => setSelectedVizType('locComparison')}
        style={{
          ...cardBase(selectedVizType === 'locComparison'),
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>🏆</span>
        {!siderCollapsed && <span>{t('Loc Comparison')}</span>}
      </div>

      <div
        onClick={() => setSelectedVizType('umap')}
        style={{
          ...cardBase(selectedVizType === 'umap'),
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>🗺️</span>
        {!siderCollapsed && <span>{t('UMAP Visualization')}</span>}
      </div>

      <div
        onClick={() => setSelectedVizType('coraUmap')}
        style={{
          ...cardBase(selectedVizType === 'coraUmap'),
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>🌐</span>
        {!siderCollapsed && <span>{t('CORA UMAP Visualization')}</span>}
      </div>

      <div
        onClick={() => setSelectedVizType('bar')}
        style={{
          ...cardBase(selectedVizType === 'bar'),
          marginTop: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>📊</span>
        {!siderCollapsed && <span>{t('Bar Chart')}</span>}
      </div>
    </div>
  );

  const mobileCards = (
    <>
      <div
        onClick={() => setSelectedVizType('heatmap')}
        style={{
          ...cardBase(selectedVizType === 'heatmap'),
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>🔬</span>
        <span>{t('DCPRES Classification')}</span>
      </div>
      <div
        onClick={() => setSelectedVizType('datasetComparison')}
        style={{
          ...cardBase(selectedVizType === 'datasetComparison'),
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>📋</span>
        <span>{t('Dataset Comparison')}</span>
      </div>
      <div
        onClick={() => setSelectedVizType('localization')}
        style={{
          ...cardBase(selectedVizType === 'localization'),
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>🎯</span>
        <span>{t('Localization')}</span>
      </div>
      <div
        onClick={() => setSelectedVizType('locComparison')}
        style={{
          ...cardBase(selectedVizType === 'locComparison'),
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>🏆</span>
        <span>{t('Loc Comparison')}</span>
      </div>
      <div
        onClick={() => setSelectedVizType('umap')}
        style={{
          ...cardBase(selectedVizType === 'umap'),
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>🗺️</span>
        <span>{t('UMAP Visualization')}</span>
      </div>
      <div
        onClick={() => setSelectedVizType('coraUmap')}
        style={{
          ...cardBase(selectedVizType === 'coraUmap'),
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>🌐</span>
        <span>{t('CORA UMAP Visualization')}</span>
      </div>
      <div
        onClick={() => setSelectedVizType('bar')}
        style={{
          ...cardBase(selectedVizType === 'bar'),
        }}
      >
        <span style={{ fontSize: 16 }}>📊</span>
        <span>{t('Bar Chart')}</span>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: MORANDI.contentBg }}>
        <Sider
          collapsible
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          width={200}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: MORANDI.sidebarBg,
          }}
        >
          {desktopSidebar}
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Button
              type="primary"
              onClick={() => navigate('/')}
              style={{ marginBottom: '16px', width: '100%', backgroundColor: MORANDI.btnBrown, borderColor: MORANDI.btnBrown }}
            >
              {t('Return to Home')}
            </Button>
            <div>
              <Button
                onClick={() => changeLanguage('zh')}
                disabled={language === 'zh'}
                size="small"
                style={{ marginRight: 8 }}
              >
                中文
              </Button>
              <Button
                onClick={() => changeLanguage('en')}
                disabled={language === 'en'}
                size="small"
              >
                EN
              </Button>
            </div>
          </div>
        </Sider>
        <Layout style={{ marginLeft: siderCollapsed ? 80 : 200, transition: 'all 0.2s' }}>
          <Content style={{
            padding: 20,
            overflow: 'auto',
            minHeight: '100vh',
            backgroundColor: MORANDI.contentBg,
          }}>
            <h1 style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 16,
              color: MORANDI.titleColor,
              borderBottom: `2px solid ${MORANDI.titleUnderline}`,
              paddingBottom: 8,
            }}>
              {t('Model Performance Comparison')}
            </h1>
            <div style={{
              backgroundColor: MORANDI.cardBg,
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {renderContent()}
            </div>
            {selectedVizType === 'bar' && renderSummaryTable()}
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: MORANDI.contentBg }}>
      <div style={{
        backgroundColor: MORANDI.sidebarBg,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 16,
          wordBreak: 'break-word',
          maxWidth: '70%',
        }}>
          {t('Model Performance Comparison')}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            size="small"
            onClick={() => changeLanguage('zh')}
            disabled={language === 'zh'}
            style={{ color: language === 'zh' ? MORANDI.sidebarActive : '#fff', borderColor: 'transparent', background: 'transparent' }}
          >
            中文
          </Button>
          <Button
            size="small"
            onClick={() => changeLanguage('en')}
            disabled={language === 'en'}
            style={{ color: language === 'en' ? MORANDI.sidebarActive : '#fff', borderColor: 'transparent', background: 'transparent' }}
          >
            EN
          </Button>
          <Button size="small" type="primary" onClick={() => navigate('/')} style={{ backgroundColor: MORANDI.btnBrown, borderColor: MORANDI.btnBrown }}>
            {t('Return to Home')}
          </Button>
        </div>
      </div>
      <Content style={{
        padding: 16,
        overflow: 'auto',
        paddingBottom: 60,
      }}>
        {mobileCards}
        <div style={{
          backgroundColor: MORANDI.cardBg,
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          {renderContent()}
        </div>
        {selectedVizType === 'bar' && renderSummaryTable()}
      </Content>
    </Layout>
  );
};

export default ComparePage;