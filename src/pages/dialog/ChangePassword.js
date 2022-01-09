import React, {Component} from 'react';
import classNames from "./NewAccount.module.css";
import {Button, Input, message} from "antd";

class ChangePassword extends Component {
    state=
        {
            OldPassword:null,
            Password:null,
            CheckPassword:null,
        }
        onClickSubmit()
        {
            if (!this.state.OldPassword || this.state.OldPassword.length<3)
            {
                message.warn('必须输入原始密码')
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
                    this.props.onSubmit(this.state.OldPassword,this.state.Password);
                }
            }
        }
    render() {
        return (
            <div className={classNames.newAccountModal}>
                <div className={classNames.newAccountInfoLine}>
                    <div>原始密码:</div>
                    <div>
                        <Input value={this.state.OldPassword} onChange={(e)=>{this.setState({OldPassword:e.target.value})}}/>
                    </div>
                </div>

                <div className={classNames.newAccountInfoLine}>
                    <div>新密码:</div>
                    <div>
                        <Input value={this.state.Password} onChange={(e)=>{this.setState({Password:e.target.value})}}/>
                    </div>
                </div>

                <div className={classNames.newAccountInfoLine}>
                    <div>确认新密码:</div>
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
                                this.onClickSubmit();
                            }}
                    >确认</Button>
                </div>
            </div>
        );
    }
}

export default ChangePassword;