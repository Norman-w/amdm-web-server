import React, {Component} from 'react';
import classNames from './accountsManage.module.css';
import {Spin,Button, message, Modal} from "antd";
import AccountShower from "./AccountShower";
import app from "../app";
import NewAccount from "./dialog/NewAccount";

class AccountsManage extends Component {
    componentDidMount() {
        this.loadAccounts();
    }
  state={
    accounts:[],
    selectedAccount:null,
    creating:false,
    requesting:false,
  }
  abortController = new AbortController();
  onClickCreateAccount()
  {
      let that = this;
    let md = Modal.info(
        {
          title:'请输入用户名并设置密码',
          centered:true,
          content:<NewAccount onCancel={()=>{
              md.destroy()
          }}
                              onSubmit={(user,pass)=>
                              {
                                  that.addUser2Sql(user,pass,()=>{
                                  })
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
  addUser2Sql(userName,passWord,onSuccess)
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
            app.doPost2(
                {
                  url:app.setting.serverSideApiRouterUrl,
                  apiName:'account.add',
                  params:
                      {
                        userName:userName,passWord:passWord
                      },
                  onFinish:(res)=>
                  {
                    if (res.IsError)
                    {
                      message.warn(res.ErrMsg);
                      that.setState({requesting:false,creating:false});
                    }
                    else
                    {
                        message.success('用户 [' + userName + '] 添加成功!')
                      that.setState({requesting:false,creating:false,selectedAccount:res.NewAccount,accounts:[...that.state.accounts,res.NewAccount]});
                      if (onSuccess)
                      {
                          onSuccess();
                      }
                    }
                  },
                  onFail:(t)=>
                  {
                    message.warn(t?'添加用户超时':'请检查网络');
                    that.setState({requesting:false,creating:false});
                    that.abortController = new AbortController();
                  },
                }
            )
          })
    }
  }
  loadAccounts()
  {
      if (this.state.requesting)
      {}
      else
      {
          this.setState({requesting:true},
              ()=>
              {
                  let that = this;
                  app.doPost2(
                      {
                          url:app.setting.serverSideApiRouterUrl,
                          apiName:'accounts.get',
                          params:
                              {
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
                                  // console.log('读取到所有账户:', res.Accounts);
                                  that.setState({requesting:false, accounts:res.Accounts});
                              }
                          },
                          onFail:(t)=>
                          {
                            message.warn(t?'加载用户列表超时': '请检查网络连接');
                              that.setState({requesting:false});
                              that.abortController = new AbortController();
                          },
                      }
                  )
              }
          )
      }
  }
  render() {
      let content = this.state.requesting?<div className={classNames.loadingArea}><Spin/></div>:
          <div className={classNames.content}>
              <div className={classNames.listArea}>
                  <div className={classNames.list}>
                      <div className={classNames.listTitle}>
                          <div>编号</div>
                          <div>账号</div>
                      </div>
                      <div className={classNames.listRecords}>
                          {
                              this.state.accounts.map((acc,index)=>
                              {
                                  let cls = this.state.selectedAccount === acc? classNames.listRecordSelected:classNames.listRecord;
                                  return <div className={cls} key={index}
                                              onClick={()=>
                                              {
                                                  this.setState({selectedAccount:acc});
                                              }}
                                  >
                                      <div className={classNames.idText}>{acc.Id}</div>
                                      <div className={classNames.userText}>{acc.UserName}</div>
                                  </div>
                              })
                          }
                      </div>
                  </div>
                  <div className={classNames.addUserBtnLine}>
                      <Button type={'primary'} onClick={this.onClickCreateAccount.bind(this)}>添加账户</Button>
                  </div>
              </div>
              <div className={classNames.detailArea}>
                  <AccountShower account={this.state.selectedAccount} editing={this.state.creating} onSave={(refAccount)=>{
                      if (this.state.accounts)
                      {
                        for (let i = 0; i < this.state.accounts.length; i++) {
                          let inList = this.state.accounts[i];
                          // let inRef = refAccount;
                          // console.log('在inlist', inList, '在ref', inRef);
                          if (!inList || !refAccount)
                          {
                            continue;
                          }
                          if (this.state.accounts[i].Id === refAccount.Id)
                          {
                            let st = this.state;
                            st.accounts[i] = refAccount;
                            this.setState(st);
                            // this.state.accounts[i] = refAccount;
                            break;
                          }
                        }
                      }
                  }} onDelete={(Id)=>{
                      if (this.state.accounts)
                      {
                          console.log('要删除的ID')
                          let index = -1;
                          for (let i = 0; i < this.state.accounts.length; i++) {
                              let current = this.state.accounts[i];
                              if(current.Id === Id)
                              {
                                  index = i;
                                  break;
                              }
                          }
                          if (index>=0) {
                              let newState = this.state;
                              newState.accounts.splice(index,1);
                              newState.selectedAccount= {};
                              this.setState(newState);
                              console.log('当前的账户表:',this.state);
                          }
                      }
                  }}/>
              </div>
          </div>
    return (
      <div className={classNames.main}>
        <div className={classNames.title}>账户管理</div>
          {content}
      </div>
    );
  }
}

export default AccountsManage;
