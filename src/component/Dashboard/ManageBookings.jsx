// src/components/Admin/ManageBookings.jsx
import React, { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Select,
  notification,
  Popconfirm,
  Row,
  Col,
  Card,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReservations, updateReservationStatus, deleteReservation } from "../../api/JsonServer";
import { STATUS_CONFIG } from "../../constants";
const { Option } = Select;

function ManageBookings({ limit, loading: externalLoading }) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editModal, setEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    isRefetching: reservationsRefetching,
  } = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0,
    onError: () => {
      notification.error({
        message: "خطا",
        description: "خطا در دریافت اطلاعات رزروها",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, updates }) => updateReservationStatus(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:["reservations"]});
      if (selectedBooking?.userId) {
        queryClient.invalidateQueries({ queryKey: ["userReservations", selectedBooking.userId] });
      }
      notification.success({
        message: "موفقیت",
        description: "وضعیت رزرو با موفقیت به‌روزرسانی شد",
      });
      closeModal();
    },
    onError: (error) => {
      notification.error({
        message: "خطا",
        description: error.message || "خطا در به‌روزرسانی وضعیت",
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:["reservations"]});
      notification.success({
        message: "موفقیت",
        description: "رزرو با موفقیت حذف شد",
      });
    },
  });

  const handleUpdateStatus = async (values) => {
    if (!selectedBooking?.id) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedBooking.id,
        updates: { status: { booking: values.status } },
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await deleteBookingMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const handleRefresh = () => {
    queryClient.refetchQueries({ queryKey: ['reservations'] });
  };

  const getStatusTag = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const openEditModal = (record) => {
    setSelectedBooking(record);
    form.setFieldsValue({ status: record.status?.booking || "pending" });
    setEditModal(true);
  };

  const closeModal = () => {
    setEditModal(false);
    form.resetFields();
    setSelectedBooking(null);
  };

  const columns = [
    { title: "شماره رزرو", dataIndex: "id", key: "id" },
    {
      title: "نام مهمان",
      key: "guestName",
      render: (_, record) => {
        const firstName = record?.user?.firstName;
        const lastName = record?.user?.lastName;
        return firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : "نامشخص";
      },
    },
    { title: "هتل", key: "hotelName", render: (_, record) => record?.hotel?.name || record.hotelName || "نامشخص" },
    { title: "تاریخ ورود", key: "checkIn", render: (_, record) => record.checkIn || "نامشخص" },
    { title: "تاریخ خروج", key: "checkOut", render: (_, record) => record.checkOut || "نامشخص" },
    {
      title: "مبلغ (ریال)",
      key: "price",
      render: (_, record) => {
        const amount = record.amount || record.room?.price || 0;
        return amount.toLocaleString();
      },
    },
    {
      title: "وضعیت رزرو",
      key: "status",
      render: (_, record) => getStatusTag(record.status?.booking || "pending"),
    },
    // ستون وضعیت پرداخت
    {
      title: "وضعیت پرداخت",
      key: "payment",
      render: (_, record) => {
        const status = record.paymentStatus || "pending";
        return status === "completed" ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            تسویه شده
          </Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            عدم تسویه
          </Tag>
        );
      },
    },
    // ستون عملیات
    {
      title: "عملیات",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status?.booking === "pending" && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              تأیید رزرو
            </Button>
          )}
          {record.status?.booking === "confirmed" && (
            <Tag color="green" icon={<CheckCircleOutlined />}>
             رزرو شده
            </Tag>
          )}
          <Popconfirm
            title="آیا از حذف این رزرو اطمینان دارید؟"
            onConfirm={() => handleDeleteBooking(record.id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>مدیریت رزروها</h2>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={reservationsLoading || reservationsRefetching}>
          بارگذاری مجدد
        </Button>
      </div>

      <Table
        className="glow-hover"
        columns={columns}
        dataSource={reservations}
        loading={externalLoading || reservationsLoading || reservationsRefetching}
        rowKey="id"
        pagination={
          !limit
            ? { pageSize: 10, showSizeChanger: true, total: reservations.length, showTotal: (total) => `مجموع ${total} رزرو` }
            : false
        }
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: "20px" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card size="small" title="اطلاعات رزرو">
                    <p>تعداد بزرگسال: {record.guests?.adults || 1}</p>
                    <p>تعداد کودک: {record.guests?.children || 0}</p>
                    <p>تاریخ ثبت: {record.createdAt || "نامشخص"}</p>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" title="اطلاعات هتل">
                    <p>نام هتل: {record.hotel?.name || record.hotelName || "نامشخص"}</p>
                    <p>شماره اتاق: {record.room?.number || "نامشخص"}</p>
                    <p>قیمت: {(record.amount || record.room?.price || 0).toLocaleString()} ریال</p>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" title="اطلاعات مهمان">
                    <p>نام: {record.user?.firstName || "نامشخص"} {record.user?.lastName || ""}</p>
                    <p>ایمیل: {record.user?.email || "نامشخص"}</p>
                    <p>تلفن: {record.user?.phone || "نامشخص"}</p>
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        }}
        scroll={{ x: true }}
        size={limit ? "small" : "default"}
      />

      {/* مودال تغییر وضعیت */}
      <Modal
        title="تغییر وضعیت رزرو"
        open={editModal}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item name="status" label="وضعیت رزرو" rules={[{ required: true, message: "لطفاً وضعیت را انتخاب کنید" }]}>
            <Select placeholder="انتخاب وضعیت">
              <Option value="pending">در انتظار</Option>
              <Option value="confirmed">تأیید شده</Option>
              <Option value="cancelled">لغو شده</Option>
            </Select>
          </Form.Item>

          {/* نمایش وضعیت پرداخت در مودال */}
          <Form.Item label="وضعیت پرداخت">
            <Tag color={selectedBooking?.paymentStatus === "completed" ? "green" : "red"}>
              {selectedBooking?.paymentStatus === "completed" ? "تسویه شده" : "عدم تسویه"}
            </Tag>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={closeModal}>انصراف</Button>
              <Button type="primary" htmlType="submit" loading={updateStatusMutation.isLoading}>
                ثبت تغییرات
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default ManageBookings;