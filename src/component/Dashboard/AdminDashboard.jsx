
import React, { useState } from "react";
import {
  Form,
  Layout,
  Menu,
  Button,
  Space,
  Badge,
  Modal,
  List,
  Typography,
  Spin,
  message,
  Avatar,
} from "antd";
import {
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  PictureOutlined,
  CalendarOutlined,
  BellOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  fetchReservations,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../api/JsonServer';
import ManageUsers from "./ManageUsers";
import ManageHotels from "./ManageHotels";
import ManageBookings from "./ManageBookings";
import ContentManagement from "./ContentManagement";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const queryClient = useQueryClient();
  // --- دریافت رزروها ---
  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    select: (data) => (Array.isArray(data) ? data : []),
    onError: () => message.error("خطا در دریافت اطلاعات رزروها"),
  });

  // --- دریافت نوتیفیکیشن‌های جدید (unread) ---
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(user?.id),
    enabled: !!user?.id,
    select: (data) => {
      return Array.isArray(data)
        ? data
            .filter((n) => n.status === "unread" && n.deletedAt === null)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
    },
    onError: (error) => message.error("خطا در دریافت اعلان‌ها: " + error.message),
  });

  // --- علامت‌گذاری یک نوتیفیکیشن ---
  const markNotificationMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", user?.id]);
    },
    onError: () => message.error("خطا در علامت‌گذاری نوتیفیکیشن"),
  });

  // --- علامت‌گذاری همه ---
  const markAllNotificationsMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", user?.id]);
      message.success("همه اعلان‌ها خوانده شدند");
    },
    onError: () => message.error("خطا در علامت‌گذاری همه اعلان‌ها"),
  });

  // --- حذف نوتیفیکیشن ---
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications", user?.id]);
      message.success("نوتیفیکیشن حذف شد");
    },
    onError: () => message.error("خطا در حذف نوتیفیکیشن"),
  });

  // --- خروج ---
  const handleLogout = () => {
    logOut();
    navigate("/login");
    message.success("با موفقیت خارج شدید");
  };
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelModal, setHotelModal] = useState(false);
  const [hotelForm] = Form.useForm(); 

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Sider width={280} className="admin-sider" theme="light">
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
          <Text className="sider-welcome">ادمین عزیز، خوش آمدید!</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          className="sider-menu"
        >
          <Menu.Item key="users" icon={<UserOutlined />}>
            کاربران
          </Menu.Item>
          <Menu.Item key="hotels" icon={<HomeOutlined />}>
            هتل‌ها
          </Menu.Item>
          <Menu.Item key="bookings" icon={<CalendarOutlined />}>
            رزروها
          </Menu.Item>
          <Menu.Item key="content" icon={<PictureOutlined />}>
            محتوا
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={handleLogout}>
            خروج
          </Menu.Item>
        </Menu>
      </Sider>

      {/* --- محتوای اصلی --- */}
      <Layout className="dashboard-layout">
        <Header className="dashboard-header">
          <Space align="center" size="large">
            <HomeOutlined className="header-home-icon" onClick={() => navigate("/")} style={{ cursor: 'pointer' }} />
            <div>
              <Title level={3} className="header-welcome">
                خوش آمدید، {user?.firstName} {user?.lastName || "ادمین"}!
              </Title>
              <Text type="secondary" className="header-subtitle">
                {activeTab === "users" && "مدیریت کاربران"}
                {activeTab === "hotels" && "مدیریت هتل‌ها"}
                {activeTab === "bookings" && "مدیریت رزروها"}
                {activeTab === "content" && "مدیریت محتوا"}
              </Text>
            </div>
          </Space>
          <Space size="middle">
            <Badge count={notificationsLoading ? 0 : notifications.length} overflowCount={99}>
              <BellOutlined
                className="header-bell"
                onClick={() => setNotificationModalVisible(true)}
              />
            </Badge>
            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
              خروج
            </Button>
          </Space>
        </Header>

        {/* --- محتوای تب --- */}
        <Content className="dashboard-content">
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "hotels" &&
           <ManageHotels
          selectedHotel={selectedHotel}
          setSelectedHotel={setSelectedHotel}
          hotelModal={hotelModal}
          setHotelModal={setHotelModal}
          hotelForm={hotelForm}
            />
           }
          {activeTab === "bookings" && (
            <ManageBookings
              reservations={reservations}
              loading={reservationsLoading}
            />
          )}
          {activeTab === "content" && <ContentManagement />}
        </Content>
      </Layout>

      <Modal
        title={<Title level={4}>اعلان‌های جدید ({notifications.length})</Title>}
        open={notificationModalVisible}
        onCancel={() => {
          setNotificationModalVisible(false);
          markAllNotificationsMutation.mutate();
        }}
        footer={[
          <Button key="markAll" type="primary" onClick={() => markAllNotificationsMutation.mutate()}>
            علامت همه به عنوان خوانده شده
          </Button>,
        ]}
        width={600}
        className="notification-modal"
      >
        {notificationsLoading ? (
          <Spin tip="در حال بارگذاری..." />
        ) : notifications.length === 0 ? (
          <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
            هیچ اعلان جدیدی وجود ندارد
          </Text>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className="notification-item glow-hover"
                actions={[
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => deleteNotificationMutation.mutate(item.id)}
                  >
                    حذف
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{item.title}</Text>}
                  description={
                    <Space direction="vertical" size={4}>
                      <Text>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.createdAt).toLocaleString("fa-IR")}
                      </Text>
                    </Space>
                  }
                />
                {item.data?.reservationId && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setActiveTab("bookings");
                      setNotificationModalVisible(false);
                      markNotificationMutation.mutate(item.id);
                    }}
                  >
                    مشاهده رزرو
                  </Button>
                )}
              </List.Item>
            )}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;