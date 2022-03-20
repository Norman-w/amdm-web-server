import React, {Component} from 'react';
import classesName  from './settingManage.module.css'
import app from "../app";
import {WarehouseAc} from "./component/WarehouseAC";
import { message} from 'antd';
import NumberInputForm from "./dialog/NumberInputForm";

class SettingManage extends Component {
  state={
    PeripheralsStatus:null,
  };
  componentDidMount() {
    this.refreshPeripheralsStatus();
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
                      fields:'*'
                  },
              finish:(res)=>
              {
                  that.setState({PeripheralsStatus:res.PeripheralsStatus})
              }
          }
      )
  }
  setACDestTemperature(stockIndex,destTemperature)
  {
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
                      DestTemprature:destTemperature,
                  },
              finish:(res)=>
              {
                  message.success(JSON.stringify(res));
              }
          }
      )
  }

  onClickACSettingBtn(warehouse)
  {
    let current = warehouse.DestTemperature.toFixed(1);
    let sf = new NumberInputForm();
    sf.show('请输入目标温度','当前设定温度为'+current,
      current,(val)=>
      {
        this.setACDestTemperature(warehouse.WarehouseIndexId,val);
      }
      ,true
      )
  }

  render() {
    let status = this.state.PeripheralsStatus;
    let acs = status? status.WarehousesACStatus:[];
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
        <div className={classesName.UVLamp}>
          <div className={classesName.partName}>紫外线杀菌</div>
          <div className={classesName.partContent}>
            <div>当前状态</div>
            <div>手动开启</div>
            <div>每日开启时间</div>
            <div>每日关闭时间</div>
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
