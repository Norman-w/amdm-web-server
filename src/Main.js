import { Layout, Menu } from 'antd';
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



const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;


class Main extends Component {
  state=
    {
      currentPage:<Status/>,
    }
  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };
  render() {
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
                  style={{ padding: 0 }}
          />
          <Content style={{ margin: '24px 16px 0' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360, height:'100%' }}>
              {currentPage}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>潮咖医疗付药机管理系统 ©2021 Created by Norman & Chaoka Tech.Co,.Ltd</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default Main;

