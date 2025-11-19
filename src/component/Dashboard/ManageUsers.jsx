// مدیریت کاربران در پنل ادمین 
import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, notification, Popconfirm, Badge } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { fetchUsers, createUser,updateUser,deleteUser } from "../../api/JsonServer";
import SearchInput from '../SearchInput'
import RoleFilter from '../RoleFilter'
import StatusFilter from '../StatusFilter'

const { Option } = Select;

function ManageUsers() {

  const queryClient = useQueryClient()
  //استیت های محلی
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const[form]=Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: users = [],isLoading } = useQuery({
    queryKey: ["users"], 
    queryFn: fetchUsers,
  });
 
  const createUserMutation = useMutation({
    mutationFn: createUser,
    //واکشی لیست کاربران بعداز موفقیت یا شکست
    onSettled: () => {
      queryClient.invalidateQueries(["users"]);
      notification.success({ message: "کاربر جدید ایجاد شد." });
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => notification.error({ message: "خطا در ایجاد کاربر", description: error.message }),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => {
      if (!editingUser) throw new Error("هیچ کاربری برای به‌روزرسانی انتخاب نشده است");
      return updateUser(editingUser.id, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["users"]);//بروزرسانی کش با اطلاعات جدید
      notification.success({ message: "کاربر با موفقیت به‌روزرسانی شد." });
      setIsModalVisible(false);
      form.resetFields();
      setEditingUser(null);
    },
    onError: (error) => notification.error({ message: "خطا در به‌روزرسانی کاربر", description: error.message }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSettled: () => {
      queryClient.invalidateQueries(["users"]);
      notification.success({ message: "کاربر با موفقیت حذف شد." });
    },
    onError: (error) => notification.error({ message: "خطا در حذف کاربر", description: error.message }),
  });
  //////////////////////////////////////////////////////////////////////////////////////////

  const filteredData = users.filter((user) => {
      if (!user || !user.firstName || !user.lastName || !user.email) {
       return false;
         }
   //براساس عبارت سرچ شده
     const matchesSearchText =
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
   //براساس نقش ها
    const matchesRoleFilter = roleFilter === "all" || user.role === roleFilter;
   //براساس وضعیت فعال یا غیرفعال بودن
    const matchesStatusFilter =statusFilter === "all" || user.status === statusFilter;
    return matchesSearchText && matchesRoleFilter && matchesStatusFilter && user.status !== "deleted";
    });
///////////////////////////////////////////////////////////////////////////////////////////////////

  const showUserModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ role: "user", status: "active" });
    }
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({ ...values, id: editingUser.id });
      } else {
        await createUserMutation.mutateAsync({ ...values, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    } catch (error) {
      notification.error({ message: "خطا", description: error.message });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      queryClient.setQueryData("users", (oldData) => oldData.filter((user) => user.id !== userId));
      notification.success({ message: "کاربر با موفقیت حذف شد." });
      queryClient.invalidateQueries("users");
    } catch (error) {
      notification.error({ message: "خطا در حذف کاربر", description: error.message });
    }
  };

    const columns = [
      //ستون1
    { title: "نام", dataIndex: "firstName", key: "firstName" ,sorter: (a, b) => a.firstName.localeCompare(b.firstName)},//دیتاایندکس:از ابجکت یوزر داده فرست نیم رو بکش
    //ستون2
    { title: "نام خانوادگی", dataIndex: "lastName", key: "lastName",sorter: (a, b) => a.lastName.localeCompare(b.lastName)  },
    //ستون3
    { title: "ایمیل", dataIndex: "email", key: "email" },
    //ستون4
    {
      title: "نقش",
      dataIndex: "role",
      key: "role",
  
     render: (role) => {
     const roleMap = {
      'Admin': { color: "green", text: "مدیر" },
      'Hotel Manager': { color: "blue", text: "مدیر هتل" },
      'Guest': { color: "purple", text: "مهمان" },
       };
    const { color, text } = roleMap[role] || { color: "gray", text: "ناشناخته" };
   return <Badge color={color} text={text} />;
}
    },
    //ستون5
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      render: (status) => <Badge color={status === "active" ? "green" : "red"} text={status === "active" ? "فعال" : "غیرفعال"} />,
    },
    {
      title: "عملیات",
      key: "actions",
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showUserModal(record)}>ویرایش</Button>
          <Popconfirm title="آیا از حذف این کاربر مطمئن هستید؟" onConfirm={() => handleDeleteUser(record.id)} okText="بله" cancelText="خیر">
            <Button type="link" danger>حذف</Button>
          </Popconfirm>
        </span>
      ),
    },
  ];
  return (
    <div>
      <h2>مدیریت کاربران</h2>
      <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
        <SearchInput value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="جستجوی کاربر بر اساس نام، نام خانوادگی یا ایمیل" />
        <RoleFilter value={roleFilter} onChange={setRoleFilter} />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      <Button type="primary" onClick={() => showUserModal()} style={{ marginBottom: 16 }}>
        افزودن کاربر جدید
      </Button>

      <Table loading={isLoading} columns={columns} dataSource={filteredData} rowKey="id"  scroll={{ x: 'max-content' }}/>

      <Modal
        title={editingUser ? "ویرایش کاربر" : "افزودن کاربر"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ role: "user", status: "active" }}>
          <Form.Item name="firstName" label="نام" rules={[{ required: true, message: "نام را وارد کنید" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="نام خانوادگی" rules={[{ required: true, message: "نام خانوادگی را وارد کنید" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="ایمیل" rules={[{ required: true, message: "ایمیل را وارد کنید" }, { type: "email", message: "فرمت ایمیل نامعتبر است" }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="role" label="نقش" rules={[{ required: true }]}>
            <Select>
              <Option value="Admin">مدیر</Option>
              <Option value="Hotel Manager">مدیر هتل</Option>
              <Option value="Guest">مهمان</Option>

            </Select>
          </Form.Item>
          <Form.Item name="status" label="وضعیت" rules={[{ required: true }]}>
            <Select>
              <Option value="active">فعال</Option>
              <Option value="inactive">غیرفعال</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? "به‌روزرسانی" : "افزودن"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>

  )
}

export default ManageUsers