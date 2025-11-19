import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {  ConfigProvider } from 'antd';
import { theme } from './styles/themes';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './component/HomePage';
import Login from './component/Auth/Login';
import Register from './component/Auth/Register'
import NotFound from './component/NotFound';
import AdminDashboard from './component/Dashboard/AdminDashboard'
import UserDashboard from './component/Dashboard/UserDashboard'
import HotelDetails from './component/HotelDetails';
import HotelListPage from './pages/HotelListPage';
import PaymentPage from './pages/PaymentPage';
import PrivateRoute from './component/Auth/PrivateRoute';
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        direction="rtl"
      
        theme={theme}
      >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hotels" element={<HotelListPage />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/payment/:id" element={<PaymentPage />} />
            {/* Protected Routes */}
            <Route path="/user-dashboard"element={<PrivateRoute roles={["Guest"]}> <UserDashboard /> </PrivateRoute>}/>
            <Route path="/user-dashboard/*"element={ <PrivateRoute roles={["Guest"]}>  <UserDashboard /> </PrivateRoute>} />
            <Route path="/admin-dashboard/*" element={ <PrivateRoute roles={["Admin", "Hotel Manager"]}> <AdminDashboard /> </PrivateRoute> } />
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />

          </Routes>
      </ConfigProvider>
    </QueryClientProvider>
    
  );
};

export default App;
