import React, {Component} from 'react';
import classNames from './status.module.css'
// import Page from "./test/AntdChart";
import '../iconfont.css';
import {WarehouseAc} from "./component/WarehouseAC";
import app from "../app";
import LostAmdmConnect from "./component/LostAMDMConnect";

class Status extends Component {
    state = {
        IsWorking: false,
        StatusName: '正在获取交互状态...',
        OnLine: false,
        PeripheralsStatus:null, MaintenanceStatus:null,TodayPrescriptionCount:0,TodayMedicineCount:0
    }
    interval;

    refreshPeripheralsStatus()
    {
        let api = 'status.get';
        let that = this;
        app.doPost(
            {
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                headers:
                    {
                        'Content-Type': 'application/json;charset=utf-8;',
                        'apiName': api
                    },
                params:
                    {
                        fields: '*'
                    },
                finish: (res) => {
                    that.setState({
                        PeripheralsStatus: res.PeripheralsStatus,
                        MaintenanceStatus: res.MaintenanceStatus,
                        TodayPrescriptionCount:res.TodayPrescriptionCount,
                        TodayMedicineCount:res.TodayMedicineCount
                    })
                }
            }
        )
    }
    componentDidMount() {
        let that = this;
        //region 执行一个获取付药机8080接口传输的数据
        this.refreshPeripheralsStatus();

        let getStatusFunc = () => {
            app.doPost2({
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                headers:
                    {
                        'Content-Type': 'application/json;charset=utf-8;',
                    },
                apiName: 'workingstatus.get',
                params:
                    {
                    },
                onFinish: (res) => {
                    console.log('获取状态完成', res);
                    that.setState({IsWorking: res.IsWorking, StatusName: res.StatusName,OnLine:true});
                    that.refreshPeripheralsStatus();
                },
                onFail: (res) => {
                    console.log(res)
                    that.setState({OnLine: false})
                }
            })
        };
        getStatusFunc();
        //region 定时获取取药状态
        this.interval = setInterval(getStatusFunc,
            1000)
        //endregion
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    render() {
        let status = this.state.PeripheralsStatus;
        let acs = status && status.WarehousesACStatus ? status.WarehousesACStatus : [];
        let statusName = this.state.StatusName;
        let onLine = this.state.OnLine;
        return (
            <>
                <LostAmdmConnect onLine={onLine}/>
                <div hidden={!onLine} className={classNames.main}>
                    <div className={classNames.line1}>

                        <div className={classNames.status}>
                            <div className="iconfont status-icon icon-zuobiaoxuanqu" style={{fontSize: 30}}>
                            </div>
                            交互状态:{statusName}</div>
                    </div>
                    <div className={classNames.warehousesStatusLine}>
                        {acs.map((item, index) => {
                            return <WarehouseAc key={index} warehouse={item}/>
                        })}
                    </div>
                    <div className={classNames.countLine}>
                        <div className={classNames.countArea}>
                            <div className={classNames.todayTotal}>{this.state.TodayPrescriptionCount}</div>
                            <div className={classNames.infoGray}>今日处方数量</div>
                        </div>
                        <div className={classNames.countArea}>
                            <div className={classNames.todayTotal}>{this.state.TodayMedicineCount}</div>
                            <div className={classNames.infoGray}>今日已取药数量</div>
                        </div>
                    </div>
                    {/*<Page></Page>*/}
                </div>
                </>
        );
    }
}

export default Status;
