import React, { useState,useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  notification,
  Tabs,
  Upload,
  Space,
  Select,
  Card,
  Empty,
  Spin
} from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { useQuery,useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { fetchContent, updateContent, fetchHotels } from '../../api/JsonServer';

const { TabPane } = Tabs;
const { Option } = Select;
//امکانات اولیه هتل
const predefinedAmenities = {
  general: [
    'پارکینگ',
    'WiFi رایگان',
    'لابی',
    'آسانسور',
    'اتاق کنفرانس',
    'خدمات 24 ساعته',
    'سرویس حمل چمدان',
    'صندوق امانات',
    'خدمات روم سرویس'
  ],
  wellness: [
    'استخر',
    'سونا',
    'جکوزی',
    'سالن ماساژ',
    'سالن بدنسازی',
    'مرکز اسپا',
    'سالن یوگا',
    'حمام ترکی'
  ],
  dining: [
    'رستوران',
    'کافی شاپ',
    'فست فود',
    'بار',
    'لانژ',
    'رستوران سنتی',
    'رستوران بین‌المللی',
    'بوفه صبحانه'
  ]
};
//////////////////////////////////کامپوننت هتل انتخاب شده توسط کاربر 
const HotelContentForm = ({ hotelId }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');//ذخیره تب اکتیو
  const [imageList, setImageList] = useState([]);
  const [amenities, setAmenities] = useState({general: [],wellness: [],dining: []});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
 //گرفتن جدیدترین محتوای  هر هتل از سرور  
  const { data: content, isLoading } = useQuery({
    queryKey: ['hotelContent', hotelId],
    queryFn: () => fetchContent(hotelId),
    enabled: !!hotelId,
    onSuccess: (data) => {
        form.setFieldsValue({
          aboutHotel: data?.aboutHotel || '',
          rules: data?.rules || '',
        });
        //تصویرهتل
        setImageList(data?.images || []);
        setAmenities({
          general: data?.amenities?.general || [],//امکانات عمومی
          wellness: data?.amenities?.wellness || [],//امکانات رفاهی
          dining:data?.amenities?.dining || []//امکانات رستورانی و..
        });
      }
  });
  useEffect(() => {
  if (hotelId) queryClient.invalidateQueries(['hotelContent', hotelId]);
}, [hotelId, queryClient]);

  const updateMutation = useMutation({
  mutationFn: updateContent,
  onMutate: async (payload) => {
   
    await queryClient.cancelQueries({ queryKey: ['hotelContent', hotelId] });
    const previousContent = queryClient.getQueryData(['hotelContent', hotelId]);
    queryClient.setQueryData(['hotelContent', hotelId], (old) => ({
      ...(old || {}),
      amenities: payload.content.amenities,
      updatedAt: payload.content.updatedAt,
    }));
    return { previousContent };
  },
  onError: (err, payload, context) => {
    // برگرداندن به حالت قبل
    queryClient.setQueryData(['hotelContent', hotelId], context.previousContent);
    notification.error({ message: 'خطا', description: 'ذخیره نشد' });
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['hotelContent', hotelId] });
  },
});
  //تابع جمع اوری اطلاعات و ارسال انها به سرور
   const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const formData = {
        hotelId,
        content: {
          ...content,
          ...values,
          images: imageList,
          amenities: amenities,
          updatedAt: new Date().toISOString()
        }
      };
      await updateMutation.mutateAsync(formData);//اپدیت سرور
    } catch (error) {
      notification.error({
        message: 'خطا',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
 // تابع برای تغییر دادن امکانات و ذخیره در دیتابیس
 const handleAmenityChange = (type, value) => {
  const newAmenities = { ...amenities, [type]: value };
  setAmenities(newAmenities); // فقط UI
  updateMutation.mutate({
    hotelId,
    content: {
      ...(content || {}),
      amenities: newAmenities,
      updatedAt: new Date().toISOString(),
    },
  });
};

  const handleRemoveImage = async (id) => {
    try {
      const newImageList = imageList.filter(img => img.id !== id);
      
      const formData = {
        hotelId,
        content: {
          ...content,
          images: newImageList,
          updatedAt: new Date().toISOString()
        }
      };
      setImageList(newImageList);
      await updateMutation.mutateAsync(formData);
      
      notification.success({
        message: 'موفقیت',
        description: 'تصویر با موفقیت حذف شد'
      });
    } catch (error) {
      setImageList(imageList);
      notification.error({
        message: 'خطا',
        description: 'خطا در حذف تصویر'
      });
    }
  };   

   const customUpload = async ({ file, onSuccess }) => {
    try {
      const newImage = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        title: file.name//اسم عکس
      };
      const newImageList = [...imageList, newImage];
      const formData = {
        hotelId,
        content: {
          ...content,
          images: newImageList,
          updatedAt: new Date().toISOString()
        }
      };
      setImageList(newImageList);
      await updateMutation.mutateAsync(formData);
      onSuccess();
      notification.success({
        message: 'موفقیت',
        description: 'تصویر با موفقیت آپلود شد'
      });
    } catch (error) {
      notification.error({
        message: 'خطا',
        description: 'خطا در آپلود تصویر'
      });
    }
  };

   const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  if (isLoading) {
    return <Spin size="large" className="flex justify-center my-8" />;
  }
  //
   return (
    <Tabs activeKey={activeTab} onChange={handleTabChange}>
      {/*  ایجاد تب اطلاعات پایه  */}
      <TabPane tab="اطلاعات پایه" key="basic">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}
        >
          <Form.Item
            name="aboutHotel"
            label="درباره هتل"
            rules={[{ required: true, message: 'لطفاً درباره هتل را وارد کنید' }]}
          >
            <Input.TextArea rows={6} placeholder="توضیحات هتل را وارد کنید..." />
          </Form.Item>
          <Form.Item
            name="rules"
            label="قوانین و مقررات"
            rules={[{ required: true, message: 'لطفاً قوانین را وارد کنید' }]}
          >
            <Input.TextArea rows={6} placeholder="قوانین و مقررات هتل را وارد کنید..." />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting || updateMutation.isLoading}
            >
              ذخیره اطلاعات
            </Button>
          </Form.Item>
        </Form>
      </TabPane>

      {/*اایجاد تب گالری تصاویر*/}
<TabPane tab="گالری تصاویر" key="gallery">
  <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Upload
        customRequest={customUpload}
        showUploadList={false}
        accept="image/*"
        multiple
        disabled={isSubmitting || updateMutation.isLoading}
      >
        <Button icon={<PlusOutlined />}>آپلود تصویر</Button>
      </Upload>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {imageList.map(image => (
          <div key={image.id} style={{ position: 'relative' }}>
            <img
              src={image.data} // استفاده مستقیم از داده Base64
              alt={image.title}
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
              onError={(e) => {
                console.error('Image load error:', e);
                e.target.src = '/placeholder.jpg'; // نمایش تصویر پیش‌فرض در صورت خطا
              }}
            />
            <Button 
              danger
              size="small"
              style={{ 
                position: 'absolute', 
                top: 8, 
                right: 8 
              }}
              onClick={() => handleRemoveImage(image.id)}
              disabled={isSubmitting || updateMutation.isLoading}
            >
              حذف
            </Button>
          </div>
        ))}
      </div>
    </Space>
  </div>
</TabPane>
{/* ایجاد تب امکانات و خدمات  */}
      <TabPane tab="امکانات و خدمات" key="amenities">
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <h4>امکانات عمومی</h4>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="امکانات عمومی را انتخاب کنید"
                value={amenities.general}
                onChange={value => handleAmenityChange('general', value)}
                disabled={isSubmitting || updateMutation.isLoading}
              >
                {predefinedAmenities.general.map(item => (
                  <Option key={item} value={item}>{item}</Option>
                ))}
              </Select>
            </div>

            <div>
              <h4>امکانات رفاهی</h4>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="امکانات رفاهی را انتخاب کنید"
                value={amenities.wellness}
                onChange={value => handleAmenityChange('wellness', value)}
                disabled={isSubmitting || updateMutation.isLoading}
              >
                {predefinedAmenities.wellness.map(item => (
                  <Option key={item} value={item}>{item}</Option>
                ))}
              </Select>
            </div>

            <div>
              <h4>رستوران و کافی‌شاپ</h4>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="امکانات رستوران و کافی‌شاپ را انتخاب کنید"
                value={amenities.dining}
                onChange={value => handleAmenityChange('dining', value)}
                disabled={isSubmitting || updateMutation.isLoading}
              >
                {predefinedAmenities.dining.map(item => (
                  <Option key={item} value={item}>{item}</Option>
                ))}
              </Select>
            </div>
          </Space>
        </div>
      </TabPane>
    </Tabs>
  );
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//کامپوننت مدیریت محتوای هتل انتخاب شده 
const ContentManagement = () => {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const { data: hotels = [], isLoading, isError } = useQuery({
    queryKey: ['hotels'],   
    queryFn: fetchHotels,   
    onError: (error) => {
      notification.error({
        message: 'خطا',
        description: error.message,
      });
    },
  });
  if (isLoading) {
    return <Spin size="large" className="flex justify-center my-8" />;
  }
  if (isError) {
    return <div>خطا در دریافت لیست هتل‌ها</div>;
  }
  return (
    <Card
      title="مدیریت محتوا"
      extra={
        <Select
          placeholder="انتخاب هتل"
          style={{ width: 200 }}
          onChange={setSelectedHotel}
          value={selectedHotel}
          loading={isLoading}
        >
          {hotels.map(hotel => (
            <Select.Option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </Select.Option>
          ))}
        </Select>
      }
    >
      {selectedHotel ? (
        <HotelContentForm 
          hotelId={selectedHotel}
          key={selectedHotel}
        />
      ) : (
        <Empty
          description="لطفاً یک هتل را انتخاب کنید"
          style={{ margin: '40px 0' }}
        />
      )}
    </Card>
  );
};

export default ContentManagement;













        