import React from 'react';
import { Form, Input, Button, Card, Row, Col, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import{debounce} from'lodash'
import{validateEmail} from '../../utils/Validations'
import {useLogin } from '../../hooks/useLogin';
import'./Auth.css';
const {Content}=Layout


function Login() {
    const navigate=useNavigate();
    const {handlerLogin,isLoading}=useLogin();
    const debouncedLogin=debounce(async(values)=>{
        await handlerLogin(values)
    },300)


  return (
    <Layout className="layout">
      <Content>
          <Row justify="center"  className="auth-container">
            <Col xs={22} sm={16} md={12} lg={8}>
              <Card  className="auth-card">
                <h1 className="auth-title">ورود به سیستم</h1>
                <Form
                  name="login"
                  onFinish={debouncedLogin}
                  layout="vertical"
                  size="large"
                  validateTrigger='onBlur' //اعتبارسنجی پس از خروج موس از اینپوت 
                >
                  <Form.Item
                    name="email"
                    rules={[
                     { validator:validateEmail}
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="ایمیل"
                      className="auth-input"
                      autoComplete='email'
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'لطفا رمز عبور را وارد کنید' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="رمز عبور"
                      className="auth-input"
                      autoComplete='current-password'
                    />
                  </Form.Item>

                  <Form.Item className="auth-submit">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      block
                      className="auth-button"
                    >
                      ورود به حساب کاربری
                    </Button>
                  </Form.Item>

                  <div className="auth-links">
                    <Button type="link" onClick={() => navigate('/register')}>
                      حساب کاربری ندارید؟ ثبت نام کنید
                    </Button>
                    <Button type="link"
                    onClick={()=>navigate('/forget-password')}
                    className='mt-2'
                    
                    >
                      رمز عبور را فراموش کرده‌اید؟
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

export default Login