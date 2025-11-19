
import React from 'react';
import { Menu, Layout, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, UserOutlined, InfoCircleOutlined, ContactsOutlined, ShopOutlined } from '@ant-design/icons';

const { Header } = Layout;

function NabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Header className="navbar-header" style={{ position: 'sticky', top: 0, width: '100%', zIndex: 1000, padding: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="logo glow-hover" onClick={() => navigate('/')} style={{ padding: '0 24px', fontSize: '24px', fontWeight: 'bold', color: '#1890ff', cursor: 'pointer' }}>
        هتل‌یار
      </div>
      <Menu mode="horizontal" selectedKeys={[location.pathname]} className="navbar-menu" style={{ flex: 1, justifyContent: 'center', background: 'transparent', border: 'none' }}>
        <Menu.Item key="/" icon={<HomeOutlined />} onClick={() => navigate('/')}>صفحه اصلی</Menu.Item>
        <Menu.Item key="/hotels" icon={<ShopOutlined />} onClick={() => navigate('/hotels')}>هتل‌ها</Menu.Item>
        <Menu.Item key="/about" icon={<InfoCircleOutlined />} onClick={() => navigate('/about')}>درباره ما</Menu.Item>
        <Menu.Item key="/contact" icon={<ContactsOutlined />} onClick={() => navigate('/contact')}>تماس با ما</Menu.Item>
      </Menu>
      <div className="auth-buttons" style={{ padding: '0 24px', display: 'flex', gap: 12 }}>
        <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/login')} className="glow-hover">ورود</Button>
        <Button type="primary" onClick={() => navigate('/register')} className="glow-hover">ثبت نام</Button>
      </div>
    </Header>
  );
}

export default NabBar;