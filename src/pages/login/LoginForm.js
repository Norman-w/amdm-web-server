import {Space, Form, Input, Button, Spin, Drawer, message} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles  from './LoginForm.module.css'
import React from "react";
import logo from '../../images/logo.png';
import app from "../../app";
import md5 from "js-md5";

class LoginForm extends React.Component{
    state={
        loading:false,
        settingPanelVisible:false,
    }
    componentWillUnmount() {
        this.abortController.abort();
    }

    abortController = new AbortController();
  onFinish = (values) => {
    //console.log('Received values of form: ', values);
    //点击登陆的时候.
    let user = values.username;
    let pass = values.password;
    let api = 'login';
    if (this.state.loading)
    {
    }
    else {
        this.setState({loading: true}
            , () => {
            let that = this;
                app.doPost2(
                    {
                        url: app.setting.serverSideApiRouterUrl,
                        timeoutMS: 30000,
                        apiName:api,
                        params:
                            {
                                username: user,
                                passwordMD5: md5(pass),
                            },
                        onFinish: (res) => {
                            console.log('执行post完成',res)
                            if (res.Account && res.Account.Id > 0) {
                                message.success('欢迎登陆,' + res.Account.Name + ' 您辛苦了!');
                                if (that.props.onLoginSuccess)
                                {
                                    that.props.onLoginSuccess(res.Account,res.Session);
                                }
                            } else {
                                message.warn('登陆信息校验完成,账号校验失败');
                            }
                            if (!that.abortController.signal.aborted)
                            {
                                that.abortController = new AbortController();
                            }
                          that.setState({loading:false});
                        },
                        onFail: (t) => {
                            message.warn(t?'登陆超时,请检查网络后重试':'请检查网络连接');
                            that.setState({loading:false});
                          that.abortController = new AbortController();
                        },
                        abortController:that.abortController,
                    }
                )
            });
    }
  };

  onCloseSettingPanel = function ()
  {
      this.setState({settingPanelVisible:false});
  }

  onSaveSetting = function ()
  {
      console.log('正在保存设置');
      this.setState({settingPanelVisible:false});
  }
  render() {
      let onCloseSettingPanel = this.onCloseSettingPanel.bind(this);
      return (
          <div className={styles.login_form_main}>
              <Drawer title="设置" placement="left" onClose={onCloseSettingPanel} visible={this.state.settingPanelVisible}
                      extra={
                          <Space>
                              <Button onClick={onCloseSettingPanel}>取消</Button>
                              <Button type="primary" onClick={()=>{this.onSaveSetting()}}>
                                  保存
                              </Button>
                          </Space>
                      }
              >
                  <p>Some contents...</p>
                  <p>Some contents...</p>
                  <p>Some contents...</p>
              </Drawer>

              <div className={styles.titleLine}>
                  <div id={'启动设置按钮'} className={styles.settingButton}
                       onClick={()=>this.setState({settingPanelVisible:true})}
                  >⚙</div>
              </div>
              {this.state.loading?<div className={styles.loadingArea}><Spin/>正在登陆,请稍后...</div>:<Form
                  name="normal_login"
                  className={styles.login_form}
                  initialValues={{
                      remember: true,
                  }}
                  onFinish={this.onFinish}
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
              </Form>}
          </div>
      );
  }
}
export default LoginForm;
