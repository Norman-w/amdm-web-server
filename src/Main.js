import {Avatar, Button, Layout, Menu, Modal, Tooltip} from 'antd';
import {
DotChartOutlined,
  DesktopOutlined,
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
import StocksInventory from "./pages/stocksInventory";
import { PoweroffOutlined } from '@ant-design/icons';
import GridsUsingRecord from "./pages/gridsUsingRecord";
// import DefaultClient from './AMDM_SDK/DefaultClient';
// import AccountsGetRequest from './AMDM_SDK/Request/AccountsGetRequest';

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
  setLogonAccount(account,session)
  {
      this.setState({account:account});
      app.account = account;
      app.session = session;
      console.log('已设置登陆账号为:', account);
  }
  testFunc()
  {
      console.log('开始执行测试请求post');
      //region 执行一个获取付药机8080接口传输的数据
      let api = 'peripheralsstatus.get';
      // let that = this;
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
              finish:(
                  // res
              )=>
              {
                  // that.setState({PeripheralsStatus:res.PeripheralsStatus})
              }
          }
      )
      //endregion
  }
  render() {
      //region 执行测试请求
      // return <center><Button
      // onClick={()=>{
      //     console.log('点击按钮');
      //     let client = new DefaultClient({
      //         address:'192.168.2.191',
      //         type:'http',
      //         path:'/clientside/apiRouter/'
      //     });
      //     let req = new AccountsGetRequest();
      //     client.Execute(req,null,0,(res)=>{
      //         console.log('执行函数成功了',res);
      //     })
      // }}
      // >测试按钮</Button>
      // </center>
      //endregion
      //region 如果是还没有登陆的状态 先登陆
      if (!this.state.account)
      {
          let that = this;
          return <LoginForm onLoginSuccess={(account,session)=>{
              that.setState({selectedKeys:['1'],currentPage:<Status/>, openKeys:[]},()=>{
                  that.setLogonAccount(account,session);
              })
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
              onOpenChange={(openKeys)=>{
                  this.setState({openKeys:openKeys});
              }}
                openKeys={this.state.openKeys}
                selectedKeys={this.state.selectedKeys}
                onSelect={(k)=>{
                    if (k.selectedKeys&&k.selectedKeys.length === 1)
                    {
                        this.setState({selectedKeys:k.selectedKeys});
                    }
                }}
          >
                         <Menu.Item key="1" icon={<DesktopOutlined />}
                                    onClick={()=>{this.setState({currentPage:<Status/>})}}
                         >
                        状态信息
                         </Menu.Item>
                         <Menu.Item key="2" icon={<BarcodeOutlined />}
                                    onClick={()=>{this.setState({currentPage:<MedicinesManage/>})}}
                         >
                          药品管理
                        </Menu.Item>

                         <SubMenu key="sub2" icon={<DotChartOutlined />} title="库存管理">
                           <Menu.Item key="8"
                                      onClick={()=>{this.setState({currentPage:<InventoryStatus/>})}}
                           >当前总库存</Menu.Item>
                           <Menu.Item key="eachStockInventory"
                                      onClick={()=>{this.setState({currentPage:<StocksInventory/>})}}
                           >各分仓载量</Menu.Item>
                         </SubMenu>
            <SubMenu key="inOutRecords" icon={<InteractionOutlined />} title="流转记录">
              <Menu.Item key="6"
                         onClick={()=>{this.setState({currentPage:<InstockRecord/>})}}
              >上药记录</Menu.Item>
              <Menu.Item key="7"
                         onClick={()=>{this.setState({currentPage:<FulfillRecord/>})}}
              >取药记录</Menu.Item>
              {/*<Menu.Item key="gridUsingRecords"*/}
              {/*           onClick={()=>{this.setState({currentPage:<GridsUsingRecord/>})}}*/}
              {/*>药槽使用记录</Menu.Item>*/}
            </SubMenu>
                         <SubMenu key="sub1" icon={<UserOutlined />} title="账户管理">
                           <Menu.Item key="3"
                                      onClick={()=>{this.setState({currentPage:<MyAccount/>})}}
                           >我的账户</Menu.Item>
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
              <Tooltip title={'点击查看或编辑用户信息'}>
              <Avatar style={{userSelect:'none',cursor:'pointer'}}
                      onClick={()=>{this.setState({currentPage:<MyAccount/>, selectedKeys:['3'],openKeys:['sub1']})}}
              >{this.state.account.Name?this.state.account.Name[this.state.account.Name.length-1]:'-'}</Avatar>
              </Tooltip>
{/*              <Button onClick={() => {*/}
{/*    this.testFunc();*/}
{/*}}>测试按钮</Button>*/}
            <Button style={{marginLeft:'20px'}} type={'primary'} ghost={true} dashed={true} icon={<PoweroffOutlined />} size={'small'}
                    onClick={
                        ()=>
                        {
                            Modal.confirm(
                                {
                                    title:'确认退出登录吗?',
                                    centered:true,
                                    onOk:()=>
                                    {
                                        this.setLogonAccount(null,null);
                                    }
                                }
                            )
                        }
                    }
            >退出登录</Button>
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

