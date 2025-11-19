
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { useAuth } from "../context/AuthContext";
import { getUserByEmail, updateUserLogin } from "../api/JsonServer";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handlerLogin = async (values) => {
    console.log('شروع لاگین:', values); // دیباگ: ورودی‌های فرم
    try {
      setIsLoading(true);
      const user = await getUserByEmail(values.email);
      console.log('نتیجه getUserByEmail:', user); // دیباگ: کاربر پیدا شده یا نه
      if (!user) {
        throw new Error('کاربری با این ایمیل یافت نشد');
      }
      console.log('مقایسه رمز:', { input: values.password, stored: user.password }); // دیباگ: رمز ورودی و ذخیره‌شده
      if (user.password !== values.password) {
        throw new Error('رمز ورود اشتباه است');
      }
      await updateUserLogin(user.id, {
        lastLogin: new Date().toISOString(),
      });
      console.log('کاربر قبل از login:', user); // دیباگ: قبل از لاگین
      login(user);
      console.log('کاربر بعد از login:', user); // دیباگ: بعد از لاگین
      notification.success({
        message: 'ورود موفق',
        description: `${user.firstName} ${user.lastName} خوش آمدید`,
      });
      const routes = {
        'Admin': '/admin-dashboard',
       'Hotel Manager': '/admin-dashboard',
        'Guest': '/user-dashboard',
      };
      console.log('ریدایرکت به:', routes[user.role] || '/'); // دیباگ: مسیر ریدایرکت
      navigate(routes[user.role] || '/');
      return { success: true };
    } catch (error) {
      console.error('خطای لاگین:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      notification.error({
        message: 'خطا در ورود',
        description: error.message || 'مشکلی پیش آمد',
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { handlerLogin, isLoading };
};