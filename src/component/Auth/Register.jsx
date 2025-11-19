import React from 'react'
import{Form,Input,Select,Button,Card,Row,Col,Layout} from 'antd';
import{UserOutlined,MailOutlined,LockOutlined,PhoneOutlined} from'@ant-design/icons'
import{useNavigate} from 'react-router-dom'
import{debounce} from'lodash' //جلوگیری از ارسال های مکرر اطلاعات کاربر به دیتابیس
import {useCreateUser} from'../../hooks/useCreateUser';
import { validateEmail,validatePassword,validatePhone }  from'../../utils/Validations'
 import './Auth.css'
const{Content}=Layout
const{Option}=Select

function Register() {
    const navigate=useNavigate();
    const{createUser,isLoading}=useCreateUser();
    const handlerSubmit=async (values)=>{
        const result=await createUser(values)
        if(result.success){
            navigate('/login');
        }
    }
    const debounceSubmit=debounce(handlerSubmit,300) 
//طراحی ظاهر فرم
  return (
    <Layout className="layout">
      <Content>
          <Row justify="center" align="middle" className="auth-container">
            <Col xs={22} sm={16} md={12} lg={8}>
              <Card  className="auth-card">
                <h1 className="auth-title">ثبت نام در هتل‌یار</h1>
                <Form
                  name="register"
                  onFinish={debounceSubmit}
                  layout="vertical"
                  size="large"
                  validateTrigger="onBlur"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        rules={[{ required: true, message: 'لطفا نام خود را وارد کنید' }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="نام"
                          className="auth-input"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        rules={[{ required: true, message: 'لطفا نام خانوادگی خود را وارد کنید' }]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="نام خانوادگی"
                          className="auth-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    rules={[{ validator:validateEmail}]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="ایمیل"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ validator:validatePassword }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="رمز عبور"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phoneNumber"
                    rules={[{ validator:validatePhone }]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="شماره تماس"
                      className="auth-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    initialValue="Guest"
                  >
                    <Select className="auth-select">
                      <Option value="Guest">مهمان</Option>
                      <Option value="Hotel Manager">مدیر هتل</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item className="auth-submit">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      block
                      className="auth-button"
                    >
                      ثبت نام
                    </Button>
                  </Form.Item>

                  <div className="auth-links">
                    <Button type="link" onClick={() => navigate('/login')}>
                      قبلا ثبت نام کرده‌اید؟ وارد شوید
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
      </Content>
    </Layout>
  );
  
}

export default Register