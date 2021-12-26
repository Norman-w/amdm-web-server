// @flow
import * as React from 'react';
import classNames from './WarehouseAC.module.css';
import '../../iconfont.css';

type Props = {

};
export const WarehouseAc = (props: Props) => {
    if (!props.warehouse)
    {
        return '药仓空调状态信息无效';
    }
    let curr = props.warehouse.CurrentTemprature.toFixed(2);
    let dest = props.warehouse.DestTemperature.toFixed(2);
    return (
        <div className={classNames.main}>
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

            <div className={classNames.status}><div className="iconfont icon-kongtiao" style={{fontSize: 30}}>
            </div>
                <div className={classNames.statusText}>
                空调状态:{props.warehouse.IsACWorking?
                    <div className={classNames.acWorkingText}>工作中</div>
                    :
                    <div className={classNames.acNotWorkingText}>空闲中</div>
                }
                </div>
                </div>
        </div>
    );
};