import React, {Component} from 'react';
import classesName  from './settingManage.module.css'
import app from "../app";
import {WarehouseAc} from "./component/WarehouseAC";
import {Switch, message,Modal,TimePicker} from 'antd';
import NumberInputForm from "./dialog/NumberInputForm";
import moment from 'moment';


class SettingManage extends Component {
  state={
    PeripheralsStatus:null,
      mouseIn:null,
      AMDMSetting:null,
  };
  refreshInterval = null;
  componentDidMount() {
    this.refreshPeripheralsStatus();
    this.loadAMDMSetting();
    let that = this;
    this.refreshInterval = setInterval(()=>{
        that.refreshPeripheralsStatus();
            console.log('已执行空调温度刷新');
    },
        2000
    )
  }
  componentWillUnmount() {
      clearInterval(this.refreshInterval);
  }

    refreshPeripheralsStatus()
  {
      let api = 'peripheralsstatus.get';
      let that = this;
      app.doPost(
          {
              url:app.setting.clientSideAMDMControlPanelRouterUrl,
              headers:
                  {
                      'Content-Type':'application/json;charset=utf-8;',
                      'apiName':api
                  },
              params:
                  {
                      fields:'*',
                      forceRefresh:true,
                  },
              finish:(res)=>
              {
                  that.setState({PeripheralsStatus:res.PeripheralsStatus})
                  // console.log('目标温度:',res.PeripheralsStatus.WarehousesACStatus[0]);
              }
          }
      )
  }
  loadAMDMSetting()
  {
      let api = 'setting.get';
      let that = this;
      app.doPost(
          {
              url:app.setting.clientSideAMDMControlPanelRouterUrl,
              headers:
                  {
                      'Content-Type':'application/json;charset=utf-8;',
                      'apiName':api
                  },
              params:
                  {
                  },
              finish:(res)=>
              {
                  if (res&&!res.IsError)
                  {
                      that.setState({AMDMSetting:res.AMDMSetting})
                  }
                  console.log('获取amdmsetting结果', res);
              }
          }
      )
  }
  setACDestTemperature(stockIndex,destTemperature)
  {
      console.log('设置前:',this.state.PeripheralsStatus.WarehousesACStatus);
      let api = 'peripheralsstatus.ac.set';
      let that = this;
      app.doPost(
          {
              url:app.setting.clientSideAMDMControlPanelRouterUrl,
              headers:
                  {
                      'Content-Type':'application/json;charset=utf-8;',
                      'apiName':api
                  },
              params:
                  {
                      StockIndex:0,
                      DestTemperature:destTemperature,
                  },
              finish:(res)=>
              {
                  //{"IsError":false,"ErrMsg":null,"IsWorking":false,"CurrentTemprature":17.2,"DestTemperature":15}
                  if (res&&!res.IsError)
                  {
                     let old = {...that.state.PeripheralsStatus};
                     old.WarehousesACStatus[stockIndex].DestTemperature = destTemperature;
                     that.setState({PeripheralsStatus:old});
                     message.success('已重设温度为'+res.DestTemperature+'℃');
                      console.log('设置后:',that.state.PeripheralsStatus.WarehousesACStatus);
                  }
              }
          }
      )
  }
    setUVLampStatus(on)
    {
        let api = 'peripheralsstatus.uvlamp.onoff';
        let that = this;
        app.doPost(
            {
                url:app.setting.clientSideAMDMControlPanelRouterUrl,
                headers:
                    {
                        'Content-Type':'application/json;charset=utf-8;',
                        'apiName':api
                    },
                params:
                    {
                        On:on
                    },
                finish:(res)=>
                {
                    if (res&&!res.IsError)
                    {
                        message.success('紫外线灯已'+(res.On?'打开':'关闭'));
                        //region 先在类中更新
                        let old = that.state;
                        old.PeripheralsStatus.UVLampIsWorking = res.On;
                        that.setState(old);
                        //endregion
                    }
                }
            }
        )
    }
    setUVLampOnOffTime(on,off)
    {
        console.log('执行设定函数:',on,off)
        let api = 'peripherals.uvlamp.onofftime.set';
        let that = this;
        app.doPost(
            {
                url:app.setting.clientSideAMDMControlPanelRouterUrl,
                headers:
                    {
                        'Content-Type':'application/json;charset=utf-8;',
                        'apiName':api
                    },
                params:
                    {
                        UVLampOnTime:on,
                        UVLampOffTime:off,
                    },
                finish:(res)=>
                {
                    if (res&&!res.IsError)
                    {
                        message.success(JSON.stringify(res));
                    }
                    else
                    {
                        message.error('设定紫外线灯自动开关时间错误:'+ res.ErrMsg);
                    }
                },
            }
        )
    }

