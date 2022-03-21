import React, {Component} from 'react';
import classesName  from './settingManage.module.css'
import app from "../app";
import {WarehouseAc} from "./component/WarehouseAC";
import {Switch, message, Modal, TimePicker, ConfigProvider} from 'antd';
import NumberInputForm from "./dialog/NumberInputForm";
import moment from 'moment';
import TimeSelector from 'dragable-time-selector/build'


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
                        that.loadAMDMSetting();
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
  onChangeUVLampOnOffTime(mode)
  {
    let clockDefaultValue = null;
    if (mode ===  'on')
    {
      clockDefaultValue = this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime);
    }
    else if(mode === 'off')
    {
      clockDefaultValue = this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime);
    }
    let dest = null;
    let md = Modal.confirm(
      {
        title : null,
          centered:true,
        icon:null,
        content:<TimeSelector time={clockDefaultValue} onChange={
          (val)=>
          {
            console.log('改变为val',val);
            dest = val;
          }
        }/>,
        onOk:()=>
        {
          let on = null;
          let off = null;
          if (mode === 'on')
          {
            if (!dest)
            {
              md.destroy();
              return;
            }
            message.success(JSON.stringify(dest));
            on = this.to24String(dest);
            off = this.to24String(this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime));
          }
          else if(mode === 'off')
          {
            if (!dest)
            {
              md.destroy();
              return;
            }
            off = this.to24String(dest);
            on = this.to24String(this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime));
          }
          this.setUVLampOnOffTime(on,off);
          md.destroy();
        }
      }
    );
  }

  onChangeMedicineOrderAutoHideWhenNoActionMS()
  {
      let current = this.state.AMDMSetting.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS/1000;
      let sf = new NumberInputForm();
      let that = this;
      let api = "amdmsetting.update";
      sf.show('请输入时间,以秒为单位','当前设定值为:'+current,
          current,(val)=>
          {
             app.doPost2(
                 {
                 url:app.setting.clientSideAMDMControlPanelRouterUrl,
                 apiName:api,
                     headers:
                         {
                             'Content-Type':'application/json;charset=utf-8;',
                             'apiName':api
                         },
                     params:
                         {
                             field:"UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS",
                             value:val*1000,
                         },
                     onFinish:(res)=>
                     {
                         if(res && !res.IsError)
                         {
                             console.log(res);
                             let old = that.state.AMDMSetting;
                             old.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS = res.NewValue;
                             that.setState({AMDMSetting:old});
                             message.success('已更新时间为'+res.NewValue/1000+'秒');
                         }
                         else
                         {
                             message.error('操作错误:'+(res&&res.ErrMsg?res.ErrMsg:'未知错误'));
                         }
                     }
                 }
             )
          }
          ,false
      )
  }
  onNoticeShowerAutoHideMS()
  {
      let current = this.state.AMDMSetting.UserInterfaceSetting.NoticeShowerAutoHideMS/1000;
      let sf = new NumberInputForm();
      let that = this;
      let api = "amdmsetting.update";
      sf.show('请输入时间,以秒为单位','当前设定值为:'+current,
          current,(val)=>
          {
              app.doPost2(
                  {
                      url:app.setting.clientSideAMDMControlPanelRouterUrl,
                      apiName:api,
                      headers:
                          {
                              'Content-Type':'application/json;charset=utf-8;',
                              'apiName':api
                          },
                      params:
                          {
                              field:"UserInterfaceSetting.NoticeShowerAutoHideMS",
                              value:val*1000,
                          },
                      onFinish:(res)=>
                      {
                          if(res && !res.IsError)
                          {
                              console.log(res);
                              let old = that.state.AMDMSetting;
                              old.UserInterfaceSetting.NoticeShowerAutoHideMS = res.NewValue;
                              that.setState({AMDMSetting:old});
                              message.success('已更新时间为'+res.NewValue/1000+'秒');
                          }
                          else
                          {
                              message.error('操作错误:'+(res&&res.ErrMsg?res.ErrMsg:'未知错误'));
                          }
                      }
                  }
              )
          }
          ,false
      )
  }

  onChange_默认可装入药机的药品有效期最少多少天()
  {
      let current = this.state.AMDMSetting._默认可装入药机的药品有效期最少多少天;
      if(!current)
      {
          current = 10;
      }
      let sf = new NumberInputForm();
      let that = this;
      let api = "amdmsetting.update";
      sf.show('请输入默认可装入药机的药品有效期天数','当前设定值为:'+current,
          current,(val)=>
          {
              app.doPost2(
                  {
                      url:app.setting.clientSideAMDMControlPanelRouterUrl,
                      apiName:api,
                      headers:
                          {
                              'Content-Type':'application/json;charset=utf-8;',
                              'apiName':api
                          },
                      params:
                          {
                              field:"_默认可装入药机的药品有效期最少多少天",
                              value:val,
                          },
                      onFinish:(res)=>
                      {
                          if(res && !res.IsError)
                          {
                              console.log(res);
                              let old = that.state.AMDMSetting;
                              old._默认可装入药机的药品有效期最少多少天 = res.NewValue;
                              that.setState({AMDMSetting:old});
                              message.success('更新默认可装入药机的药品有效期天数为'+res.NewValue);
                          }
                          else
                          {
                              message.error('操作错误:'+(res&&res.ErrMsg?res.ErrMsg:'未知错误'));
                          }
                      }
                  }
              )
          }
          ,false
      )
  }
  onChange_默认可装入药机的药品建议有效期大于多少天()
  {
      let current = this.state.AMDMSetting._默认可装入药机的药品建议有效期大于多少天;
      if(!current)
      {
          current = 90;
      }
      let sf = new NumberInputForm();
      let that = this;
      let api = "amdmsetting.update";
      sf.show('请输入默认可装入药机的药品建议有效期天数','当前设定值为:'+current,
          current,(val)=>
          {
              app.doPost2(
                  {
                      url:app.setting.clientSideAMDMControlPanelRouterUrl,
                      apiName:api,
                      headers:
                          {
                              'Content-Type':'application/json;charset=utf-8;',
                              'apiName':api
                          },
                      params:
                          {
                              field:encodeURIComponent("_默认可装入药机的药品有效期最少多少天"),
                              value:val,
                          },
                      onFinish:(res)=>
                      {
                          if(res && !res.IsError)
                          {
                              console.log(res);
                              let old = that.state.AMDMSetting;
                              old.默认可装入药机的药品建议有效期大于多少天 = res.NewValue;
                              that.setState({AMDMSetting:old});
                              message.success('更新可装入药机的药品建议有效期天数为'+res.NewValue);
                              console.log(res);
                          }
                          else
                          {
                              message.error('操作错误:'+(res&&res.ErrMsg?res.ErrMsg:'未知错误'));
                          }
                      }
                  }
              )
          }
          ,false
      )
  }
  onChange_默认已装入药机的药品有效期小于多少天时提醒()
  {
      let current = this.state.AMDMSetting._默认已装入药机的药品有效期小于多少天时提醒;
      if(!current)
      {
          current = 30;
      }
      let sf = new NumberInputForm();
      let that = this;
      let api = "amdmsetting.update";
      sf.show('请输入已装入药机的药品有效期小于多少天时提醒','当前设定值为:'+current,
          current,(val)=>
          {
              app.doPost2(
                  {
                      url:app.setting.clientSideAMDMControlPanelRouterUrl,
                      apiName:api,
                      headers:
                          {
                              'Content-Type':'application/json;charset=utf-8;',
                              'apiName':api
                          },
                      params:
                          {
                              field:"_默认已装入药机的药品有效期小于多少天时提醒",
                              value:val,
                          },
                      onFinish:(res)=>
                      {
                          if(res && !res.IsError)
                          {
                              console.log(res);
                              let old = that.state.AMDMSetting;
                              old.默认可装入药机的药品建议有效期大于多少天 = res.NewValue;
                              that.setState({AMDMSetting:old});
                              message.success('更新已装入药机的药品有效期提醒天数为'+res.NewValue);
                          }
                          else
                          {
                              message.error('操作错误:'+(res&&res.ErrMsg?res.ErrMsg:'未知错误'));
                          }
                      }
                  }
              )
          }
          ,false
      )
  }


  getHHmm(time)
  {
    if (!time)
    {
      return null;
    }
    let t = new Date(time);
    let h = t.getHours();
    let m = t.getMinutes();
    let r = 0;
    if (h>12)
    {
      r = 1;
      h -=12;
    }
    let ret = {hour:h,minute:m,round:r};
    return ret;
    // let ret = (t.getHours()).toString().padStart(2,'0') + ":"+ t.getMinutes().toString().padEnd(2,'0');
    // return ret;
  }
  getHHmmString(str)
  {
    let time = this.getHHmm(str);
    let h = time.hour.toString().padStart(2,'0');
    let m = time.minute.toString().padStart(2,"0");
    let round = time.round>0?"下午":"上午";
    let ret = h + ":" + m + " " + round;
    return ret;
  }
  to24String(time)
  {
    console.log('to24string', time)
    let hh = time.hour;
    let mm = time.minute;
    if (time.round>0)
    {
      hh += 12;
    }
    return ""+hh.toString().padStart(2,'0')+":"+mm.toString().padStart(2,'0')
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
        UVStartTime = this.getHHmmString(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime);
        UVEndTime = this.getHHmmString(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime);
    }
    let autoReturnTimeMM = 60;
    if (this.state && this.state.AMDMSetting && this.state.AMDMSetting.UserInterfaceSetting && this.state.AMDMSetting.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS)
    {
        autoReturnTimeMM = this.state.AMDMSetting.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS;
    }
    let noticeShowerAutoHideMS = 5;
      if (this.state && this.state.AMDMSetting && this.state.AMDMSetting.UserInterfaceSetting && this.state.AMDMSetting.UserInterfaceSetting.NoticeShowerAutoHideMS)
      {
          noticeShowerAutoHideMS = this.state.AMDMSetting.UserInterfaceSetting.NoticeShowerAutoHideMS;
      }
      let mixValidExpiration = 10;
      if (this.state && this.state.AMDMSetting && this.state.AMDMSetting.UserInterfaceSetting && this.state.AMDMSetting.UserInterfaceSetting._默认可装入药机的药品有效期最少多少天)
      {
          noticeShowerAutoHideMS = this.state.AMDMSetting.UserInterfaceSetting._默认可装入药机的药品有效期最少多少天;
      }
      let suguestValidExpiration = 90;
      if (this.state && this.state.AMDMSetting && this.state.AMDMSetting.UserInterfaceSetting && this.state.AMDMSetting.UserInterfaceSetting._默认可装入药机的药品建议有效期大于多少天)
      {
          suguestValidExpiration = this.state.AMDMSetting.UserInterfaceSetting._默认可装入药机的药品建议有效期大于多少天;
      }
      let alarmExpiration = 30;
      if (this.state && this.state.AMDMSetting && this.state.AMDMSetting.UserInterfaceSetting && this.state.AMDMSetting.UserInterfaceSetting._默认已装入药机的药品有效期小于多少天时提醒)
      {
          alarmExpiration = this.state.AMDMSetting.UserInterfaceSetting._默认已装入药机的药品有效期小于多少天时提醒;
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
              <div className={classesName.lightWord}>{UVStartTime}</div>
                <div className={this.state.mouseIn === 'uv'?classesName.settingBtn:classesName.settingBtnHide }
                     onClick={()=>{
                       this.onChangeUVLampOnOffTime('on')
                     }}
                >
                  <div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
            </div>
            <div className={classesName.flexRow}>每日关闭时间
              <div className={classesName.lightWord}>{UVEndTime}</div>
                <div className={this.state.mouseIn === 'uv'?classesName.settingBtn:classesName.settingBtnHide }
                     onClick={()=>{
                       this.onChangeUVLampOnOffTime('off')
                     }}
                ><div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
            </div>
              <div>当前状态<Switch  checked={status?status.UVLampIsWorking:false} checkedChildren="开启" unCheckedChildren="关闭"
                                onChange={()=>{
                                    this.onClickTurnOnOffUVLamp()
                                }}
              /></div>
          </div>

        </div>
        <div className={classesName.interactiveSetting}
             onMouseEnter={()=>this.setState({mouseIn:'interactive'})}
             onMouseLeave={()=>this.setState({mouseIn:null})}
        >
          <div className={classesName.partName}>用户交互</div>
          <div className={classesName.partContent}>
              <div className={classesName.flexRow}>在扫描处方二维码后如<div className={classesName.lightWord}>{autoReturnTimeMM/1000}</div>秒未进行操作将返回
                  <div className={this.state.mouseIn === 'interactive'?classesName.settingBtn:classesName.settingBtnHide }
                       onClick={()=>{
                          this.onChangeMedicineOrderAutoHideWhenNoActionMS();
                       }}
                  >
                      <div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
              </div>
                <div className={classesName.flexRow}>文本及语音提示的全屏消息框,在语音播放完毕后<div className={classesName.lightWord}>{noticeShowerAutoHideMS/1000}</div>秒延迟关闭
                    <div className={this.state.mouseIn === 'interactive'?classesName.settingBtn:classesName.settingBtnHide }
                         onClick={()=>{
                             this.onNoticeShowerAutoHideMS()
                         }}
                    >
                        <div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
                </div>
          </div>
        </div>
        <div className={classesName.bestMatchGridWay}>
          <div className={classesName.partName}>
            药品出仓顺序
          </div>
          <div className={classesName.partContent}>
            <div>模式1先入仓药品优先</div>
            <div>模式2临近有效期优先(要求上药时填写有效期,且每个药槽内的药品正确排序)</div>
          </div>
        </div>
        <div className={classesName.expiration}
             onMouseEnter={()=>this.setState({mouseIn:'expiration'})}
             onMouseLeave={()=>this.setState({mouseIn:null})}
        >
          <div className={classesName.partName}>药品有效期控制</div>
          <div className={classesName.partContent}>
              <div className={classesName.grayWord}>每个药品的有效期控制策略可单独在药品管理中设置</div>
             <div className={classesName.flexRow}>默认可装入药机的药品,有效期至少<div className={classesName.lightWord}>{mixValidExpiration}</div>天
                 <div className={this.state.mouseIn === 'expiration'?classesName.settingBtn:classesName.settingBtnHide }
                      onClick={()=>{
                          this.onChange_默认可装入药机的药品有效期最少多少天();
                      }}
                 ><div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
             </div>
              <div className={classesName.flexRow}>默认建议有效期大于<div className={classesName.lightWord}>{suguestValidExpiration}</div>天
                  <div className={this.state.mouseIn === 'expiration'?classesName.settingBtn:classesName.settingBtnHide }
                       onClick={()=>{
                           this.onChange_默认可装入药机的药品建议有效期大于多少天();
                       }}
                  ><div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
              </div>
            <div className={classesName.flexRow}>默认当有效期小于<div className={classesName.lightWord}>{alarmExpiration}</div>天时提醒
                <div className={this.state.mouseIn === 'expiration'?classesName.settingBtn:classesName.settingBtnHide }
                     onClick={()=>{
                         this.onChange_默认已装入药机的药品有效期小于多少天时提醒();
                     }}
                ><div className="iconfont icon-shezhi" style={{fontSize: 20}}/></div>
            </div>
            </div>
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
