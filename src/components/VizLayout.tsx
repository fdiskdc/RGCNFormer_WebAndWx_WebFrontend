import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../lib/i18n/LanguageContext';

const { Content, Sider } = Layout;

const DESKTOP_BREAKPOINT = 768;

const MORANDI = {
  sidebarBg: '#9E9288',
  sidebarLogoBg: '#8B7E74',
  sidebarText: '#F0EBE6',
  sidebarActive: '#B8A9C9',
  sidebarActiveText: '#FFFFFF',
  contentBg: '#F0EBE6',
  titleColor: '#4A4A4A',
  titleUnderline: '#B8A9C9',
  btnBrown: '#C4A882',
};

const VizLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, changeLanguage, language } = useTranslation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > DESKTOP_BREAKPOINT);
  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const currentKey = location.pathname;

  useEffect(() => {
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

  const pageTitles: Record<string, string> = {
    '/classification': t('Classification Results'),
    '/attention': t('Attention Weights'),
    '/gcn': t('GCN Graph Structure'),
    '/target-gcn': t('Target GCN'),
    '/integrated-gradients': t('Integrated Gradients'),
    '/model-viz': t('Model Architecture'),
  };

  const menuItems = [
    { key: '/classification', label: t('Classification Results') },
    { key: '/attention', label: t('Attention Weights') },
    { key: '/gcn', label: t('GCN Graph Structure') },
    { key: '/integrated-gradients', label: t('Integrated Gradients') },
    { key: '/model-viz', label: t('Model Architecture') },
  ];

  const menuItemStyle = (key: string): React.CSSProperties => ({
    color: currentKey === key ? MORANDI.sidebarActiveText : MORANDI.sidebarText,
    backgroundColor: currentKey === key ? MORANDI.sidebarActive : 'transparent',
    borderRadius: 8,
    margin: '2px 8px',
    width: 'calc(100% - 16px)',
    paddingLeft: 16,
  });

  const desktopLayout = (
    <Layout style={{ minHeight: '100vh' }}>
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
            {siderCollapsed ? 'RNA' : t('RNA Visualization')}
          </div>
          <div style={{ paddingTop: 8 }}>
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  ...menuItemStyle(item.key),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  fontWeight: currentKey === item.key ? 600 : 400,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
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
            fontSize: 22,
            fontWeight: 'bold',
            color: MORANDI.titleColor,
            marginBottom: 4,
          }}>
            {pageTitles[currentKey] || ''}
          </h1>
          <hr style={{
            border: 'none',
            borderTop: '2px solid #B8A9C9',
            marginBottom: 20,
          }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );

  const mobileLayout = (
    <Layout style={{ minHeight: '100vh' }}>
      <div style={{
        backgroundColor: MORANDI.sidebarBg,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 14,
          wordBreak: 'break-word',
          maxWidth: '60%',
        }}>
          {t('RNA Visualization')}
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
      <div style={{
        backgroundColor: MORANDI.sidebarBg,
        padding: '4px 0',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => navigate(item.key)}
            style={{
              ...menuItemStyle(item.key),
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              margin: '4px 8px',
              fontWeight: currentKey === item.key ? 600 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <Content style={{
        padding: 16,
        overflow: 'auto',
        paddingBottom: 80,
        backgroundColor: MORANDI.contentBg,
      }}>
        <h1 style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: MORANDI.titleColor,
          marginBottom: 4,
        }}>
          {pageTitles[currentKey] || ''}
        </h1>
        <hr style={{
          border: 'none',
          borderTop: '2px solid #B8A9C9',
          marginBottom: 16,
        }} />
        <Outlet />
      </Content>
    </Layout>
  );

  return isDesktop ? desktopLayout : mobileLayout;
};

export default VizLayout;