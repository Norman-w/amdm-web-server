import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles  from './LoginForm.module.css'
import React from "react";
import logo from '../../images/logo-s.png';

const LoginForm = ({onLogin}) => {
  const onFinish = (values) => {
    //console.log('Received values of form: ', values);
    //点击登陆的时候.
    let user = values.username;
    let pass = values.password;
    if(onLogin)
    {
      onLogin(user,pass);
    }
  };

  return (
    <div className={styles.login_form_main}>

      <Form
      name="normal_login"
      className={styles.login_form}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
        <div className={styles.logo_line}><img src={logo} width={80} alt="logo"/></div>
      <Form.Item
        style={{width:'100%'}}
        name="username"
        rules={[
          {
            required: true,
            message: '请输入用户名',
          },
        ]}
      >
        <Input prefix={<UserOutlined className={styles.site_form_item_icon} />} placeholder="用户名" />
      </Form.Item>
      <Form.Item
        style={{width:'100%'}}
        name="password"
        rules={[
          {
            required: true,
            message: '请输入登陆密码',
          },
        ]}
      >
        <Input
          prefix={<LockOutlined className={styles.site_form_item_icon} />}
          type="password"
          placeholder="密码"
        />
      </Form.Item>

      <Form.Item className={styles.login_line}>
        <Button  type="primary" htmlType="submit" className={styles.login_form_button}>
          登  陆
        </Button>
      </Form.Item>
    </Form>
    </div>
  );
};
export default LoginForm;
