import React, {Component} from 'react';
import classNames from './status.module.css'
// import Page from "./test/AntdChart";
import '../iconfont.css';
import {WarehouseAc} from "./component/WarehouseAC";
import app from "../app";

class Status extends Component {
  state={
      IsWorking:false,
      StatusName:'正在获取交互状态...'
  }
  interval;
  url='http://192.168.2.191:8080';
  componentDidMount() {
      //region 执行一个获取付药机8080接口传输的数据
      let api = 'peripheralsstatus.get';
      let that = this;
      app.doPost(
          {
              url:this.url,
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
                  that.setState({PeripheralsStatus:res.PeripheralsStatus})
              }
          }
      )

      let getStatusFunc = ()=>
      {
          app.doPost({
              url:this.url,
              headers:
                  {
                      'Content-Type':'application/json;charset=utf-8;',
                      'apiName':'workingstatus.get'
                  },
              params:
                  {},
              finish:(res)=>
              {
                  that.setState({IsWorking:res.IsWorking,StatusName:res.StatusName});
              }
          })
      };
      getStatusFunc();
      //region 定时获取取药状态
      this.interval = setInterval(getStatusFunc,
          200)
      //endregion
  }

  componentWillUnmount() {
      if (this.interval)
      {
          clearInterval(this.interval);
      }
  }

    render() {
    let status = this.state.PeripheralsStatus;
    let acs = status? status.WarehousesACStatus:[];
    let statusName = this.state.StatusName;
    return (
      <div className={classNames.main}>

        <div className={classNames.line1}>

          <div className={classNames.status}><div className="iconfont status-icon icon-zuobiaoxuanqu" style={{fontSize: 30}}>
          </div>
            交互状态:{statusName}</div>
        </div>

        <div className={classNames.warehousesStatusLine}>
          {acs.map((item,index)=>{
            return <WarehouseAc  key={index} warehouse={item}/>
          })}
        </div>
          <div className={classNames.countLine}>
              <div className={classNames.countArea}>
                  <div className={classNames.todayTotal}>3</div>
                  <div className={classNames.infoGray}>今日已取药数量</div>
              </div>
              <div className={classNames.countArea}>
                  <div className={classNames.todayTotal}>541845119</div>
                  <div className={classNames.infoGray}>总已取药数量</div>
              </div>
          </div>

        {/*<Page></Page>*/}
      </div>
    );
  }
}

export default Status;
