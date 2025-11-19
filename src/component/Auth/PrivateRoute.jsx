//این کامپوننت مثل یه فیلتر عمل می‌کنه که فقط کاربران مجاز
//  (لاگین‌شده و با نقش درست) بتونن به صفحات حساس دسترسی پیدا کنن
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (roles.length && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
};
export default PrivateRoute;