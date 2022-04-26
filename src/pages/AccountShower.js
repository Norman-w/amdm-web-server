import React, {Component} from 'react';
import app from "../app";
import {Button, Input, InputNumber, message, Modal, Radio} from "antd";
import classNames from "./myAccount.module.css";
// import NewAccount from "./dialog/NewAccount";
import ChangePassword from "./dialog/ChangePassword";
import md5 from 'js-md5';

class AccountShower extends Component {
    componentDidMount() {
        if (this.props.account)
        {
            let state = {
                ...this.props.account,
                editing:this.props.creating,
                requesting:false,
            }
            // console.log('初始化账号显示页:', state)
            this.setState(state)
        }
    }
    componentWillReceiveProps(nextProps, nextContext) {

        if (!nextProps.account)
        {
            return;
        }
        let newState={
            Id:nextProps.account.Id,
            Age:nextProps.account.Age,
            Name:nextProps.account.Name,
            UserName:nextProps.account.UserName,
            Sex:nextProps.account.Sex,
            Department:nextProps.account.Department,
            CreateTime:nextProps.account.CreateTime,
            ModifiedTime:nextProps.account.ModifiedTime,
            Mobile:nextProps.account.Mobile,
        }
        this.setState(newState)
    }

    state={
        Id:0,Name:'',Age:0,UserName:'',Sex:'',Department:'',CreateTime:'',ModifiedTime:'',Mobile:'',
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
          let param = this.state;
          delete param['Password'];
            this.setState({requsting: true}
                , () => {
                    let that = this;
                    app.doPost2(
                        {
                            url:app.setting.serverSideApiRouterUrl,
                            apiName:'account.update',
                            params:param,
                            onFail:(t)=>{message.warn(t?'保存账户信息超时':'请检查网络');that.abortController = new AbortController();},
                            onFinish:(res)=>
                            {
                                if (res.IsError)
                                {
                                    message.error(res.ErrMsg);
                                    that.setState({
                                        requesting:false
                                    })
                                }
                                else
                                {
                                    message.success('新的账户信息已保存');
                                  console.log(res);
                                    if (app.account && res.UpdatedAccount && app.account.Id === res.UpdatedAccount.Id) {
                                        app.account = res.UpdatedAccount;
                                    }
                                    that.setState(
                                        {
                                            requesting:false,
                                            editing:false,
                                        }
                                    )
                                    if (that.props.onSave)
                                    {
                                        that.props.onSave(res.UpdatedAccount);
                                    }
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
    //当点击删除用户时触发
    onClickDeleteAccount()
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
                            apiName:'account.delete',
                            params:{Id:this.state.Id},
                            onFail:(t)=>{message.warn(t?'删除账户信息超时':'请检查网络');that.abortController = new AbortController();},
                            onFinish:(res)=>
                            {
                                if (res.IsError)
                                {
                                    message.error(res.ErrMsg);
                                    that.setState({
                                        requesting:false
                                    })
                                }
                                else
                                {
                                    message.success('删除完成');
                                    if (that.props.onDelete)
                                    {
                                        that.props.onDelete(that.state.Id);
                                    }
                                    that.setState({Id:0});
                                }
                            },
                            timeoutMS:3000,
                            abortController:this.abortController
                        }
                    )
                });
        }
    }
    onClickChangePassword()
    {
        let that = this;
        let md = Modal.info(
            {
                title:'请输入原始密码和新密码',
                centered:true,
                content:<ChangePassword onCancel={()=>{
                    md.destroy()
                }}
                                    onSubmit={(oldPass,newPass)=>
                                    {
                                        that.changePassAtSql(oldPass,newPass)
                                        md.destroy();
                                    }
                                    }
                />,
                okButtonProps:{
                    hidden:true
                }
            }
        )
    }
    changePassAtSql(oldPass,newPass)
    {
        if (this.state.requesting)
        {

        }
        else
        {
            this.setState({requesting:true}
                ,()=>
                {
                    let that = this;
                    let oldPassMd5 = md5(oldPass);
                    console.log('原始密码md5', oldPassMd5);
                    app.doPost2(
                        {
                            url:app.setting.serverSideApiRouterUrl,
                            apiName:'account.update',
                            params:
                                {
                                    Id:this.state.Id,
                                    oldPasswordMd5: oldPassMd5,
                                    password:newPass,
                                },
                            onFinish:(res)=>
                            {
                                if (res.IsError)
                                {
                                    message.warn(res.ErrMsg);
                                    that.setState({requesting:false});
                                }
                                else
                                {
                                    message.success('修改密码成功!')
                                    that.setState({requesting:false});
                                }
                            },
                            onFail:(t)=>
                            {
                              message.warn(t?'修改密码超时':'请检查网络');
                                that.setState({requesting:false});
                                that.abortController = new AbortController();
                            },
                        }
                    )
                })
        }
    }
    render() {
        // console.log('渲染用户', this.state);
        let account = this.state;
        let avatarText = account.Name? account.Name[account.Name.length-1]:'-';
        let editing = this.state.editing;
        if (!account.Id)
        {
            return null;
        }
        return (
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
                <div id={'手机行'} className={classNames.infoLine}>
                    <div className={classNames.infoLabel}>手机号</div>
                    <div className={classNames.infoValue}>
                        <Input value={account.Mobile} disabled={!editing}  onChange={e=>this.setState({Mobile:e.target.value})}/>
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
                    <Button type={'danger'} disabled={account.Id===1}
                            onClick={()=>{
                                this.onClickDeleteAccount();
                            }}
                    >删除用户</Button>
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
                    <Button type={'primary'} disabled={editing} onClick={()=>{
                        this.onClickChangePassword();
                    }}>修改密码</Button>
                </div>
            </div>
        );
    }
}

export default AccountShower;
