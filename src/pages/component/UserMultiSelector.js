import React, {Component} from 'react';
import {Button, Checkbox, Tooltip} from 'antd';
import classNames from './UserMultiSelector.module.css';

class UserMultiSelector extends Component {
    state =
        {
            allUsers: [],
            selectedUserIds:[],
        }
    componentDidMount() {
        if (this.props.allUsers)
        this.setState({allUsers:this.props.allUsers,selectedUserIds: this.props.selectedUserIds?this.props.selectedUserIds:[]});
    }

    onChange(e,index) {
        let c = e.target.checked;
        let id = this.state.allUsers[index].Id;
        let old = this.state.selectedUserIds;
        if(c)
        {
            old.push(id);
        }
        else
        {
            old.splice(old.indexOf(id),1);
        }
        // console.log('user', id, 'checked', c,'index', index,  'new list ' , old);
        this.setState({selectedUserIds:old});
        if (this.props.onChange)
        {
            this.props.onChange(this.state.selectedUserIds);
        }
    }
    onSubmit()
    {
        if (this.props.onSubmit)
        {
            let selectedUsers = [];
            for (const id of this.state.selectedUserIds) {
                let u = this.state.allUsers.find((item)=>{
                    return item.Id === id;
                });
                if(u)
                {
                    selectedUsers.push(u);
                }
            }
            this.props.onSubmit(this.state.selectedUserIds,selectedUsers);
        }
    }

    render() {
        if (!this.state.allUsers) {
            return <></>
        }
        return (
            <div className={classNames.main}>
            <div className={classNames.lines}>
                {this.state.allUsers.map((user, index) => {
                    let checked = this.state.selectedUserIds.indexOf(user.Id)>=0;
                    if(!user||!user.Id)
                        return null;
                    return <div key={index} className={classNames.line}>
                        <Tooltip title={user.Mobile?'':'该用户未设定手机号码无法接收消息'}>
                        <Checkbox
                            disabled={!user.Mobile && !checked}
                            checked={checked}
                            onChange={(e) => {
    this.onChange(e, index)
}}/></Tooltip>
                            <div className={classNames.userArea}>
                                姓名:{user.Name}
                            </div>
                            <div className={classNames.mobileArea}>
                                手机:{user.Mobile}
                            </div>
                        </div>
                })}
            </div>
                <div className={classNames.bottomLine}>
                    <Button type={'primary'}
                            onClick={()=>{this.onSubmit()}}
                            style={{marginRight:20}}
                    >确定</Button>
                    <Button
                        onClick={()=>{if(this.props.onCancel)this.props.onCancel();}}
                    >取消</Button>
                </div>
            </div>
        );
    }
}

export default UserMultiSelector;