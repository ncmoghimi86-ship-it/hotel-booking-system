
import React, { useState } from 'react';
import { Card, Rate, Button, Space, Tag, Collapse } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
const { Panel } = Collapse;
const HotelCard = ({
  hotel,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      hoverable
      className="glow-hover fade-in"
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.4s ease' // انیمیشن بزرگ شدن
      }}
      bodyStyle={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: expanded ? '24px' : '16px', // بزرگ‌تر وقتی expand
        transition: 'padding 0.4s ease'
      }}
      cover={
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            alt={hotel.name}
            src={hotel.image || '/api/placeholder/400/300'}
            style={{ 
              height: expanded ? 280 : 220, // تصویر بزرگ‌تر وقتی expand
              width: '100%',
              objectFit: 'cover', 
              transition: 'height 0.4s ease, transform 0.3s ease' 
            }}
            onError={(e) => {
              e.target.src = '/api/placeholder/400/300';
            }}
            className="glow-hover-img"
          />
        </div>
      }
      actions={[
        <Button
          key="details"
          type="primary"
          size="large"
          block
          onClick={() => onViewDetails(hotel.id)}
          style={{ borderRadius: '0 0 16px 16px', marginTop: 'auto' }}
        >
          مشاهده جزئیات
        </Button>,
      ]}
    >
      <Card.Meta
        title={
          <div className="ant-card-meta-title" style={{ fontSize: expanded ? '20px' : '18px', fontWeight: 'bold', color: '#001529', marginBottom: 12, transition: 'font-size 0.4s ease' }}>
            {hotel.name}
          </div>
        }
        description={
          <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1, justifyContent: 'space-between' }}>
            <div>
              <Rate allowHalf disabled defaultValue={hotel.rating || 4.5} style={{ fontSize: 16, marginBottom: 12 }} />
              
              {hotel.location?.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Tag color="cyan" style={{ borderRadius: '20px' }}>موقعیت</Tag>
                  <span style={{ color: '#1a1a1a' }}>{hotel.location.city}</span>
                </div>
              )}
              
              {hotel.facilities?.length > 0 && (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 12 }}>
                    {hotel.facilities.slice(0, expanded ? hotel.facilities.length : 4).map((facility, index) => (
                      <Tag key={index} color="blue" style={{ borderRadius: '20px', fontSize: '12px' }}>
                        {facility}
                      </Tag>
                    ))}
                  </div>
                  
                  {hotel.facilities.length > 4 && !expanded && (
                    <div 
                      onClick={() => setExpanded(true)} 
                      style={{ 
                        cursor: 'pointer', 
                        color: '#1890ff', 
                        fontWeight: '500', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4,
                        fontSize: '14px'
                      }}
                    >
                      +{hotel.facilities.length - 4} بیشتر...
                      <DownOutlined style={{ fontSize: '12px' }} />
                    </div>
                  )}
                  
                  {expanded && (
                    <div 
                      onClick={() => setExpanded(false)} 
                      style={{ 
                        cursor: 'pointer', 
                        color: '#1890ff', 
                        fontWeight: '500', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4,
                        fontSize: '14px',
                        marginTop: 8
                      }}
                    >
                      کمتر نشان بده
                      <UpOutlined style={{ fontSize: '12px' }} />
                    </div>
                  )}
                </>
              )}
            </div>
            
            {hotel.price > 0 && (
              <div style={{ marginTop: 'auto', fontSize: '16px' }}>
                <strong style={{ color: '#1890ff', fontSize: expanded ? '20px' : '18px', transition: 'font-size 0.4s ease' }}>
                  {hotel.price.toLocaleString()} تومان
                </strong>
                <span style={{ color: '#666', fontSize: '14px' }}> / هرشب</span>
              </div>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default HotelCard;