
import React, { useState, useCallback, Suspense } from "react";
import {
  Layout,
  Menu,
  Spin,
  Button,
  Result,
  notification,
  Typography,
  Avatar,
  Space,
} from "antd";
import {
  BookOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchUserReservations } from "../../api/JsonServer";
import RoomReservationForm from "./RoomReservationForm";
import ReservationList from "./ReservationList";
import HotelComparison from "./HotelComparison";
import Profile from "./Profile";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState("reservations");
  const queryClient = useQueryClient();

  // --- لود رزروهای کاربر ---
  const {
    data: reservations = [],
    isPending: reservationsLoading,
    isError: reservationsError,
  } = useQuery({
    queryKey: ["userReservations", user?.id],
    queryFn: () => fetchUserReservations(user?.id),
    enabled: !!user?.id, // فقط اگر کاربر لاگین باشه
    onError: (error) => {
      notification.error({
        message: "خطا",
        description: error.message || "خطا در دریافت رزروها",
      });
    },
  });

  // --- تابع خروج ---
  const handleLogout = useCallback(() => {
    try {
      logOut();
      navigate("/login");
      notification.success({
        message: "خروج موفق",
        description: "با موفقیت از سیستم خارج شدید",
      });
    } catch (error) {
      notification.error({
        message: "خطا",
        description: error.message || "خطا در خروج از سیستم",
      });
    }
  }, [logOut, navigate]);

  // --- رندر محتوای اصلی بر اساس تب ---
  const renderMainContent = () => {
    if (!user) {
      return (
        <Result
          status="403"
          title="دسترسی محدود شده"
          subTitle="لطفاً برای دسترسی وارد شوید"
          extra={<Button type="primary" onClick={() => navigate("/login")}>ورود</Button>}
        />
      );
    }

    if (reservationsError && activeTab === "reservations") {
      return (
        <Result
          status="error"
          title="خطا در بارگذاری رزروها"
          subTitle="لطفاً دوباره تلاش کنید"
          extra={
            <Button
              type="primary"
              onClick={() => queryClient.invalidateQueries(["userReservations", user?.id])}
            >
              تلاش مجدد
            </Button>
          }
        />
      );
    }

    switch (activeTab) {
      case "reservations":
        return (
          <ReservationList
            reservations={reservations}
            isLoading={reservationsLoading}
            onReservationSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ["userReservations", user?.id],
              });
            }}
          />
        );
      case "reservationForm":
        return (
          <RoomReservationForm
            user={user}
            onSuccess={() => {
              notification.success({
                message: "موفق",
                description: "رزرو با موفقیت ثبت شد",
              });
              queryClient.invalidateQueries({
                queryKey: ["userReservations", user?.id],
              });
              setActiveTab("reservations");
            }}
          />
        );
      case "compare":
        return <HotelComparison userId={user?.id} />;
      case "profile":
        return <Profile userId={user?.id} />;
      default:
        return null;
    }
  };

  // --- اگر کاربر لاگین نباشه ---
  if (!user) {
    return (
      <Result
        status="403"
        title="دسترسی محدود شده"
        subTitle="لطفاً برای دسترسی به پنل کاربری وارد شوید"
        extra={<Button type="primary" onClick={() => navigate("/login")}>ورود به سیستم</Button>}
      />
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* --- سایدبار راست (gradient آبی، اسم سفید، avatar شیک) --- */}
      <Sider width={280} className="user-sider" theme="light">
        <div className="sider-header">
          <Avatar
            size={80}
            src={user?.profilePicture || undefined}
            icon={!user?.profilePicture && <UserOutlined />}
            className="sider-avatar"
          />
          <Title level={4} className="sider-username">
            {user?.firstName} {user?.lastName}
          </Title>
          <Text className="sider-welcome">خوش آمدید!</Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            if (key === "logout") {
              handleLogout();
            } else {
              setActiveTab(key);
            }
          }}
          className="sider-menu"
        >
          <Menu.Item key="reservations" icon={<BookOutlined />}>
            رزروها
          </Menu.Item>
          <Menu.Item key="reservationForm" icon={<BookOutlined />}>
            رزرو جدید
          </Menu.Item>
          <Menu.Item key="compare" icon={<AppstoreOutlined />}>
            مقایسه هتل‌ها
          </Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />}>
            پروفایل
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
            خروج
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="dashboard-layout">
        <Header className="dashboard-header">
          <Space align="center" size="large">
            <HomeOutlined className="header-home-icon" onClick={() => navigate("/")} style={{ cursor: 'pointer' }} />
            <div>
              <Title level={3} className="header-welcome">
                خوش آمدید، {user?.firstName} {user?.lastName}!
              </Title>
              <Text type="secondary" className="header-subtitle">
                {activeTab === "reservations" && "مدیریت رزروهای شما"}
                {activeTab === "reservationForm" && "ثبت رزرو جدید"}
                {activeTab === "compare" && "مقایسه هتل‌های مورد علاقه"}
                {activeTab === "profile" && "تنظیمات پروفایل"}
              </Text>
            </div>
          </Space>
        </Header>
        {/* --- محتوای تب --- */}
        <Content className="dashboard-content">
          <Suspense fallback={<Spin size="large" tip="در حال بارگذاری..." style={{ display: 'block', margin: '40px auto' }} />}>
            {renderMainContent()}
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserDashboard;