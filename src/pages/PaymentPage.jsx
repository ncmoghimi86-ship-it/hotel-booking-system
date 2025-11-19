import React from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Result,
  Spin,
  Row,
  Col,
  Divider,
  Space,
  notification,
} from 'antd';
import {
  CreditCardOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservationStatus } from '../api/JsonServer';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const paymentMutation = useMutation({
    mutationFn: () => updateReservationStatus(id, { paymentStatus: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['userReservations'] });
      queryClient.refetchQueries({ queryKey: ['reservations'], exact: true });
      queryClient.removeQueries({ queryKey: ['reservations'] });
      notification.success({
        message: 'پرداخت موفق',
        description: 'رزرو شما با موفقیت تسویه شد.',
      });
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    },
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message || 'پرداخت ناموفق بود.',
      });
    },
  });

  const onFinish = () => {
    paymentMutation.mutate();
  };

  if (paymentMutation.isPending) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="در حال اتصال به درگاه بانک..." />
      </div>
    );
  }

  // پرداخت موفق
  if (paymentMutation.isSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="پرداخت با موفقیت انجام شد!"
          subTitle="رزرو شما ثبت نهایی شد. در حال انتقال به لیست رزروها..."
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <Row justify="center" style={{ marginTop: 40 }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            className="glass glow-hover"
            title={
              <Space>
                <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <span style={{ fontSize: 18, fontWeight: 'bold' }}>درگاه پرداخت بانک ملت</span>
              </Space>
            }
            extra={<img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Bank_Mellat_Logo.png" alt="بانک ملت" style={{ height: 30 }} />}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h3>پرداخت رزرو #{id}</h3>
              <p style={{ color: '#888' }}>مبلغ قابل پرداخت: <strong>۲,۵۰۰,۰۰۰ ریال</strong></p>
            </div>

            <Divider>اطلاعات کارت بانکی</Divider>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="cardNumber"
                label="شماره کارت"
                rules={[{ required: true, message: 'شماره کارت الزامی است' }]}
              >
                <Input
                  prefix={<CreditCardOutlined />}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    form.setFieldsValue({ cardNumber: value });
                  }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="expiry"
                    label="تاریخ انقضا"
                    rules={[{ required: true, message: 'تاریخ انقضا الزامی است' }]}
                  >
                    <Input placeholder="MM/YY" maxLength={5} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="cvv2"
                    label="CVV2"
                    rules={[{ required: true, message: 'CVV2 الزامی است' }]}
                  >
                    <Input placeholder="123" maxLength={4} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="password"
                label="رمز دوم"
                rules={[{ required: true, message: 'رمز دوم الزامی است' }]}
              >
                <Input.Password placeholder="••••••" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={paymentMutation.isPending}
                  style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }}
                >
                  پرداخت امن
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 20, color: '#888', fontSize: 12 }}>
              <p>این یک درگاه تست است. اطلاعات کارت واقعی وارد نکنید.</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentPage;