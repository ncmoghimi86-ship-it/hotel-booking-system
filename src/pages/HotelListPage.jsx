import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Typography, Space, Rate, Tag, Layout } from 'antd';
import { useQuery } from '@tanstack/react-query'; 
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { fetchHotels } from '../api/jsonServer';
import NabBar from '../component/Layout/NabBar';

const { Search } = Input;
const { Title } = Typography;
const { Content } = Layout;

const HotelListPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  //hotels
  const{ data:hotels=[],isPending:isLoading, error,}=useQuery({
  queryKey:['hotels'],
  queryFn:fetchHotels
});

//
useEffect(()=>{
  if(hotels){
    const filtered=hotels.filter(hotel=>
      hotel.name?.toLowerCase().includes(searchText.toLowerCase())||
      hotel.location?.city?.toLowerCase().includes(searchText.toLowerCase())||
      hotel.description?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredData(filtered);
  }
},[searchText,hotels]);

 // ستون‌های جدول
  const columns = [
    {
      title: 'نام هتل',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            <EnvironmentOutlined /> {record.location?.city}
          </span>
        </Space>
      ),
    },
    {
      title: 'امتیاز',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'دسته‌بندی',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => {
        const colors = {
          villa: 'green',
          apartment: 'blue',
          cottage: 'purple',
          beach: 'cyan',
        };
        const labels = {
          villa: 'ویلا',
          apartment: 'آپارتمان',
          cottage: 'کلبه',
          beach: 'ساحلی',
        };
        return <Tag color={colors[category]}>{labels[category]}</Tag>;
      },
      filters: [
        { text: 'ویلا', value: 'villa' },
        { text: 'آپارتمان', value: 'apartment' },
        { text: 'کلبه', value: 'cottage' },
        { text: 'ساحلی', value: 'beach' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'قیمت',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price) => `${price?.toLocaleString()} تومان`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary"
          onClick={() => navigate(`/hotels/${record.id}`)}
        >
          مشاهده و رزرو
        </Button>
      ),
    },
  ];
  //
  const renderContent = () => {
    if (error) {
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Title level={3} type="danger">خطا در بارگیری اطلاعات</Title>
          <Button type="primary" onClick={() => window.location.reload()}>
            تلاش مجدد
          </Button>
        </div>
      );
    }

    return (
      <div style={{ 
        background: '#fff',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>لیست هتل‌ها</Title>
            <Search
              placeholder="جستجو در هتل‌ها..."
              prefix={<SearchOutlined />}
              allowClear
              enterButton="جستجو"
              size="large"
              style={{ width: 400 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={isLoading}
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showTotal: (total) => `مجموع ${total} هتل`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 800 }}
          />
        </Space>
      </div>
    );
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <NabBar/>
      <Layout>
        <Content style={{ 
          padding: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );

};
export default HotelListPage;