import * as React from 'react';
import classNames from './WarehouseAC.module.css';
import '../../iconfont.css';
import {useState} from "react";

export const WarehouseAc = (props) => {
  let [editMode,setEditMode] = useState(false);
    if (!props.warehouse)
    {
        return '药仓空调状态信息无效';
    }
    let curr = props.warehouse.CurrentTemprature.toFixed(1);
    let dest = props.warehouse.DestTemperature.toFixed(1);
    return (
        <div className={classNames.main} onMouseEnter={()=>{setEditMode(true)}}
             onMouseLeave={()=>{setEditMode(false)}}
        >
            <div className={classNames.indexText}>药仓{props.warehouse.WarehouseIndexId+1}</div>
            <div className={classNames.status}><div className="iconfont icon-wenduji" style={{fontSize: 30}}>
            </div>
                <div className={classNames.statusText}>
                当前温度:{curr}℃</div>
            </div>
            <div className={classNames.status}><div className="iconfont icon-wendushezhi2-05-05" style={{fontSize: 30}}>
            </div>
                <div className={classNames.statusText}>
                    设定温度:{dest}℃
                </div>
            </div>
          <div hidden={!props||!props.onClickSettingBtn} className={editMode?classNames.setting:classNames.settingOff}
               onClick={()=>{
                 if (props&&props.onClickSettingBtn)
                 {
                   props.onClickSettingBtn();
                 }
               }}
          >
            <div className="iconfont icon-shezhi" style={{fontSize: 30}}>
          </div>
            <div className={classNames.clickText}>
              设置
            </div>
          </div>

            {/*<div className={classNames.status}><div className="iconfont icon-kongtiao" style={{fontSize: 30}}>*/}
            {/*</div>*/}
            {/*    <div className={classNames.statusText}>*/}
            {/*    空调状态:{props.warehouse.IsACWorking?*/}
            {/*        <div className={classNames.acWorkingText}>工作中</div>*/}
            {/*        :*/}
            {/*        <div className={classNames.acNotWorkingText}>空闲中</div>*/}
            {/*    }*/}
            {/*    </div>*/}
            {/*    </div>*/}
        </div>
    );
};
