import React from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Typography,
  Spin,
  Empty,
  Badge,
  Tooltip,
  Divider,
  Popconfirm,
  notification,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DeleteOutlined,
  HomeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { deleteReservation } from "../../api/JsonServer";
import { useNavigate } from "react-router-dom";
const { Text, Title } = Typography;

const ReservationList = ({ reservations = [], isLoading, refetchReservations }) => {
  const navigate = useNavigate();
  const queryClient=  useQueryClient()
   const safeReservations = Array.isArray(reservations) ? reservations : [];
   const getStatusTag = (status) => {
    const statusConfigs = {
      pending: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "در انتظار تایید",
      },
      confirmed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "تایید شده",
      },
      cancelled: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "لغو شده",
      },
    };
  const config = statusConfigs[status] || statusConfigs.pending;
    return (
      <Tag color={config.color} icon={config.icon} className="status-tag">
        {config.text}
      </Tag>
    );
};

const deleteReservationMutation = useMutation({
    mutationFn: deleteReservation,
    onSuccess: (_, reservationId) => {
      notification.success({
        message: "موفقیت",
        description: "رزرو با موفقیت حذف شد",
      });
    const reservation = safeReservations.find(r => r.id === reservationId);
    if (reservation?.userId) {
      queryClient.invalidateQueries({ queryKey: ["userReservations", reservation.userId] });
    } 
       refetchReservations?.(); 
    },
    onError: () => {
      notification.error({
        message: "خطا",
        description: "حذف رزرو با خطا مواجه شد",
      });
    },
  });

   const handleDelete = (reservationId) => {
    deleteReservationMutation.mutate(reservationId);
  };

  if (isLoading) {
    return <Spin size="large" className="w-full flex justify-center py-10" />;
  }

  if (!safeReservations.length) {
    return <Empty description="هیچ رزروی یافت نشد" />;
  }
  return (
    <Row gutter={[24, 24]} className="reservation-grid">
      {safeReservations.map((reservation) => (
        <Col xs={24} sm={12} lg={8} key={reservation.id}>
          <Card
            hoverable
            className="reservation-card"
            bodyStyle={{ padding: "24px" }}
          >
            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div className="flex justify-between items-start mb-6">
                <Space>
                  <Badge
                    status={
                      reservation.status?.booking === "confirmed" ? "success" : "warning"
                    }
                    text={getStatusTag(reservation.status?.booking||"pending")}
                  />
                </Space>
                <Text className="text-gray-400">#{reservation.id}</Text>
              </div>
              {/* Hotel Info */}
              <div className="mb-6">
                <Title level={5} className="flex items-center gap-2 mb-2">
                  <HomeOutlined className="text-blue-500" />
                  {reservation.hotelName || "نامشخص"}
                </Title>
                <Space className="text-gray-500">
                  <TeamOutlined />
                  <Text>
  {reservation.guests?.adults} بزرگسال
  {reservation.guests?.children > 0 &&
    ` و ${reservation.guests.children} کودک`}
</Text>
                </Space>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              {/* Price Section */}
{reservation.price && reservation.totalPrice && (
  <div className="flex flex-col gap-2 mb-6">
   <Tag color="blue">
  قیمت هر شب: {Number(reservation.price).toLocaleString("fa-IR")} ریال
</Tag>
<Tag color="green">
  قیمت کل: {Number(reservation.totalPrice).toLocaleString("fa-IR")} ریال
</Tag>
  </div>
)}
             {/* Dates Section */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="date-row">
                  <div className="date-label">
                    <CalendarOutlined className="text-green-500" />
                    <Text strong>تاریخ ورود:</Text>
                  </div>
                  <Text>
                    {new Date(reservation.checkIn).toLocaleDateString("fa-IR")}
                  </Text>
                </div>
                <div className="date-row">
                  <div className="date-label">
                    <CalendarOutlined className="text-red-500" />
                    <Text strong>تاریخ خروج:</Text>
                  </div>
                  <Text>
                    {new Date(reservation.checkOut).toLocaleDateString("fa-IR")}
                  </Text>
                </div>
              </div>
              {/* Actions */}
              <div className="mt-auto pt-4 border-t flex justify-end gap-2">

  {reservation.paymentStatus === 'pending' && (
    <Button
      type="primary"
      size="small"
      onClick={() => navigate(`/payment/${reservation.id}`)}
      style={{ background: '#52c41a', borderColor: '#52c41a' }}
    >
      پرداخت
    </Button>
  )}


  {reservation.paymentStatus === 'completed' && (
    <Tag color="green" className="mt-1">
      تسویه شده
    </Tag>
  )}


  <Tooltip title="حذف رزرو">
    <Popconfirm
      title="آیا مطمئن هستید که می‌خواهید این رزرو را حذف کنید؟"
      onConfirm={() => handleDelete(reservation.id)}
      okText="بله"
      cancelText="خیر"
    >
      <Button type="text" icon={<DeleteOutlined />} danger>
        حذف
      </Button>
    </Popconfirm>
  </Tooltip>
</div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

}
export default ReservationList;





















