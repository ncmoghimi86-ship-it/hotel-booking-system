import React, { useState } from 'react';
import { Card, Select, Table, Rate, Button, Space, Empty, notification, Tag, Row, Col, Statistic, Form, Modal, DatePicker } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHotels, createReservation, fetchReservations } from '../../api/JsonServer';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  SwapOutlined,
  BookOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const HotelComparison = () => {
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState(null);
  const [form] = Form.useForm();
  const [bookingForm] = Form.useForm();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate=useNavigate()

 const { data: hotels = [], isPending: isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message || 'خطا در دریافت اطلاعات هتل‌ها'
      });
    }
  });
 
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations,
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message || 'خطا در دریافت اطلاعات رزروها'
      });
    }
  });

const reservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userReservations'] });
    },
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message || 'خطا در ثبت رزرو'
      });
    }
  });

 const handleHotelSelect = (value, position) => {
    const newSelectedHotels = [...selectedHotels];
    if (position === 'first') {
      newSelectedHotels[0] = value;
    } else {
      newSelectedHotels[1] = value;
    }
    setSelectedHotels(newSelectedHotels);
    form.setFieldsValue({
      [position === 'first' ? 'firstHotel' : 'secondHotel']: value
    });
  };
 
   const handleRemoveHotel = (position) => {
    const newSelectedHotels = [...selectedHotels];
    if (position === 'first') {
      newSelectedHotels[0] = null;
      form.setFieldsValue({ firstHotel: undefined });
    } else {
      newSelectedHotels[1] = null;
      form.setFieldsValue({ secondHotel: undefined });
    }
    setSelectedHotels(newSelectedHotels);
  };
 
   const handleBooking = (hotelId) => {
    setSelectedHotelForBooking(hotelId);
    setIsBookingModalVisible(true);
  }; 

  const renderBookingModal = () => {
    const handleBookingSubmit = async (values) => {
      const [checkIn, checkOut] = values.dates;
      const reservationData = {
        hotelId: values.hotelId,
        hotelName: hotels.find(h => h.id === values.hotelId)?.name || 'نامشخص',
        checkIn: checkIn.format('YYYY-MM-DD'),//تبدیل فرمت به میلادی برای سرور
        checkOut: checkOut.format('YYYY-MM-DD'),//تبدیل فرمت به میلادی برای سرور
        userId: user?.id, 
        userEmail: user?.email, 
        guests: {
          adults: values.adults,
          children: values.children || 0
        },
        status: {
          booking: 'pending',
          checkIn: 'pending',
          checkOut: 'pending'
        },
        paymentStatus: 'pending',
      };
      try {
 
    await reservationMutation.mutateAsync(reservationData);
    setIsBookingModalVisible(false);
    notification.success({
      message: 'رزرو موفق',
      description: 'رزرو شما با موفقیت ثبت شد'
    });
    queryClient.invalidateQueries({ queryKey: ['userReservations'] });
    navigate('./user-dashboard')
    bookingForm.resetFields();
  } catch (error) {
    console.log(error)
  }
    };
  
    return (
      <Modal
        title={`رزرو هتل`}
        open={isBookingModalVisible}
        onCancel={() => {
          setIsBookingModalVisible(false);
          bookingForm.resetFields();
        }}
        footer={null}
        //اگر مودال باز بود
        afterOpenChange={(open) => {
          if (open && selectedHotelForBooking) {
            bookingForm.setFieldsValue({ hotelId: selectedHotelForBooking });
          }
        }}
      >
   
        <Form
          form={bookingForm}
          layout="vertical"
          onFinish={handleBookingSubmit}
          initialValues={{
            hotelId: selectedHotelForBooking,
            adults: 1,
            children: 0,
          }}
        >
          <Form.Item
            name="hotelId"
            label="هتل"
            rules={[{ required: true, message: 'لطفاً هتل را انتخاب کنید' }]}
          >
            <Select
              placeholder="انتخاب هتل"
              loading={isLoading}
            >
              {hotels.map(hotel => (
               <Select.Option key={hotel.id} value={hotel.id}>
               {hotel.name} 
             </Select.Option>
             
              ))}
            </Select>
          </Form.Item>
  

          <Form.Item
            name="dates"
            label="تاریخ اقامت"
            rules={[{ required: true, message: 'لطفاً تاریخ را انتخاب کنید' }]}
          >
          <RangePicker
    className="w-full"
    format={(date) => {
      // تبدیل به شمسی
      const d = dayjs(date);
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d.toDate());
    }}
    placeholder={['تاریخ ورود', 'تاریخ خروج']}
    locale={{
      lang: {
        locale: 'fa_IR',
        placeholder: 'انتخاب تاریخ',
        rangePlaceholder: ['تاریخ ورود', 'تاریخ خروج'],
        today: 'امروز',
        now: 'اکنون',
        backToToday: 'بازگشت به امروز',
        ok: 'تایید',
        clear: 'پاک کردن',
        month: 'ماه',
        year: 'سال',
        timeSelect: 'انتخاب زمان',
        dateSelect: 'انتخاب تاریخ',
        monthSelect: 'انتخاب ماه',
        yearSelect: 'انتخاب سال',
        decadeSelect: 'انتخاب دهه',
        yearFormat: 'YYYY',
        dateFormat: 'YYYY/MM/DD',
        dayFormat: 'DD',
        dateTimeFormat: 'YYYY/MM/DD HH:mm:ss',
        previousMonth: 'ماه قبل',
        nextMonth: 'ماه بعد',
        previousYear: 'سال قبل',
        nextYear: 'سال بعد',
        previousDecade: 'دهه قبل',
        nextDecade: 'دهه بعد',
        previousCentury: 'قرن قبل',
        nextCentury: 'قرن بعد',
      },
      timePickerLocale: {
        placeholder: 'انتخاب زمان',
      },
    }}
    cellRender={(current, info) => {
      if (info.type !== 'date') return info.originNode;
      const jalaliDay = new Intl.DateTimeFormat('fa-IR', { day: 'numeric' }).format(current.toDate());
      return <div style={{ textAlign: 'center' }}>{jalaliDay}</div>;
    }}
    disabledDate={(current) => current && current < dayjs().startOf('day')}
  />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adults"
                label="تعداد بزرگسال"
                initialValue={1}
                rules={[{ required: true }]}
              >
                <Select>
                  {[1, 2, 3, 4].map(num => (
                    <Select.Option key={num} value={num}>
                      {num} نفر
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="children"
                label="تعداد کودک"
                initialValue={0}
              >
                <Select>
                  {[0, 1, 2, 3].map(num => (
                    <Select.Option key={num} value={num}>
                      {num} نفر
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={reservationMutation.isPending}
              className="w-full"
            >
              ثبت رزرو
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

   const renderHotelSelectors = () => (
    <Row gutter={[16, 16]} className="mb-6">
      <Col span={12}>
        <Card title="هتل اول">
          <Form.Item name="firstHotel">
            <Select
              placeholder="هتل اول را انتخاب کنید"
              className="w-full"
              onChange={(value) => handleHotelSelect(value, 'first')}
              value={selectedHotels[0]}
              showSearch
              optionFilterProp="children"
            >
              {hotels
                .filter(hotel => hotel.id !== selectedHotels[1])
                .map(hotel => (
                  <Select.Option key={hotel.id} value={hotel.id}>
                    {hotel.name} 
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Card>
      </Col>
      <Col span={12}>
        <Card title="هتل دوم">
          <Form.Item name="secondHotel">
            <Select
              placeholder="هتل دوم را انتخاب کنید"
              className="w-full"
              onChange={(value) => handleHotelSelect(value, 'second')}
              value={selectedHotels[1]}
              showSearch
              optionFilterProp="children"
            >
              {hotels
                .filter(hotel => hotel.id !== selectedHotels[0])
                .map(hotel => (
                  <Select.Option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );

const renderComparisonTable = () => {
    if (selectedHotels.length !== 2) return null;

    const hotel1 = hotels.find(h => h.id === selectedHotels[0]);
    const hotel2 = hotels.find(h => h.id === selectedHotels[1]);
    const reservation1 = reservations.find(r => r.hotelId === selectedHotels[0]);
    const reservation2 = reservations.find(r => r.hotelId === selectedHotels[1]);
    const comparisonData = [
      {
        feature: 'نام هتل',
        hotel1: reservation1?.hotelName || hotel1?.name || 'نام هتل',
        hotel2: reservation2?.hotelName || hotel2?.name || 'نام هتل',
      },
      {
        feature: 'درجه هتل',
        hotel1: <Rate disabled defaultValue={hotel1?.rating || 0} />,
        hotel2: <Rate disabled defaultValue={hotel2?.rating || 0} />,
      },
      {
        feature: 'قیمت پایه',
        hotel1: hotel1?.price ? (
          <Statistic 
            value={hotel1.price} 
            suffix="ریال"
            groupSeparator="," 
            valueStyle={{ fontSize: '16px' }}
          />
        ) : '-',
        hotel2: hotel2?.price ? (
          <Statistic 
            value={hotel2.price} 
            suffix="ریال"
            groupSeparator="," 
            valueStyle={{ fontSize: '16px' }}
          />
        ) : '-',
      },
     
      {
        feature: 'رزرو',
        hotel1: (
          <Button 
            type="primary" 
            icon={<BookOutlined />}
            onClick={() => handleBooking(hotel1?.id)}
          >
            رزرو
          </Button>
        ),
        hotel2: (
          <Button 
            type="primary" 
            icon={<BookOutlined />}
            onClick={() => handleBooking(hotel2?.id)}
          >
            رزرو
          </Button>
        ),
      }
    ];

    return (
      <Table
        columns={[
          {
            title: 'ویژگی',
            dataIndex: 'feature',
            key: 'feature',
            width: 150,
          },
          {
            title: (
              <Space direction="vertical" align="center">
                <span>{hotel1?.name?.fa || hotel1?.name}</span>    
                <Button size="small" onClick={() => handleRemoveHotel('first')}>حذف</Button>
              </Space>
            ),
            dataIndex: 'hotel1',
            key: 'hotel1',
          },
          {
            title: (
              <Space direction="vertical" align="center">
                <span>{hotel2?.name?.fa || hotel2?.name}</span>    
                <Button size="small" onClick={() => handleRemoveHotel('second')}>حذف</Button>
              </Space>
            ),
            dataIndex: 'hotel2',
            key: 'hotel2',
          },
        ]}
        dataSource={comparisonData}
        pagination={false}
        bordered
        rowClassName="hover:bg-gray-50"
      />
    );
  };
//UI RENDERING
  return (
    <Card 
      title={
        <Space>
          <SwapOutlined />
          مقایسه هتل‌ها
        </Space>
      } 
      className="hotel-comparison"
    >
      <Form form={form}>
        {renderHotelSelectors()}
      </Form>

      {selectedHotels.length < 2 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="لطفاً دو هتل را برای مقایسه انتخاب کنید"
        />
      ) : (
        renderComparisonTable()
      )}

      {renderBookingModal()}
    </Card>
  );
};

export default HotelComparison;
























