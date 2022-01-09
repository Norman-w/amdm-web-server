import React, {Component} from 'react';
import classNames from "./NewAccount.module.css";
import {Button, Input, message} from "antd";

class NewAccount extends Component {
    state=
        {
            UserName:null,
            Password:null,
            CheckPassword:null,
        }
    render() {
        return (
            <div className={classNames.newAccountModal}>
                <div className={classNames.newAccountInfoLine}>
                    <div>用户名:</div>
                    <div>
                        <Input value={this.state.UserName} onChange={(e)=>{this.setState({UserName:e.target.value})}}/>
                    </div>
                </div>

                <div className={classNames.newAccountInfoLine}>
                    <div>密码:</div>
                    <div>
                        <Input value={this.state.Password} onChange={(e)=>{this.setState({Password:e.target.value})}}/>
                    </div>
                </div>

                <div className={classNames.newAccountInfoLine}>
                    <div>确认密码:</div>
                    <div>
                        <Input value={this.state.CheckPassword} onChange={(e)=>{this.setState({CheckPassword:e.target.value})}}/>
                    </div>
                </div>

                <div className={classNames.btnLine}>
                    <Button onClick={
                        ()=>
                        {
                            if (this.props.onCancel)
                            {
                                this.props.onCancel()
                            }
                        }
                    }>取消</Button>
                    <Button type={'primary'}
                            onClick={()=>{
                                if (!this.state.UserName || this.state.UserName.length<3)
                                {
                                    message.warn('用户名太短')
                                }
                                else if(!this.state.Password || this.state.Password.length<6)
                                {
                                    message.warn('请设置至少6位的密码');
                                }
                                else if(this.state.Password !== this.state.CheckPassword)
                                {
                                    message.warn('两次输入密码不一致');
                                }
                                else
                                {
                                    if (this.props.onSubmit)
                                    {
                                        this.props.onSubmit(this.state.UserName,this.state.Password);
                                    }
                                }
                            }}
                    >确认</Button>
                </div>
            </div>
        );
    }
}

export default NewAccount;