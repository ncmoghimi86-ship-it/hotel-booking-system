// src/styles/theme.js
export const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorBgBase: '#f5f7fa',
    colorTextBase: '#1a1a1a',
    fontFamily: "'Vazir', sans-serif",
    borderRadius: 16,
  },
  components: {
    Menu: {
      itemHoverBg: 'rgba(255,255,255,0.8)',
      itemSelectedBg: 'rgba(255,255,255,0.8)',
      itemColor: '#1a1a1a',
      itemHoverColor: '#1890ff',
      itemSelectedColor: '#1890ff',
    },
    Card: { headerBg: 'linear-gradient(135deg, #001529, #1890ff)', colorTextHeading: '#fff' },
    Table: { headerBg: '#f0f7ff', rowHoverBg: '#e6f7ff' },
    Modal: { headerBg: '#001529', titleColor: '#fff' },
    Button: { primaryShadow: '0 4px 12px rgba(24,144,255,0.3)' },
  },
};