  onClickACSettingBtn(warehouse)
  {
    let current = warehouse.DestTemperature.toFixed(1);
    let sf = new NumberInputForm();
    let that = this;
    sf.show('请输入目标温度','当前设定温度为'+current,
      current,(val)=>
      {
        that.setACDestTemperature(warehouse.WarehouseIndexId,val);
      }
      ,true
      )
  }
  onClickTurnOnOffUVLamp()
  {
      if(!this.state.PeripheralsStatus.UVLampIsWorking)
      {
          let md = Modal.confirm(
              {
                  centered:true,
                  title:'警告!打开紫外线前请确认周围空间无人员停留.否则可能造成紫外线伤害',
                  onOk:()=>{
                      this.setUVLampStatus(true);
                  }
              }
          )
      }
      else
      {
          this.setUVLampStatus(false);
      }
  }
  onChangeUVLampOnOffTime(on,off)
  {
      if (!on || ! off)
      {
          console.log('有无效的数值:', on,off);
          return ;
      }
      on = moment(on);
      off = moment(off);
      console.log(on.minutes())
    this.setUVLampOnOffTime(on,off);
  }

  render() {
      const format = "HH:mm"
    let status = this.state.PeripheralsStatus;
    let acs = status? status.WarehousesACStatus:[];
    let mouseIn = this.state.mouseIn;
    let UVStartTime = null;
    let UVEndTime = null;
    if(this.state && this.state.AMDMSetting && this.state.AMDMSetting.DevicesSetting && this.state.AMDMSetting.DevicesSetting.UVLampSetting)
    {
        UVStartTime = moment(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime);
        UVEndTime = moment(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime);
    }
    return (
      <div className={classesName.main}>
        <div className={classesName.title}>
          设置
        </div>
        <div className={classesName.AC}>
          <div className={classesName.partName}>空调</div>
          <div className={classesName.partContent}>
            {acs.map((item,index)=>{
              return <WarehouseAc  key={index} warehouse={item} onClickSettingBtn={()=>{
                this.onClickACSettingBtn(item)}}/>
            })}
          </div>
        </div>
        <div className={classesName.UVLamp} onMouseEnter={()=>this.setState({mouseIn:'uv'})}
             onMouseLeave={()=>this.setState({mouseIn:null})}
        >
          <div className={classesName.partName}>紫外线杀菌</div>
          <div className={classesName.partContent}>
            <div className={classesName.flexRow}>每日开启时间
                <TimePicker value={UVStartTime}
                            format={format}
                            onChange={(time)=>{
                                console.log('改变开始时间', time._i);
                                this.onChangeUVLampOnOffTime(time._i, UVEndTime);
                            }}
                />
                <div className={this.state.mouseIn === 'uv'?classesName.uvSettingBtn:classesName.uvSettingBtnHide }><div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
            </div>
            <div className={classesName.flexRow}>每日关闭时间
                <TimePicker value={UVEndTime} format={format}
                            onChange={(time)=>{
                                this.onChangeUVLampOnOffTime(UVStartTime,time._i);
                            }}
                />
                <div className={this.state.mouseIn === 'uv'?classesName.uvSettingBtn:classesName.uvSettingBtnHide }><div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
            </div>
              <div>当前状态<Switch  checked={status?status.UVLampIsWorking:false} checkedChildren="开启" unCheckedChildren="关闭"
                                onChange={()=>{
                                    this.onClickTurnOnOffUVLamp()
                                }}
              /></div>
          </div>

        </div>
        <div className={classesName.interactiveSetting}>
          <div className={classesName.partName}>用户交互</div>
          <div className={classesName.partContent}>
            <div>在扫描处方二维码后没有操作的话,多少秒执行返回</div>
            <div>文本+语音提示的全屏消息框在语音播放完毕后多久延迟关闭</div>
          </div>
        </div>
        <div className={classesName.bestMatchGridWay}>
          <div className={classesName.partName}>
            药品出仓顺序
          </div>
          <div className={classesName.partContent}>
            <div>模式1先入库的先出库</div>
            <div>模式2生产日期快到的先出库(要求药品有生产日期,不然会按照入库顺序出)</div>
          </div>
        </div>
        <div className={classesName.expiration}>
          <div className={classesName.partName}>药品有效期控制</div>
          <div className={classesName.partContent}> 可装入药机的药品有效期最少多少天10
            可装入药机的药品建议有效期大于多少天90
            已装入药机的药品有效期小鱼多少天时提醒30</div>
        </div>
        <div className={classesName.errorProcessMethod}>
          <div className={classesName.partName}>故障处置方案</div>
          <div className={classesName.partContent}>通知工作人员 是否开启
            工作人员手机号设置
            故障后是否进入维护状态
            进入维护状态后需要工作人员手工复位(在药机端)</div>
        </div>
        <div className={classesName.medicineWarning}>
          <div className={classesName.partName}>药品预警</div>
          <div className={classesName.partContent}>是否接收库存预警消息
            库存预警消息的接收人设置
            是否接受药品有效期预警
            药品有效期预警消息接收人设置
          </div>
        </div>
      </div>

    );
  }
}

export default SettingManage;
