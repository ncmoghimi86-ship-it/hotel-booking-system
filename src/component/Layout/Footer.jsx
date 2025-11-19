import React from 'react';
import { Layout, Row, Col, Typography, Space, Button, Divider } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  return (
    <AntFooter style={{ background: '#001529', padding: '60px 0', color: 'white' }}>
      <Row justify="space-around" gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>درباره ما</Title>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
            از شمال تا جنوب ایران، جاباما جوره
          </Text>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>لینک‌های مفید</Title>
          <Space direction="vertical">
            <Button type="link" style={{ color: 'rgba(255,255,255,0.65)', padding: 0, fontSize: '14px' }}>
              قوانین و مقررات
            </Button>
            <Button type="link" style={{ color: 'rgba(255,255,255,0.65)', padding: 0, fontSize: '14px' }}>
              سوالات متداول
            </Button>
            <Button type="link" style={{ color: 'rgba(255,255,255,0.65)', padding: 0, fontSize: '14px' }}>
              راهنمای رزرو
            </Button>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>تماس با ما</Title>
          <Space direction="vertical" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <Text style={{ fontSize: '14px' }}>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</Text>
            <Text style={{ fontSize: '14px' }}>ایمیل: info@hotelyar.com</Text>
            <Text style={{ fontSize: '14px' }}>آدرس: تهران، خیابان ولیعصر</Text>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: 'white', marginBottom: '20px' }}>شبکه‌های اجتماعی</Title>
          <Space size="large">
            <Button 
              type="link" 
              icon={<FacebookOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)' }} />}
              href="#"
              style={{ padding: 0 }}
            />
            <Button 
              type="link" 
              icon={<TwitterOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)' }} />}
              href="#"
              style={{ padding: 0 }}
            />
            <Button 
              type="link" 
              icon={<InstagramOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)' }} />}
              href="#"
              style={{ padding: 0 }}
            />
            <Button 
              type="link" 
              icon={<LinkedinOutlined style={{ fontSize: '24px', color: 'rgba(255,255,255,0.85)' }} />}
              href="#"
              style={{ padding: 0 }}
            />
          </Space>
        </Col>
      </Row>
      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />
      <Row justify="center">
        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
          © ۱۴۰4 رزرو اقامتگاه - تمامی حقوق محفوظ است
        </Text>
      </Row>
    </AntFooter>
  );
};

export default Footer;
