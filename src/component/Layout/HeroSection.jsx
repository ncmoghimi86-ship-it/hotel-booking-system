import React from 'react';
import { Typography } from 'antd';
import slider from '../../assets/images/slider.jpg'

const { Title, Text } = Typography;
const HeroSection = () => {
  return (
    <div style={{
      height: '500px',
      background: `url(${slider})`,
     backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      color: 'white',
      marginTop: '64px'
    }}>
      <Title style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
      اجاره ویلا، سوئیت و اقامتگاه در شمال و سراسر ایران      </Title>
      <Text style={{ color: 'white', fontSize: '20px', marginBottom: '32px' }}>
      سفر  از تو، جاباما      </Text>
   
    </div>
  );
};

export default HeroSection;