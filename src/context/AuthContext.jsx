import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserById } from '../api/JsonServer' 
import { message } from 'antd'; 

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // ذخیره اطلاعات کاربر
  const [isAuthenticated, setIsAuthenticated] = useState(false); // وضعیت احراز هویت

  // تابع برای ورود
  const login = async (userData) => {
    try {
      const fullUserData = await getUserById(userData.id);
      if (!fullUserData) {
        throw new Error('کاربر یافت نشد');
      }
      setUser(fullUserData); 
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      localStorage.setItem('isAuthenticated', 'true');
      message.success('ورود با موفقیت انجام شد');
    } catch (error) {
      console.error('Login error:', error);
      message.error('خطا در ورود: ' + error.message);
      throw error;
    }
  };

  // تابع برای خروج
  const logOut = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      message.success('با موفقیت خارج شدید');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('خطا در خروج: ' + error.message);
      throw error;
    }
  };

  // آپدیت اطلاعات کاربر
  const updateUser = (updatedData) => {
    try {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      message.success('اطلاعات کاربر به‌روزرسانی شد');
    } catch (error) {
      console.error('Update user error:', error);
      message.error('خطا در به‌روزرسانی اطلاعات کاربر');
      throw error;
    }
  };

  // لود اطلاعات کاربر از localStorage موقع بارگذاری اولیه
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    if (storedUser && storedIsAuthenticated === 'true') {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// هوک سفارشی برای استفاده از AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('در محدوده کانتکست نبود');
  }
  return context;
};