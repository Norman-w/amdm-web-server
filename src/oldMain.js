
import React from 'react'
import {Component} from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import {
  HomeOutlined,
BarcodeOutlined,
  FileSearchOutlined,
InteractionOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css'
import classNames from './Main.module.css';

import logo from './images/logo.jpeg';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    const { collapsed } = this.state;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <img src={logo} alt={'mei tupian'} className={classNames.logo}/>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<HomeOutlined />}>
              状态信息
            </Menu.Item>
            <Menu.Item key="2" icon={<BarcodeOutlined />}>
              药品管理
            </Menu.Item>

            <SubMenu key="sub2" icon={<InteractionOutlined />} title="库存管理">
              <Menu.Item key="8">当前库存</Menu.Item>
              <Menu.Item key="6">上药记录</Menu.Item>
              <Menu.Item key="7">取药记录</Menu.Item>
            </SubMenu>
            <SubMenu key="sub1" icon={<UserOutlined />} title="账户管理">
              <Menu.Item key="3">我的信息</Menu.Item>
              <Menu.Item key="4">管理其他账户</Menu.Item>
            </SubMenu>
            <Menu.Item key="9" icon={<SettingOutlined />}>
              系统设置
            </Menu.Item>
            <Menu.Item key="10" icon={<FileSearchOutlined />}>
              日志查询
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background"
                  // style={{ padding: 0,backgroundColor:'lightcyan'}}
          />
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              Bill is a cat.
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default SiderDemo;
// ReactDOM.render(<SiderDemo />, mountNode);
