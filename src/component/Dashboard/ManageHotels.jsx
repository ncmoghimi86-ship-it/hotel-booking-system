
import React, { useState } from "react";
import {
  Modal, 
  Form, 
  Input, 
  Button, 
  notification, 
  Space, 
  Select, 
  Table, 
  Upload, 
  Badge, 
  Rate,
  Row,
  Col,
  Popconfirm,
  InputNumber
} from "antd";
import { 
  PlusOutlined, 
  LoadingOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PictureOutlined 
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; 
import { updateHotel, createHotel, fetchHotels, deleteHotel } from "../../api/JsonServer";
import styled from "styled-components";
const { Option } = Select;
const StyledUploadCard = styled(Upload)`
  .ant-upload {
    width: 200px !important;
    height: 200px !important;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }

  .ant-upload-select {
    border-radius: 8px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;
const defaultAmenities = {
  general: [
    'پارکینگ',
    'WiFi رایگان',
    'لابی',
    'آسانسور',
    'اتاق کنفرانس',
    'خدمات 24 ساعته',
    'سرویس حمل چمدان',
    'صندوق امانات'
  ],
  wellness: [
    'استخر',
    'سونا',
    'جکوزی',
    'سالن ماساژ',
    'سالن بدنسازی',
    'مرکز اسپا'
  ],
  dining: [
    'رستوران',
    'کافی شاپ',
    'رستوران بین‌المللی',
    'سرویس اتاق',
    'صبحانه رایگان'
  ]
};
//کامپوننت مدیریت هتل ها
const ManageHotels=({selectedHotel,setSelectedHotel,hotelModal,setHotelModal,hotelForm})=>{
     const queryClient = useQueryClient();
     const [imageLoading, setImageLoading] = useState(false);
     const [imageUrl, setImageUrl] = useState('');
 
     const{data:hotels=[],isLoading:hotelsLoading}=useQuery({
    queryKey:["hotels"],
    queryFn:fetchHotels,
  });

  const createHotelMutation=useMutation({
    mutationFn:createHotel,
    onSuccess:()=>{
      notification.success({message:"هتل با موفقیت ایجاد شد"});
      setSelectedHotel(null);  
      setHotelModal(false);
      hotelForm.resetFields();
      setImageUrl('');
      queryClient.invalidateQueries(['hotels']);//بروزرسانی کش 
    },
    onError:(error)=>notification.error({
      message:"خطا در ایجاد هتل",
      description:error.message
    })
  });


  const updateHotelMutation=useMutation({
    mutationFn:(data)=>updateHotel(selectedHotel?.id,data),
    onSuccess:()=>{
      queryClient.invalidateQueries(["hotels"]);
      notification.success({message:"هتل با موفقیت به روزرسانی شد"});
      setHotelModal(false);
      hotelForm.resetFields();
      setImageUrl("");
      setSelectedHotel(null);
    },
    onError:(error)=>{
      notification.error({
        message:"خطا در به روزرسانی هتل",
        description:error.message,
      });
    },
  });

  const deleteHotelMutaion=useMutation({
  mutationFn:deleteHotel,
  onSuccess:()=>{
    queryClient.invalidateQueries(["hotels"]);
    notification.success({
      message:"هتل با موفقیت حذف شد",
    });
  },
  onError:(error)=>{
    notification.error({
      message:"خطا در حذف هتل",
      description:error.message
    });
  },
});

const beforeUpload=(file)=>{
  const isJpgOrPng=file.type==='image/jpeg'||file.type==='image/png';
  if(!isJpgOrPng){
    notification.error({message:"فقط فایل های jpgوpngمجاز هستند"});
  }
  const isLt2M=file.size/1024/1024<2;//حجم فایل کمتراز 2مگابایت باشد
  if(!isLt2M){
    notification.error({message:'حجم فایل کمتر از 2mgباشد'});
  }
  return isJpgOrPng && isLt2M;
};

const handleImageChange=info=>{
  if(info.file.status==='uploading'){
    setImageLoading(true);
    return;
  }
  if(info.file.status==='done'){
    getBase64(info.file.originFileObj,imageUrl=>{
      setImageUrl(imageUrl);
      setImageLoading(false)
    });
  }
};

const getBase64=(img,callback)=>{
  const reader=new FileReader();
  reader.addEventListener('load',()=>callback(reader.result))
  reader.readAsDataURL(img)
  }

   const customUploadRequest=({onSuccess})=>{
    setTimeout(()=>{
      onSuccess("ok")
    },0)
  };


  const handleHotelSubmit=async(values)=>{
  try{
    const hotelData = {
      name: values.name,
      location: {
        address: {
          city: values.location?.city
        }
      },
      facilities: values.facilities || [],
      status: 'active',
      image: imageUrl,
      rating: values.rating || 0,
      price: values.price || 0,
      category: values.category, 
      updatedAt: new Date().toISOString()
    };  

    if(selectedHotel){
      await updateHotelMutation.mutateAsync(hotelData);
    }else{
      createHotelMutation.mutateAsync({
        ...hotelData,
        createdAt:new Date().toISOString()
      });
    }
  }catch(error){
    notification.error({
      message:"خطا",
      description:error.message,
    });
  }
 };

 const handleDeleteHotel=async(hotelId)=>{
  try{
    await deleteHotelMutaion.mutateAsync(hotelId);
    queryClient.setQueryData(["hotels"],(oldData)=>{
      if(!oldData)return[];//ممکنه هیچ هتلی در سرور نباشد 
      return oldData.filter((hotel)=>hotel.id !==hotelId)
    });
    notification.success({
      message:"هتل با موفقیت حذف شد",
    });
    
  }catch(error){
    notification.error({
      message:"خطا در حذف هتل",
      description:error.message,
    });
  }
 };

 const columns = [
  {
    title: "تصویر",
    dataIndex: "image",
    render: (image) => (
      image ? (
        <img src={image} alt="hotel" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
      ) : (
        <PictureOutlined style={{ fontSize: 24 }} />
      )
    )
  },
  {
    title: "نام هتل",
    dataIndex: "name",
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: "شهر",
    dataIndex: ["location", "city"],
    sorter: (a, b) => a.location?.city?.localeCompare(b.location?.city)
  },
  {
    title: "دسته‌بندی",
    dataIndex: "category",
    render: (category) => {
      const categoryLabels = {
        villa: "ویلا",
        cottage: "کلبه",
        beach: "ساحلی",
        apartment: "آپارتمان"
      };
      return categoryLabels[category] || "نامشخص";
    }
  },
  {
    title: "قیمت (تومان)",
    dataIndex: "price",
    sorter: (a, b) => a.price - b.price,
    render: (price) => price?.toLocaleString() || '0'
  },
  {
    title: "امتیاز",
    dataIndex: "rating",
    sorter: (a, b) => a.rating - b.rating,
    render: (rating) => <Rate disabled defaultValue={rating} />
  },
  {
    title: "وضعیت",
    dataIndex: "status",
    filters: [
      { text: 'فعال', value: 'active' },
      { text: 'غیرفعال', value: 'inactive' }
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => (
      <Badge 
        status={status === 'active' ? 'success' : 'error'} 
        text={status === 'active' ? 'فعال' : 'غیرفعال'} 
      />
    )
  },
  {
    title: "عملیات",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedHotel(record);
            setHotelModal(true);
            setImageUrl(record.image);
            hotelForm.setFieldsValue({
              name: record.name,
              'location.city': record.location?.city,
              facilities: record.facilities,
              rating: record.rating,
              price: record.price,
              category: record.category
            });
          }}
        >
          ویرایش
        </Button>
        <Popconfirm
          title="آیا از حذف این هتل مطمئن هستید؟"
          onConfirm={() => handleDeleteHotel(record.id)}
        >
          <Button danger icon={<DeleteOutlined />}>
            حذف
          </Button>
        </Popconfirm>
      </Space>
    )
  }
];
//طراحی یو-آی 
return (
  <>
    <Button type="primary"
     icon={<PlusOutlined />}
      onClick={() =>{
      setHotelModal(true);
      setSelectedHotel(null);
      hotelForm.resetFields();
    }}>
      افزودن هتل جدید
    </Button>
    
    <Table 
      loading={hotelsLoading}
      columns={columns} 
      dataSource={hotels} 
      rowKey="id" 
      style={{ marginTop: 16 }}
      className="fade-in"
    />
    <Modal
      title={selectedHotel ? "ویرایش هتل" : "افزودن هتل جدید"}
      open={hotelModal}
      onCancel={() => {
        setHotelModal(false);
        hotelForm.resetFields();
        setImageUrl('');
        setSelectedHotel(null);
      }}
      footer={null}
    >
      <Form
        layout="vertical"
        form={hotelForm}
        initialValues={selectedHotel ? {
          name: selectedHotel.name,
          'location.city': selectedHotel.location?.city,
          facilities: selectedHotel.facilities,
          rating: selectedHotel.rating,
          price: selectedHotel.price,
          category: selectedHotel.category
        } : undefined}
        onFinish={handleHotelSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="name" 
              label="نام هتل" 
              rules={[{ required: true, message: 'نام هتل را وارد کنید' }]}
            >
              <Input placeholder="نام هتل را وارد کنید" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="location.city" 
              label="شهر" 
              rules={[{ required: true, message: 'شهر را وارد کنید' }]}
            >
              <Input placeholder="شهر را وارد کنید" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="قیمت (تومان)"
              rules={[{ required: true, message: "قیمت را وارد کنید" }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rating"
              label="امتیاز"
              rules={[{ required: true, message: "امتیاز را وارد کنید" }]}
            >
              <Rate />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="دسته‌بندی"
              rules={[{ required: true, message: "دسته‌بندی را انتخاب کنید" }]}
            >
              <Select placeholder="یک دسته‌بندی انتخاب کنید">
                <Option value="villa">ویلا</Option>
                <Option value="cottage">کلبه</Option>
                <Option value="beach">ساحلی</Option>
                <Option value="apartment">آپارتمان</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <StyledUploadCard
              name="image"
              listType="picture-card"
              showUploadList={false}
              customRequest={customUploadRequest}
              beforeUpload={beforeUpload}
              onChange={handleImageChange}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>بارگذاری</div>
                </div>
              )}
            </StyledUploadCard>
          </Col>
        </Row>
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createHotelMutation.isLoading || updateHotelMutation.isLoading}
            >
              {selectedHotel ? "به‌روزرسانی" : "افزودن"}
            </Button>
            <Button onClick={() => setHotelModal(false)}>لغو</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  </>
);
};

export default ManageHotels;





















