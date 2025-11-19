import React, { useState } from 'react';
import { Layout, Spin, Alert, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HeartOutlined, HomeOutlined, ShopOutlined, EnvironmentOutlined, GiftOutlined, BankOutlined, CompassOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchHotels } from '../api/jsonServer';
import NabBar from '../component/Layout/NabBar';
import HotelCard from '../component/hotels/HotelCard';
import HeroSection from './Layout/HeroSection';
import Footer from './Layout/Footer';
const { Content } = Layout;
const categories = [
  { key: 'recreation', title: 'تفریحات', icon: <CompassOutlined /> },
  { key: 'special', title: 'پیشنهاد ویژه', icon: <GiftOutlined />, badge: 'تخفیف' },
  { key: 'apartment', title: 'آپارتمان', icon: <BankOutlined /> },
  { key: 'beach', title: 'ساحلی', icon: <EnvironmentOutlined /> },
  { key: 'rental', title: 'استخردار', icon: <ShopOutlined /> },
  { key: 'favorite', title: 'به سلیقه شما', icon: <HeartOutlined /> },
  { key: 'cottage', title: 'کلبه', icon: <HomeOutlined style={{ transform: 'rotate(45deg)' }} /> },
  { key: 'villa', title: 'ویلا', icon: <HomeOutlined /> }
];

const HomePage = () => {
  const navigate = useNavigate();
  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => await fetchHotels()
  });

  const [filters, setFilters] = useState({ categories: [] });

  const filteredHotels = hotels.filter(hotel => 
    filters.categories.length === 0 || filters.categories.includes(hotel.category)
  );

  const handleCategoryClick = (key) => {
    setFilters(prev => ({
      categories: prev.categories.includes(key)
        ? prev.categories.filter(c => c !== key)
        : [...prev.categories, key]
    }));
  };

  const renderHotelCards = () => {
    if (hotelsLoading) return <Spin size="large" tip="در حال بارگذاری..." style={{ display: 'block', margin: '40px auto' }} />;
    if (filteredHotels.length === 0) return <Alert message="هیچ هتلی پیدا نشد" description={<Button type="link" onClick={() => setFilters({ categories: [] })}>پاک کردن فیلترها</Button>} type="info" showIcon className="fade-in" />;

    return (
      <Row gutter={[24, 24]} align="stretch" className="fade-in">
        {filteredHotels.map(hotel => (
          <Col key={hotel.id} xs={24} sm={12} lg={8} style={{ display: 'flex' }}>
            <div className="hotel-card-container glow-hover" style={{ width: '100%' }}>
              <HotelCard hotel={hotel} onViewDetails={() => navigate(`/hotels/${hotel.id}`)} />
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const CategoryIcons = () => (
    <div className="fade-in" style={{ background: '#fff', padding: '24px', marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
      <Row gutter={[16, 16]} justify="start" wrap={false} style={{ minWidth: 'fit-content' }}>
        {categories.map(category => (
          <Col key={category.key} flex="auto">
            <div onClick={() => handleCategoryClick(category.key)} className="category-icon glow-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', transition: 'all 0.3s ease', borderRadius: '16px', whiteSpace: 'nowrap' }}>
              <div style={{ position: 'relative', fontSize: '28px', marginBottom: '8px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid #e8e8e8', color: filters.categories.includes(category.key) ? '#1890ff' : '#666', backgroundColor: filters.categories.includes(category.key) ? '#e6f7ff' : '#fff', boxShadow: filters.categories.includes(category.key) ? '0 0 20px rgba(24,144,255,0.3)' : '0 4px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}>
                {category.icon}
                {category.badge && <span style={{ position: 'absolute', top: -8, right: -8, background: '#ff4d4f', color: '#fff', padding: '4px 8px', fontSize: '11px', borderRadius: '20px', fontWeight: 'bold' }}>{category.badge}</span>}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '500', color: filters.categories.includes(category.key) ? '#1890ff' : '#1a1a1a' }}>{category.title}</span>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <Layout className="min-h-screen no-sider" style={{ background: '#f5f7fa' }}>
      <NabBar />
      <HeroSection />
      <Content className="fade-in" style={{ padding: '24px 0' }}>
        <div className="max-w-7xl mx-auto px-4">
          <CategoryIcons />
          <div className="glow-hover" style={{ background: '#fff', padding: 32, borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            {renderHotelCards()}
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default HomePage;