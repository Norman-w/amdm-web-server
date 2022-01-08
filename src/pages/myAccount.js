import React, {Component} from 'react';
import {Button, Input, InputNumber, message} from 'antd';
import classNames from './myAccount.module.css'
import app from "../app";
import { Radio } from 'antd';


class MyAccount extends Component {
    componentDidMount() {
        console.log('我的账户页面被加载', app.account);
        if (app.account && app.account.Id>0)
        {
            console.log('app中的account:',app.account)
            let state = {
                ...app.account,
                editing:this.props.editing
            }
            this.setState(state)
        }
    }

    state={
        Id:0,Name:'',Age:0,UserName:'',Sex:'',Department:'',CreateTime:'',ModifiedTime:'',
        editing:false,
        requesting:false,
    }
    abortController = new AbortController();
    saveAccount()
    {
        if (this.state.requesting)
        {
        }
        else {
            this.setState({requsting: true}
                , () => {
                let that = this;
                app.doPost2(
                    {
                        url:app.setting.serverSideApiRouterUrl,
                        apiName:'account.update',
                        params:this.state,
                        onTimeout:()=>{message.warn('保存账户信息超时');that.abortController = new AbortController();},
                        onFinish:(res)=>
                        {
                            if (res.IsErr)
                            {
                                message.error(res.ErrMsg);
                                that.setState({
                                    requesting:false
                                })
                            }
                            else
                            {
                                message.success('新的账户信息已保存');
                                app.account = res.UpdatedAccount;
                                that.setState(
                                    {
                                        ...that.state,
                                        ...res.UpdatedAccount,
                                        requesting:false,
                                        editing:false,
                                    }
                                )
                            }
                            that.abortController = new AbortController();
                        },
                        timeoutMS:3000,
                        abortController:this.abortController
                    }
                )
                });
        }
    }
  render() {
        let account = this.state;
        let avatarText = account.Name? account.Name[account.Name.length-1]:'-';
        let editing = this.state.editing;
        if (!account || !account)
        {
            return null;
        }
    return (
        <div className={classNames.main}>
          <div>我的账户</div>
          <div id={'容器'} className={classNames.container}>
            <div id={'标题行'} className={classNames.titleLine}>个人信息</div>
            <div id={'头像行'}>
              <div className={classNames.avatar} style={{userSelect:'none'}}>{avatarText}</div>
            </div>
            <div id={'ID行'} className={classNames.grayLine}>No.{account.Id}</div>
            <div id={'创建时间行'}  className={classNames.createTimeLine} hidden={!account.CreateTime}>
                <div>创建时间</div>
                <div>{account.CreateTime}</div>
            </div>
            <div id={'用户名行'} className={classNames.infoLine}>
                <div className={classNames.infoLabel}>用户名</div>
                <div className={classNames.infoValue}>
                    <Input value={account.UserName} disabled={!editing} onChange={e=>this.setState({UserName:e.target.value})}/>
                </div>
            </div>
            <div id={'姓名行'} className={classNames.infoLine}>
                <div className={classNames.infoLabel}>姓名</div>
                <div className={classNames.infoValue}>
                    <Input value={account.Name} disabled={!editing}  onChange={e=>this.setState({Name:e.target.value})}/>
                </div>
            </div>
            <div id={'性别行'} className={classNames.infoLine}>
                <div className={classNames.infoLabel}>性别</div>
                <div className={classNames.infoValue}>
                    <Radio.Group
                        disabled={!editing}
                        onChange={(e)=>{
                        this.setState({Sex:e.target.value})
                    }} value={this.state.Sex}>
                        <Radio value={'男'}>男</Radio>
                        <Radio value={'女'}>女</Radio>
                    </Radio.Group>
                </div>
            </div>
            <div id={'年龄行'} className={classNames.infoLine}>
                <div className={classNames.infoLabel}>年龄</div>
                <div className={classNames.infoValue}>
                    <InputNumber disabled={!editing}  style={{width:'100%'}} min={16} max={100} value={this.state.Age} onChange={(value)=>{
                        this.setState({Age:value})
                    }} />
                </div>
            </div>
            <div id={'科室行'} className={classNames.infoLine}>
                <div className={classNames.infoLabel}>科室</div>
                <div className={classNames.infoValue}>
                    <Input disabled={!editing}  value={this.state.Department} onChange={(e) => {
    this.setState({Department: e.target.value})
}}/>
                </div>
            </div>
              <div id={'操作行'} className={classNames.actionLine}>
                  <Button type={'danger'} disabled={account.Id===1}>删除用户</Button>
                  <Button type={'primary'} onClick={()=>{
                      if(editing)
                      {
                          this.saveAccount();
                      }
                      else {
                          //进入编辑模式
                          this.setState({editing: true})
                      }
                  }}>{editing?'保存':'编辑信息'}</Button>
                  <Button type={'primary'} disabled={editing}>修改密码</Button>
              </div>
          </div>
        </div>
    );
  }
}

export default MyAccount;
