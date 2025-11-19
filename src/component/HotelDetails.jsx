import React from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Typography, 
  Card, 
  Tag, 
  Skeleton, 
  Row, 
  Col,
  Layout,
  Breadcrumb,
  Image,
  Button,
  Tooltip,
  message,
  Empty
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { 
  HomeOutlined, 
  EnvironmentOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  FileTextOutlined,
  StarOutlined,
  WifiOutlined,
  CarOutlined,
  CoffeeOutlined,
  BankOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { fetchHotelDetails } from "../api/jsonServer";

const { Title, Paragraph, Text } = Typography;
const { Header } = Layout;

// Styled Components
const StyledLayout = styled(Layout)`min-height: 100vh; background: #f0f2f5;`;
const StyledHeader = styled(Header)`background: white; padding: 0 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between;`;
const PageWrapper = styled.div`max-width: 1200px; margin: 0 auto; padding: 24px;`;
const HeroSection = styled.div`background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); color: white; padding: 60px 0; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);`;
const StyledCard = styled(Card)`border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px; overflow: hidden; .ant-card-head { background: #7c7eedff; border-bottom: 1px solid #810909ff; }`;
const ImageCard = styled.div`background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; &:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }`;
const ImageWrapper = styled.div`position: relative; width: 100%; height: 200px; overflow: hidden;`;
const StyledImage = styled(Image)`width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; &:hover { transform: scale(1.05); }`;
const ImageInfo = styled.div`padding: 12px; background: white; border-top: 1px solid #f0f0f0;`;
const ImageName = styled(Text)`display: block; color: #666; font-size: 12px; text-align: center; word-break: break-all;`;
const AmenitySection = styled.div`margin-bottom: 24px; &:last-child { margin-bottom: 0; }`;
const AmenityTitle = styled(Title)`margin-bottom: 16px !important; padding-bottom: 8px; border-bottom: 2px solid ${props => props.color || '#1890ff'};`;
const StyledTag = styled(Tag)`margin: 4px; padding: 4px 12px; border-radius: 16px; font-size: 14px; display: inline-flex; align-items: center; .anticon { margin-left: 4px; }`;


const HotelDetails = () => {
  const { id } = useParams();
  const { data: hotel, isPending, isError } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => fetchHotelDetails(id),
    onError: () => {
      message.error('خطا در دریافت اطلاعات هتل');
    }
  });
  console.log('Hotel Data:', hotel); 
  //ایجاد ایکون برای هر امکانات
   const getAmenityIcon = (type) => {
    const icons = {
      'WiFi رایگان': <WifiOutlined />,
      'پارکینگ': <CarOutlined />,
      'رستوران': <CoffeeOutlined />,
      'لابی': <BankOutlined />,
      'default': <StarOutlined />
    };
    return icons[type] || icons.default;
  };

 if (isPending) {
    return (
      <StyledLayout>
        <StyledHeader />
        <PageWrapper>
          <Skeleton active paragraph={{ rows: 6 }} />
        </PageWrapper>
      </StyledLayout>
    );
  }

  if (isError || !hotel) {
    return (
      <StyledLayout>
        <StyledHeader />
        <PageWrapper>
          <StyledCard>
            <Empty description="اطلاعات هتل یافت نشد" />
          </StyledCard>
        </PageWrapper>
      </StyledLayout>
    );
  }


   return (
    <StyledLayout>
      <StyledHeader>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/"><HomeOutlined /> خانه</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/hotels">اقامتگاه</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{hotel.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Button type="primary" icon={<ArrowLeftOutlined />}>
          <Link to="/hotels" style={{ color: 'inherit' }}>لیست اقامتگاه</Link>
        </Button>
      </StyledHeader>

      <HeroSection>
        <PageWrapper>
          <Title level={1} style={{ color: 'white', margin: 0 }}>{hotel.name}</Title>
          {hotel.location?.address?.city && (
            <Text style={{ color: '#e6f7ff' }}>
              <EnvironmentOutlined /> {hotel.location.address.city}
            </Text>
          )}
        </PageWrapper>
      </HeroSection>

      <PageWrapper>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <StyledCard title={<span><FileTextOutlined style={{ marginLeft: 8 }} /> درباره اقامتگاه</span>}>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                {hotel.content?.aboutHotel || hotel.description?.long}
              </Paragraph>
            </StyledCard>

            <StyledCard title={<span><CameraOutlined style={{ marginLeft: 8 }} /> گالری تصاویر</span>}>
              <Row gutter={[16, 16]}>
                {hotel.content?.images?.map((image, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <ImageCard>
                      <ImageWrapper>
                        <StyledImage src={image.url} alt={`تصویر ${index + 1}`} preview={{ mask: 'مشاهده تصویر' }} />
                      </ImageWrapper>
                      <ImageInfo>
                        <Tooltip title={image.url.split('/').pop()}>
                          <ImageName ellipsis>{image.url.split('/').pop()}</ImageName>
                        </Tooltip>
                      </ImageInfo>
                    </ImageCard>
                  </Col>
                ))}
              </Row>
            </StyledCard>
          </Col>

          <Col xs={24} lg={8}>
            <StyledCard>
              <AmenitySection  >
                <AmenityTitle level={4} color="#1890ff">امکانات عمومی</AmenityTitle>
                {hotel.amenities?.general?.map(item => (
                  <StyledTag color="blue" key={item}>{getAmenityIcon(item)} {item}</StyledTag>
                ))}
              </AmenitySection>

              <AmenitySection>
                <AmenityTitle level={4} color="#52c41a">امکانات رفاهی</AmenityTitle>
                {hotel.amenities?.wellness?.map(item => (
                  <StyledTag color="green" key={item}>{getAmenityIcon(item)} {item}</StyledTag>
                ))}
              </AmenitySection>

              <AmenitySection>
                <AmenityTitle level={4} color="#722ed1">رستوران و کافی‌شاپ</AmenityTitle>
                {hotel.amenities?.dining?.map(item => (
                  <StyledTag color="purple" key={item}>{getAmenityIcon(item)} {item}</StyledTag>
                ))}
              </AmenitySection>
            </StyledCard>

            <StyledCard title={<span><StarOutlined style={{ marginLeft: 8 }} /> قوانین و مقررات</span>}>
              <Paragraph>{hotel.content?.rules || 'قوانین و مقررات هتل در دسترس نیست'}</Paragraph>
            </StyledCard>

           
          </Col>
        </Row>
      </PageWrapper>
    </StyledLayout>
  );
};

export default HotelDetails;
















