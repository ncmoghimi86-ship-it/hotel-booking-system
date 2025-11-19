import styled from 'styled-components';
import { Layout, Typography } from 'antd';
const { Content } = Layout;
const { Title } = Typography;
export const StyledLayout = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5;
`;
export const StyledContent = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
`;
export const StyledTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;
export const CardContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

export const FlexContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
`;
