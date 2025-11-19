import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { StyledLayout, StyledContent } from '../styles/styles';
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <StyledLayout>
      <StyledContent>
        <Result
          status="404"
          title="صفحه مورد نظر یافت نشد"
          subTitle="متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد."
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              بازگشت به صفحه اصلی
            </Button>
          }
        />
      </StyledContent>
    </StyledLayout>
  );
};

export default NotFound;