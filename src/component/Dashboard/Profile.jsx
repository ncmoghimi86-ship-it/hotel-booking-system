import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Card, Avatar, Space } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getUserById,updateUser } from '../../api/JsonServer'; 
import styled from 'styled-components';

const StyledCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
`;

const Profile = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState([]);

  // لود اطلاعات کاربر
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => getUserById(user?.id),
    enabled: !!user?.id,
    onError: (error) => message.error('خطا در دریافت اطلاعات: ' + error.message),
  });

  // آپدیت پروفایل
  const mutation = useMutation({
    mutationFn: (data) => updateUser(user?.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', user?.id]);
      message.success('پروفایل با موفقیت به‌روزرسانی شد');
      setFileList([]);
      form.resetFields();
    },
    onError: (error) => message.error('خطا در به‌روزرسانی: ' + error.message),
  });

  // مدیریت آپلود عکس
  const handleUpload = ({ file, fileList }) => {
    setFileList(fileList);
    if (file.status === 'done' || file.status === undefined) {
      const reader = new FileReader();
      reader.onload = (e) => {
        form.setFieldsValue({ profilePicture: e.target.result }); // Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values) => {
    // فقط فیلدهای لازم رو می‌فرستیم
    const updatedData = {
      firstName: values.firstName,
      lastName: values.lastName,
      profilePicture: values.profilePicture || null, // اگه عکسی نیست, null می‌فرستیم
    };
    console.log('Submitting profile data:', updatedData); // برای دیباگ
    mutation.mutate(updatedData);
  };

  return (
    <StyledCard title="پروفایل کاربر" loading={isLoading}>
      {userData && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={100}
              src={userData.profilePicture || undefined}
              icon={!userData.profilePicture && <UserOutlined />}
            />
            <h3>{userData.firstName} {userData.lastName}</h3>
            <p>{userData.email}</p>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              profilePicture: userData.profilePicture,
            }}
            layout="vertical"
          >
            <Form.Item
              name="firstName"
              label="نام"
              rules={[{ required: true, message: 'نام لازم است' }]}
            >
              <Input placeholder="نام" />
            </Form.Item>
            <Form.Item name="lastName" label="نام خانوادگی">
              <Input placeholder="نام خانوادگی" />
            </Form.Item>
            <Form.Item name="profilePicture" label="عکس پروفایل">
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={(file) => {
                  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isImage) message.error('فقط JPG/PNG مجاز است');
                  if (!isLt2M) message.error('عکس باید کمتر از ۲ مگابایت باشد');
                  return isImage && isLt2M ? false : Upload.LIST_IGNORE; // false برای جلوگیری از آپلود خودکار
                }}
                onChange={handleUpload}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>انتخاب عکس</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
                ذخیره تغییرات
              </Button>
            </Form.Item>
          </Form>
        </Space>
      )}
    </StyledCard>
  );
};

export default Profile;