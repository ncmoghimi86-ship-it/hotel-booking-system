import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import fa_IR from 'antd/locale/fa_IR';
import { AuthProvider } from './context/AuthContext';
/////////////////////////
import dayjs from 'dayjs';
import faIR from 'antd/locale/fa_IR';
import 'dayjs/locale/fa';
dayjs.locale('fa');
////////////////////////////////
import App from './App';
// تنظیمات react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, 
    },
  },
});

// تنظیمات antd
const antdConfig = {
  direction: 'rtl',
  locale: fa_IR,
  theme: {
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontSize: 14,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ConfigProvider  locale={faIR} {...antdConfig}>
            <App />
          </ConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);