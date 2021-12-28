import {Avatar, Button, Layout, Menu, message} from 'antd';
import {
  HomeOutlined,
BarcodeOutlined,
  FileSearchOutlined,
InteractionOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import React, {Component} from 'react';
import 'antd/dist/antd.css';
import './Main.css';
import logo from './images/logo.jpeg';
import classNames from "./Main.module.css";
import Status from "./pages/status";
import InventoryStatus from "./pages/inventoryStatus";
import InstockRecord from "./pages/instockRecord";
import FulfillRecord from "./pages/fulfillRecord";
import MyAccount from "./pages/myAccount";
import AccountsManage from "./pages/accountsManage";
import SettingManage from "./pages/settingManage";
import LogView from "./pages/logView";
import MedicinesManage from "./pages/medicinesManage";
import LoginForm from "./pages/login/LoginForm";
import app from "./app";
import md5 from 'js-md5';
import Banner from "./pages/component/Banner";



const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;


class Main extends Component {
  state=
    {
        account : undefined,
      currentPage:<Status/>,
    }
  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };
  setLogonAccount(account)
  {
      this.setState({account:account});
      app.account = account;
      console.log('已设置登陆账号为:', account);
  }
  testFunc()
  {
      console.log('开始执行测试请求post');
      //region 执行一个获取付药机8080接口传输的数据
      let api = 'peripheralsstatus.get';
      let that = this;
      app.doPost(
          {
              url:'http://192.168.2.207:8080',
              headers:
                  {
                      'Content-Type':'application/json;charset=utf-8;',
                      'apiName':api
                  },
              params:
                  {
                      fields:'*'
                  },
              finish:(res)=>
              {
                  // that.setState({PeripheralsStatus:res.PeripheralsStatus})
              }
          }
      )
      //endregion
  }
  render() {
      //region 如果是还没有登陆的状态 先登陆
      if (!this.state.account)
      {
          let that = this;
          return <LoginForm onLogin={(user,pass)=>{
              // app.request({
              //     api:'accounts.get',
              //     params:
              //         {
              //             username:user,
              //             passwordMD5: md5(pass),
              //         },
              //     success:(res)=>
              //     {
              //         if (res.Accounts && res.Accounts.length===1 && res.Accounts[0].Id>0) {
              //             message.success('欢迎登陆,' + res.Accounts[0].Name + ' 您辛苦了!')
              //             console.log(res);
              //             that.setLogonAccount(res.Accounts[0]);
              //         }
              //         else
              //         {
              //             message.warn('登陆信息校验完成,账号校验失败');
              //         }
              //     },
              //     errProcFunc:(res)=>
              //     {
              //         message.error('在登陆校验时发生错误');
              //         message.error(res.ErrMsg);
              //     },
              //     dest:'server'
              // })
              console.log('即将执行登陆请求')
              app.doPost(
                  {
                      url: app.setting.serverSideApiRouterUrl,
                      headers:
                          {
                              'Content-Type': 'application/json;charset=utf-8;',
                          },
                      params:
                          {
                              method:'accounts.get',
                              username:user,
                              passwordMD5:md5(pass),
                          },
                      finish:(res)=>
                      {
                          // console.log('执行post完成')
                          if (res.Accounts && res.Accounts.length===1 && res.Accounts[0].Id>0) {
                              message.success('欢迎登陆,' + res.Accounts[0].Name + ' 您辛苦了!')
                              // console.log(res);
                              that.setLogonAccount(res.Accounts[0]);
                          }
                          else
                          {
                              message.warn('登陆信息校验完成,账号校验失败');
                          }
                      }
                  }
              )
          }}/>;
      }
      //endregion
    let currentPage = this.state.currentPage;
    const { collapsed } = this.state;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          // breakpoint="lg"
          // collapsedWidth="0"
          // onBreakpoint={broken => {
          //   console.log(broken);
          // }}
          collapsible collapsed={collapsed} onCollapse={this.onCollapse}
          // onCollapse={(collapsed, type) => {
          //   console.log(collapsed, type);
          // }}

        >
          <img src={logo} alt={'mei tupian'}
               // className={classNames.logo}
            className={'logo'}
          />
          {/*<div className="logo" />*/}
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline"
                // defaultOpenKeys={["sub2","sub1"]}
          >
                         <Menu.Item key="1" icon={<HomeOutlined />}
                                    onClick={()=>{this.setState({currentPage:<Status/>})}}
                         >
                        状态信息
                         </Menu.Item>
                         <Menu.Item key="2" icon={<BarcodeOutlined />}
                                    onClick={()=>{this.setState({currentPage:<MedicinesManage/>})}}
                         >
                          药品管理
                        </Menu.Item>

                         <SubMenu key="sub2" icon={<InteractionOutlined />} title="库存管理">
                           <Menu.Item key="8"
                                      onClick={()=>{this.setState({currentPage:<InventoryStatus/>})}}
                           >当前库存</Menu.Item>
                           <Menu.Item key="6"
                                      onClick={()=>{this.setState({currentPage:<InstockRecord/>})}}
                           >上药记录</Menu.Item>
                           <Menu.Item key="7"
                                      onClick={()=>{this.setState({currentPage:<FulfillRecord/>})}}
                           >取药记录</Menu.Item>
                         </SubMenu>
                         <SubMenu key="sub1" icon={<UserOutlined />} title="账户管理">
                           <Menu.Item key="3"
                                      onClick={()=>{this.setState({currentPage:<MyAccount/>})}}
                           >我的信息</Menu.Item>
                           <Menu.Item key="4"
                                      onClick={()=>{this.setState({currentPage:<AccountsManage/>})}}
                           >管理其他账户</Menu.Item>
                         </SubMenu>
                         <Menu.Item key="9" icon={<SettingOutlined />}
                                    onClick={()=>{this.setState({currentPage:<SettingManage/>})}}
                         >
                           系统设置
                         </Menu.Item>
                         <Menu.Item key="10" icon={<FileSearchOutlined />}
                                    onClick={()=>{this.setState({currentPage:<LogView/>})}}
                         >
                          日志查询
                         </Menu.Item>
                       </Menu>
        </Sider>
        <Layout>
          <Header theme={'dark'}
                  // className="site-layout-sub-header-background"
                  style={{ padding: 0 ,textAlign:'right',paddingRight:10}}
          >
              <Button onClick={() => {
    this.testFunc();
}}>测试按钮</Button>
              <Avatar style={{userSelect:'none'}}
              >{this.state.account.Name?this.state.account.Name[0]:'User'}</Avatar>

          </Header>
          {/*<Banner/>*/}
          <Content style={{ margin: '24px 16px 0' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360, height:'100%' }}>
              {currentPage}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>潮咖医疗付药机管理系统 ©2021 Created by Norman @ Chaoka Medical Tech Co., Ltd.</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default Main;
