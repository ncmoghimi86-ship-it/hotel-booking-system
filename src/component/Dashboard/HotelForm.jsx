import React from "react";
import { Form,Input,Button,Upload,message,InputNumber,Rate,Select} from "antd";
import{UploadOutlined} from '@ant-design/icons'

const HotelForm=({onFinish,initialValues,imageUrl,setImageUrl,imageLoading,setImageLoading})=>{
  const handlerImageUpload=async(file)=>{

    const isJpgOrPng=file.type=== 'image/png' || file.type==='image/jpeg'
    if(!isJpgOrPng){
        message.error(' فایل باید از نوع png یا jpeg باشد')
        return false
    }
    setImageLoading(true) ;
    setTimeout(()=>{
        setImageUrl(URL.createObjectURL(file));
        setImageLoading(false)
    },1000)
    return false;
   }

 return(
    <Form  name="HotelForm" onFinish={onFinish} initialValues={initialValues} layout="vertical">
        <Form.Item label='نام هتل' name='name' rules={[{required:true, message:'لطفا نام هتل را وارد نمایید' }]}>
            <Input/>
        </Form.Item>
        <Form.Item  label=' قیمت' name='price' rules={[{required:true, message:'لطفا قیمت را وارد نمایید'}]}>
            <InputNumber min={0} style={{width:'100%'}}/>
        </Form.Item>
        <Form.Item label='امتیاز'name='rating'rules={[{required:true, message:'لطفا امتیاز هتل را وارد نمایید'}]}>
            <Rate/>
        </Form.Item>
        <Form.Item label='دسته بندی'name='category'rules={[{required:true,message:'لطفا دسته بندی  را وارد نمایید'}]}>
            <Select>
                <Select.Option value='villa'>ویلا</Select.Option>
                <Select.Option value='cottage'>کلبه</Select.Option>
                <Select.Option value='beach'>ساحلی</Select.Option>
                <Select.Option value='apartment'>آپارتمان</Select.Option>
            </Select>
        </Form.Item>
        <Form.Item label="تصویر" name="image" valuePropName="fileList" extra="فقط تصاویر PNGوJPG مجاز هستند">
            <Upload beforeUpload={handlerImageUpload} showUploadList={false} accept="image/jpeg , image/png">
                <Button icon={<UploadOutlined/>}>بارگذاری تصویر</Button>
            </Upload>
            {imageUrl &&(
              <img src={imageUrl} alt="تصویرهتل" 
              style={{width:'100%' ,height:'auto',marginTop:10,objectFit:'cover',borderRadius:'8px'}}/>
            )}
            {imageLoading && <p> درحال بارگزاری تصویر</p>}
        </Form.Item>
        <Form.Item>
            <Button type="primary" htmlType="submit " loading={imageLoading}>ارسال</Button>
        </Form.Item>
    </Form>
 )
}
export default HotelForm;