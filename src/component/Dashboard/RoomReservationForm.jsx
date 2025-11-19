
// src/components/Dashboard/RoomReservationForm.jsx
import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Card,
  notification,
  Tag,
  Tooltip,
  ConfigProvider,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReservation,
  fetchHotels,
  fetchHotelReservations,
  fetchAdmins,
} from '../../api/JsonServer';
import { useAuth } from '../../context/AuthContext';
import { MoneyCollectOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import 'dayjs/locale/fa';
import faIR from 'antd/es/locale/fa_IR'; 
dayjs.locale('fa');

const { RangePicker } = DatePicker;
const { Option } = Select;


const toJalali = (date) => {
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d.toDate()).replace(/\u200C/g, '');
};

const RoomReservationForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const queryClient = useQueryClient();
  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
    onError: () => notification.error({ message: 'خطا', description: 'خطا در دریافت هتل‌ها' }),
  });
  const { data: hotelReservations = [] } = useQuery({
    queryKey: ['hotelReservations', selectedHotelId],
    queryFn: () => fetchHotelReservations(selectedHotelId),
    enabled: !!selectedHotelId,
    onError: () => notification.error({ message: 'خطا', description: 'خطا در دریافت رزروها' }),
  });
  // disabledDate — فقط moment + isSameOrAfter → isSame || isAfter
  const disabledDate = (current) => {
    if (!current) return false;

    const currentStart = current.clone().startOf('day');//"اولین لحظه‌ی همان روز، بدون تغییر در تاریخ"
    //dayjs() تاریخ و ساعت الان
    const today = dayjs().startOf('day');//"اولین لحظه‌ی امروز، دقیقاً ساعت ۰۰:۰۰:۰
    // قبل از امروز
    if (currentStart.isBefore(today, 'day')) return true;
    // بررسی رزروها
    return hotelReservations.some((res) => {
      const checkIn = dayjs(res.checkIn).startOf('day');
      const checkOut = dayjs(res.checkOut).startOf('day');
      // تبدیل dayjs به moment
      const checkInMoment = currentStart.clone().year(checkIn.year()).month(checkIn.month()).date(checkIn.date());
      const checkOutMoment = currentStart.clone().year(checkOut.year()).month(checkOut.month()).date(checkOut.date());
      // current >= checkIn && current < checkOut + 1
      const isSameOrAfter = currentStart.isSame(checkInMoment, 'day') || currentStart.isAfter(checkInMoment, 'day');
      const isBefore = currentStart.isBefore(checkOutMoment.add(1, 'day'), 'day');
      return isSameOrAfter && isBefore;
    });
  };


  const renderCell = (date, info) => {
    if (info.type !== 'date') return info.originNode;
    const current = date; 
    const currentStart = current.clone().startOf('day');
    const today = dayjs().startOf('day');
    const isPast = currentStart.isBefore(today, 'day');
    const dayStr = current.format('D');
    if (isPast) {
      return <div style={{ textAlign: 'center', color: '#ccc' }}>{dayStr}</div>;
    }
    const isDisabled = disabledDate(current);
    if (!isDisabled) {
      return <div style={{ textAlign: 'center' }}>{dayStr}</div>;
    }
    const reservationsForDate = hotelReservations.filter((res) => {
      const checkIn = dayjs(res.checkIn).startOf('day');
      const checkOut = dayjs(res.checkOut).startOf('day');
      const checkInMoment = currentStart.clone().year(checkIn.year()).month(checkIn.month()).date(checkIn.date());
      const checkOutMoment = currentStart.clone().year(checkOut.year()).month(checkOut.month()).date(checkOut.date());
      const isSameOrAfter = currentStart.isSame(checkInMoment, 'day') || currentStart.isAfter(checkInMoment, 'day');
      const isBefore = currentStart.isBefore(checkOutMoment.add(1, 'day'), 'day');
      return isSameOrAfter && isBefore;
    });

    const tooltipMessage =
      reservationsForDate.length > 0
        ? reservationsForDate
            .map((res) => `رزرو از ${toJalali(res.checkIn)} تا ${toJalali(res.checkOut)}`)
            .join('، ')
        : 'رزرو شده';

    return (
      <Tooltip title={tooltipMessage} color="#ff4d4f">
        <div style={{ background: '#f5f5f5', textAlign: 'center', color: '#999' }}>
          {dayStr}
        </div>
      </Tooltip>
    );
  };


  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: async () => {
      form.resetFields();
      setSelectedHotel(null);
      setSelectedHotelId(null);
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ['userReservations', user?.id] });
      try {
        const admins = await fetchAdmins();
        admins.forEach((admin) =>
          queryClient.invalidateQueries({ queryKey: ['notifications', admin.id] })
        );
      } catch (error) {
        console.error('Error:', error);
      }
    },
    onError: (error) =>
      notification.error({ message: 'خطا', description: error.message || 'خطا در ثبت رزرو' }),
  });

  const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price) + ' ریال';
  const calculateNights = (dates) => (dates ? dates[1].diff(dates[0], 'day') : 0);
  const calculateTotalPrice = (dates) =>
    selectedHotel ? selectedHotel.price * calculateNights(dates) : 0;

  const handleHotelChange = (value) => {
    setSelectedHotelId(value);
    const hotel = hotels.find((h) => h.id === value);
    setSelectedHotel(hotel);
    form.setFieldsValue({ hotelId: value });
  };

  const handleSubmit = async (values) => {
    try {
      if (!user?.id) {
        notification.error({ message: 'خطا', description: 'لطفاً وارد شوید' });
        return;
      }
      const [checkInJalali, checkOutJalali] = values.dates;
      const checkIn = checkInJalali.format('YYYY-MM-DD');
      const checkOut = checkOutJalali.format('YYYY-MM-DD');

      const hasConflict = hotelReservations.some((res) => {
        const resIn = dayjs(res.checkIn);
        const resOut = dayjs(res.checkOut);
        return (
          checkInJalali.isBefore(resOut.add(1, 'day'), 'day') &&
          checkOutJalali.isAfter(resIn, 'day')
        );
      });

      if (hasConflict) {
        notification.error({ message: 'خطا', description: 'تداخل با رزرو موجود' });
        return;
      }
      const reservationData = {
        userId: user.id,
        userEmail: user.email,
        hotelId: values.hotelId,
        hotelName: selectedHotel?.name || 'نامشخص',
        price: selectedHotel?.price || 0,
        totalPrice: calculateTotalPrice(values.dates),
        nights: calculateNights(values.dates),
        checkIn,
        checkOut,
        guests: { adults: values.adults, children: values.children || 0 },
        status: { booking: 'pending', checkIn: 'pending', checkOut: 'pending' },
        paymentStatus: 'pending',
        notes: values.notes,
        createdAt: new Date().toISOString(),
      };
      await createReservationMutation.mutateAsync(reservationData);
    } catch (error) {
      notification.error({ message: 'خطا', description: 'خطا در ثبت' });
    }
  };

  return (
    <ConfigProvider locale={faIR} direction="rtl">
      <div style={{ padding: '20px' }}>
        <Card
          title={<h2 style={{ textAlign: 'center', color: '#1890ff' }}>رزرو اتاق</h2>}
          style={{
            maxWidth: 800,
            margin: '0 auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '12px',
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Form.Item name="hotelId" label="انتخاب هتل" rules={[{ required: true }]}>
                  <Select placeholder="انتخاب هتل" onChange={handleHotelChange} loading={hotelsLoading}>
                    {hotels.map((hotel) => (
                      <Option key={hotel.id} value={hotel.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{hotel.name}</span>
                          <Tag color="blue" icon={<MoneyCollectOutlined />}>
                            {formatPrice(hotel.price)}
                          </Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="dates" label="تاریخ اقامت" rules={[{ required: true }]}>
                  <RangePicker
                    style={{ width: '100%' }}
                    format={(value) => toJalali(value)}
                    disabledDate={disabledDate}
                    disabled={hotelsLoading || !selectedHotelId}
                    cellRender={renderCell}
                  />
                </Form.Item>
              </Col>

              <Col xs={12}>
                <Form.Item name="adults" label="تعداد بزرگسال" initialValue={1} rules={[{ required: true }]}>
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="children" label="تعداد کودک" initialValue={0}>
                  <InputNumber min={0} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="notes" label="توضیحات">
                  <Input.TextArea rows={3} placeholder="توضیحات اضافی..." />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createReservationMutation.isLoading}
                  block
                  style={{ height: '45px', fontSize: '16px', borderRadius: '8px' }}
                >
                  ثبت رزرو
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default RoomReservationForm;