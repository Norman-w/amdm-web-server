import React, {Component} from 'react';
import classesName from './settingManage.module.css'
import app from "../app";
import {WarehouseAc} from "./component/WarehouseAC";
import {message, Modal, Spin, Switch, Avatar, Tooltip, Tag, Button} from 'antd';

import NumberInputForm from "./dialog/NumberInputForm";
import TimeSelector from 'dragable-time-selector/build'
import LostAmdmConnect from "./component/LostAMDMConnect";
import CustomerSupport from "./dialog/CustomerSupport";
import {WhatsAppOutlined, QuestionCircleOutlined, EditOutlined} from '@ant-design/icons';
import UserMultiSelector from "./component/UserMultiSelector";

class SettingManage extends Component {
    state = {
        MaintenanceStatus: null,
        PeripheralsStatus: null,
        mouseIn: null,
        AMDMSetting: null,
        onLine: false,
    };
    refreshInterval = null;

    componentDidMount() {
        let that = this;
        this.loadAccounts((accounts) => {
            // console.log('已加载用户列表:', accounts)
            that.setState({allAccounts: accounts})
        });
        this.refreshPeripheralsStatus();
        this.loadAMDMSetting();
        this.refreshInterval = setInterval(() => {
                that.refreshPeripheralsStatus();
            },
            2000
        )
    }

    componentWillUnmount() {
        clearInterval(this.refreshInterval);
    }

    refreshPeripheralsStatus() {
        let api = 'status.get';
        let that = this;
        app.doPost2(
            {
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                headers:
                    {
                        'Content-Type': 'application/json;charset=utf-8;',
                    },
                apiName: api,
                params:
                    {
                        fields: '*',
                        forceRefresh: true,
                    },
                onFinish: (res) => {
                    // console.log('加载部件信息结果:',res);
                    that.setState({
                        PeripheralsStatus: res.PeripheralsStatus,
                        MaintenanceStatus: res.MaintenanceStatus,
                        onLine: true
                    })
                    // console.log('目标温度:',res.PeripheralsStatus.WarehousesACStatus[0]);
                }
                , onFail: (res) => {
                    console.log(res);
                    that.setState({onLine: false});
                }
            }
        )
    }

    loadAMDMSetting() {
        let api = 'setting.get';
        let that = this;
        app.doPost2(
            {
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                headers:
                    {
                        'Content-Type': 'application/json;charset=utf-8;',
                    },
                apiName: api,
                params:
                    {},
                onFinish: (res) => {
                    if (res && !res.IsError) {
                        that.setState({AMDMSetting: res.AMDMSetting, onLine: true})
                    }
                    // console.log('获取amdmsetting结果', res);
                },
                onFail: (res) => {
                    console.log(res)
                    that.setState({onLine: false})
                }
            }
        )
    }

    setACDestTemperature(stockIndex, destTemperature) {
        // console.log('设置前:', this.state.PeripheralsStatus.WarehousesACStatus);
        let api = 'peripheralsstatus.ac.set';
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
                        StockIndex: 0,
                        DestTemperature: destTemperature,
                    },
                finish: (res) => {
                    //{"IsError":false,"ErrMsg":null,"IsWorking":false,"CurrentTemprature":17.2,"DestTemperature":15}
                    if (res && !res.IsError) {
                        let old = {...that.state.PeripheralsStatus};
                        old.WarehousesACStatus[stockIndex].DestTemperature = destTemperature;
                        that.setState({PeripheralsStatus: old});
                        message.success('已重设温度为' + res.DestTemperature + '℃');
                        console.log('设置后:', that.state.PeripheralsStatus.WarehousesACStatus);
                    }
                }
            }
        )
    }

    setUVLampStatus(on, autoTurnOffDelayMM) {
        let api = 'peripheralsstatus.uvlamp.onoff';
        let that = this;
        if (this.state.requesting) {
        } else {
            this.setState({requesting: true}, () => {
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
                                On: on,
                                AutoTurnOffDelayMM:on?autoTurnOffDelayMM:null,
                            },
                        finish: (res) => {
                            if (res && !res.IsError) {
                                message.success('紫外线灯已' + (res.On ? '打开' : '关闭'));
                                //region 先在类中更新
                                let old = that.state;
                                old.PeripheralsStatus.UVLampIsWorking = res.On;
                                old.requesting=false;
                                that.setState(old);
                                //endregion
                            }
                            else
                            {
                                that.setState({requesting:false});
                            }
                        },
                        onFail: (t) => {
                            message.warn(t ? '设置紫外线灯状态超时' : '请检查网络连接');
                            that.setState({requesting: false});
                            that.abortController = new AbortController();
                        },
                    }
                )
                }
            )
        }
    }

    setUVLampOnOffTime(on, off) {
        console.log('执行设定函数:', on, off)
        let api = 'peripherals.uvlamp.onofftime.set';
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
                        UVLampOnTime: on,
                        UVLampOffTime: off,
                    },
                finish: (res) => {
                    if (res && !res.IsError) {
                        message.success('已重设紫外线杀菌时间');
                        that.loadAMDMSetting();
                    } else {
                        message.error('设定紫外线灯自动开关时间错误:' + res.ErrMsg);
                    }
                },
            }
        )
    }

    onClickACSettingBtn(warehouse) {
        let current = warehouse.DestTemperature.toFixed(1);
        let sf = new NumberInputForm();
        let that = this;
        sf.show('请输入目标温度', '当前设定温度为' + current,
            current, (val) => {
                that.setACDestTemperature(warehouse.WarehouseIndexId, val);
            }
            , true
        )
    }

    onClickTurnOnOffUVLamp() {
        if (!this.state.PeripheralsStatus.UVLampIsWorking) {
            let that = this;
            let md = Modal.confirm(
                {
                    centered: true,
                    title: '警告!打开紫外线前请确认周围空间无人员停留.否则可能造成紫外线伤害.',
                    onOk: () => {
                        //region 设定一个自动关闭的时间段
                        let sf = new NumberInputForm();
                        sf.show('请输入本次紫外线灯的工作时长(分钟)', '请输入分钟数',
                            30, (val) => {
                            if(val>60*24)
                            {
                                message.error('工作时间过长,可能造成紫外线伤害,请设置为24小时以内');
                                md.destroy();
                                return;
                            }
                            else if(val < 0)
                            {
                                message.error('无效的工作时长设置');
                                md.destroy();
                                return;
                            }
                                that.setUVLampStatus(true,val*60*1000);
                                md.destroy();
                            }
                            , false
                        )
                        //endregion

                    }
                }
            )
        } else {
            this.setUVLampStatus(false);
        }
    }

    onChangeUVLampOnOffTime(mode) {
        let clockDefaultValue = null;
        if (mode === 'on') {
            clockDefaultValue = this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime);
        } else if (mode === 'off') {
            clockDefaultValue = this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime);
        }
        let dest = null;
        let md = Modal.confirm(
            {
                title: null,
                centered: true,
                icon: null,
                content: <TimeSelector time={clockDefaultValue} onChange={
                    (val) => {
                        console.log('改变为val', val);
                        dest = val;
                    }
                }/>,
                onOk: () => {
                    let on = null;
                    let off = null;
                    if (mode === 'on') {
                        if (!dest) {
                            md.destroy();
                            return;
                        }
                        on = this.to24String(dest);
                        off = this.to24String(this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime));
                    } else if (mode === 'off') {
                        if (!dest) {
                            md.destroy();
                            return;
                        }
                        off = this.to24String(dest);
                        on = this.to24String(this.getHHmm(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime));
                    }
                    this.setUVLampOnOffTime(on, off);
                    md.destroy();
                }
            }
        );
    }

    onChangeMedicineOrderAutoHideWhenNoActionMS() {
        let current = this.state.AMDMSetting.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS / 1000;
        let sf = new NumberInputForm();
        let that = this;
        let api = "amdmsetting.update";
        sf.show('请输入时间,以秒为单位', '当前设定值为:' + current,
            current, (val) => {
                app.doPost2(
                    {
                        url: app.setting.clientSideAMDMControlPanelRouterUrl,
                        apiName: api,
                        headers:
                            {
                                'Content-Type': 'application/json;charset=utf-8;',
                                'apiName': api
                            },
                        params:
                            {
                                field: "UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS",
                                value: val * 1000,
                            },
                        onFinish: (res) => {
                            if (res && !res.IsError) {
                                console.log(res);
                                let old = that.state.AMDMSetting;
                                old.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS = res.NewValue;
                                that.setState({AMDMSetting: old});
                                message.success('已更新时间为' + res.NewValue / 1000 + '秒');
                            } else {
                                message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                            }
                        }
                    }
                )
            }
            , false
        )
    }

    onNoticeShowerAutoHideMS() {
        let current = this.state.AMDMSetting.UserInterfaceSetting.NoticeShowerAutoHideMS / 1000;
        let sf = new NumberInputForm();
        let that = this;
        let api = "amdmsetting.update";
        sf.show('请输入时间,以秒为单位', '当前设定值为:' + current,
            current, (val) => {
                app.doPost2(
                    {
                        url: app.setting.clientSideAMDMControlPanelRouterUrl,
                        apiName: api,
                        headers:
                            {
                                'Content-Type': 'application/json;charset=utf-8;',
                                'apiName': api
                            },
                        params:
                            {
                                field: "UserInterfaceSetting.NoticeShowerAutoHideMS",
                                value: val * 1000,
                            },
                        onFinish: (res) => {
                            if (res && !res.IsError) {
                                console.log(res);
                                let old = that.state.AMDMSetting;
                                old.UserInterfaceSetting.NoticeShowerAutoHideMS = res.NewValue;
                                that.setState({AMDMSetting: old});
                                message.success('已更新时间为' + res.NewValue / 1000 + '秒');
                            } else {
                                message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                            }
                        }
                    }
                )
            }
            , false
        )
    }

    onChangeEnableExpirationStrictControl(val) {
        let that = this;
        let api = "amdmsetting.update";
        app.doPost2(
            {
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                apiName: api,
                params:
                    {
                        field: "ExpirationStrictControlSetting.Enable",
                        value: val,
                    },
                onFinish: (res) => {
                    if (res && !res.IsError) {
                        console.log(res);
                        let old = that.state.AMDMSetting;
                        old.ExpirationStrictControlSetting.Enable = res.NewValue;
                        that.setState({AMDMSetting: old});
                        message.success('药品有效期严控模式已' + (res.NewValue ? "打开" : "关闭"));
                    } else {
                        message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                    }
                }
            }
        )
    }

    onChangeDefaultCanLoadMinExpirationDays() {
        let current = this.state.AMDMSetting.ExpirationStrictControlSetting.DefaultCanLoadMinExpirationDays;
        if (!current) {
            current = 10;
        }
        let sf = new NumberInputForm();
        let that = this;
        let api = "amdmsetting.update";
        sf.show('请输入默认可装入药机的药品有效期天数', '当前设定值为:' + current,
            current, (val) => {
                app.doPost2(
                    {
                        url: app.setting.clientSideAMDMControlPanelRouterUrl,
                        apiName: api,
                        params:
                            {
                                field: "ExpirationStrictControlSetting.DefaultCanLoadMinExpirationDays",
                                value: val,
                            },
                        onFinish: (res) => {
                            if (res && !res.IsError) {
                                console.log(res);
                                let old = that.state.AMDMSetting;
                                old.ExpirationStrictControlSetting.DefaultCanLoadMinExpirationDays = res.NewValue;
                                that.setState({AMDMSetting: old});
                                message.success('更新默认可装入药机的药品有效期天数为' + res.NewValue);
                            } else {
                                message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                            }
                        }
                    }
                )
            }
            , false
        )
    }

    onChangeDefaultSuggestLoadMinExpirationDays() {
        let current = this.state.AMDMSetting.ExpirationStrictControlSetting.DefaultSuggestLoadMinExpirationDays;
        if (!current) {
            current = 90;
        }
        let sf = new NumberInputForm();
        let that = this;
        let api = "amdmsetting.update";
        sf.show('请输入默认可装入药机的药品建议有效期天数', '当前设定值为:' + current,
            current, (val) => {
                app.doPost2(
                    {
                        url: app.setting.clientSideAMDMControlPanelRouterUrl,
                        apiName: api,
                        params:
                            {
                                field: "ExpirationStrictControlSetting.DefaultSuggestLoadMinExpirationDays",
                                value: val,
                            },
                        onFinish: (res) => {
                            if (res && !res.IsError) {
                                console.log(res);
                                let old = that.state.AMDMSetting;
                                old.ExpirationStrictControlSetting.DefaultSuggestLoadMinExpirationDays = res.NewValue;
                                that.setState({AMDMSetting: old});
                                message.success('更新可装入药机的药品建议有效期天数为' + res.NewValue);
                                console.log(res);
                            } else {
                                message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                            }
                        }
                    }
                )
            }
            , false
        )
    }

    onChangeDefaultDaysThresholdOfExpirationAlert() {
        let current = this.state.AMDMSetting.ExpirationStrictControlSetting.DefaultDaysThresholdOfExpirationAlert;
        if (!current) {
            current = 30;
        }
        let sf = new NumberInputForm();
        let that = this;
        let api = "amdmsetting.update";
        sf.show('请输入已装入药机的药品有效期小于多少天时提醒', '当前设定值为:' + current,
            current, (val) => {
                app.doPost2(
                    {
                        url: app.setting.clientSideAMDMControlPanelRouterUrl,
                        apiName: api,

                        params:
                            {
                                field: "ExpirationStrictControlSetting.DefaultDaysThresholdOfExpirationAlert",
                                value: val,
                            },
                        onFinish: (res) => {
                            if (res && !res.IsError) {
                                console.log(res);
                                let old = that.state.AMDMSetting;
                                old.ExpirationStrictControlSetting.DefaultDaysThresholdOfExpirationAlert = res.NewValue;
                                that.setState({AMDMSetting: old});
                                message.success('更新已装入药机的药品有效期提醒天数为' + res.NewValue);
                            } else {
                                message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                            }
                        }
                    }
                )
            }
            , false
        )
    }


    getHHmm(time) {
        if (!time) {
            return null;
        }
        let t = new Date(time);
        let h = t.getHours();
        let m = t.getMinutes();
        let r = 0;
        if (h > 12) {
            r = 1;
            h -= 12;
        }
        return {hour: h, minute: m, round: r};
        // let ret = (t.getHours()).toString().padStart(2,'0') + ":"+ t.getMinutes().toString().padEnd(2,'0');
        // return ret;
    }

    getHHmmString(str) {
        let time = this.getHHmm(str);
        let h = time.hour.toString().padStart(2, '0');
        let m = time.minute.toString().padStart(2, "0");
        let round = time.round > 0 ? "下午" : "上午";
        return h + ":" + m + " " + round;
    }

    to24String(time) {
        console.log('to24string', time)
        let hh = time.hour;
        let mm = time.minute;
        if (time.round > 0) {
            hh += 12;
        }
        return "" + hh.toString().padStart(2, '0') + ":" + mm.toString().padStart(2, '0')
    }

    onClickCustomerSupport() {
        Modal.info(
            {
                icon: null,
                content: <CustomerSupport/>,
                centered: true,
                width: 500,
            }
        )
    }

    clearError() {
        let that = this;
        let api = "status.clearerror"
        app.doPost2(
            {
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                apiName: api,
                params:
                    {},
                onFinish: (res) => {
                    if (res && !res.IsError) {
                        that.setState({MaintenanceStatus: 0});
                        message.success('已重置付药机为正常状态');
                    } else {
                        message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                    }
                }
            }
        )
    }

    onChangeDisableAMDMWhenDeliveryFailed(val) {
        let that = this;
        let api = "amdmsetting.update"
        app.doPost2(
            {
                url: app.setting.clientSideAMDMControlPanelRouterUrl,
                apiName: api,
                params:
                    {
                        field: "TroubleshootingPlanSetting.DisableAMDMWhenDeliveryFailed",
                        value: val,
                    },
                onFinish: (res) => {
                    if (res && !res.IsError) {
                        // console.log(res);
                        let old = that.state.AMDMSetting;
                        old.TroubleshootingPlanSetting.DisableAMDMWhenDeliveryFailed = res.NewValue;
                        that.setState({AMDMSetting: old});
                        message.success(res.NewValue ? "已设置为:当药机发生取药故障时将会停用药机" : "已设置为:当药机发生取药故障时,不会影响其他用户取药");
                    } else {
                        message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                    }
                }
            }
        )
    }

    loadAccounts(callback) {
        if (this.state.requesting) {
        } else {
            this.setState({requesting: true},
                () => {
                    let that = this;
                    app.doPost2(
                        {
                            url: app.setting.serverSideApiRouterUrl,
                            apiName: 'accounts.get',
                            params:
                                {},
                            onFinish: (res) => {
                                if (res.IsError) {
                                    message.warn(res.ErrMsg);
                                    that.setState({requesting: false});
                                } else {
                                    that.setState({requesting: false});
                                    callback(res.Accounts);
                                }
                            },
                            onFail: (t) => {
                                message.warn(t ? '加载用户列表超时' : '请检查网络连接');
                                that.setState({requesting: false});
                                that.abortController = new AbortController();
                            },
                        }
                    )
                }
            )
        }
    }

    findAccount(all, id) {
        if (!all || !id) {
            return null;
        }
        for (const a of all) {
            if (a.Id === id) {
                return a;
            }
        }
        return null;
    }

    onClickSetErrorAlertReceiveUsersBtn() {
        console.log('调用更新故障处置方案联系人函数');
        this.updateSMSReceiver("故障处置方案", "TroubleshootingPlanSetting", "AlertReceiveUsers");
    }

    onCLickSetMedicineAlertReceiveUsersBtn() {
        this.updateSMSReceiver("药品预警设置", "MedicineAlertSetting", "LowInventoryAndExpirationAlertReceiveUsers");
    }

    //故障处置方案, TroubleshootingPlanSetting, AlertReceiveUsers,
    updateSMSReceiver(serviceName, baseSettingName, filedName,) {
        if (!this.state.AMDMSetting || !this.state.AMDMSetting[baseSettingName]) {
            message.error('未能加载' + serviceName);
            return;
        }
        let that = this;
        this.loadAccounts((accounts) => {
                that.setState({allAccounts: accounts});
                let md = Modal.info(
                    {
                        width: 600,
                        title: '请选择将要接收消息的用户(可多选)',
                        content: <UserMultiSelector onSubmit={(ids) => {
                            // console.log('选择的用户:', users);
                            //region 执行网络请求
                            app.doPost2(
                                {
                                    url: app.setting.clientSideAMDMControlPanelRouterUrl,
                                    apiName: "amdmsetting.update",
                                    params:
                                        {
                                            field: baseSettingName + '.' + filedName,
                                            value: JSON.stringify(ids),
                                        },
                                    onFinish: (res) => {
                                        if (res && !res.IsError) {
                                            md.destroy();
                                            let old = that.state.AMDMSetting;
                                            old[baseSettingName][filedName] = JSON.parse(res.NewValue);
                                            that.setState({AMDMSetting: old});
                                            message.success("设置完成");
                                        } else {
                                            message.error('操作错误:' + (res && res.ErrMsg ? res.ErrMsg : '未知错误'));
                                        }
                                    }
                                }
                            )
                            //endregion
                        }}
                                                    onCancel={() => {
                                                        md.destroy()
                                                    }}
                                                    allUsers={accounts}
                                                    selectedUserIds={that.state.AMDMSetting[baseSettingName][filedName]}/>,
                        okButtonProps: {hidden: true},
                        cancelButtonProps: {hidden: true},
                    }
                )
            }
        )
    }


    render() {
        //region 加载中和断开连接时直接返回加载中的页面进行渲染
        if (!this.state.PeripheralsStatus || !this.state.AMDMSetting) {
            return <div className={classesName.center}><Spin/>加载中...</div>
        }
        if (!this.state.onLine) {
            return <div className={classesName.center}><LostAmdmConnect/></div>
        }
        //endregion
        const status = this.state.PeripheralsStatus;
        const acs = (status && status.WarehousesACStatus) ? status.WarehousesACStatus : [];
        if (acs.length < 1) {
            console.log('未能加载到空调设置:', this.state.PeripheralsStatus);
        }
        //region 紫外线灯的设置
        let UVStartTime = null;
        let UVEndTime = null;
        if (this.state.AMDMSetting.DevicesSetting.UVLampSetting) {
            UVStartTime = this.getHHmmString(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOnTime);
            UVEndTime = this.getHHmmString(this.state.AMDMSetting.DevicesSetting.UVLampSetting.UVLampOffTime);
        }
        //endregion
        //region 用户交互设置
        let autoReturnTimeMS = 60000;
        if (this.state.AMDMSetting.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS) {
            autoReturnTimeMS = this.state.AMDMSetting.UserInterfaceSetting.MedicineOrderAutoHideWhenNoActionMS;
        }
        let noticeShowerAutoHideMS = 5000;
        if (this.state.AMDMSetting.UserInterfaceSetting.NoticeShowerAutoHideMS) {
            noticeShowerAutoHideMS = this.state.AMDMSetting.UserInterfaceSetting.NoticeShowerAutoHideMS;
        }
        //endregion
        //region 严控药品有效期
        let mixValidExpiration = 10;
        let suggestValidExpiration = 90;
        let alarmExpiration = 30;
        let enableExpirationStrictControl = false;
        if (this.state.AMDMSetting.ExpirationStrictControlSetting) {
            mixValidExpiration = this.state.AMDMSetting.ExpirationStrictControlSetting.DefaultCanLoadMinExpirationDays;
            suggestValidExpiration = this.state.AMDMSetting.ExpirationStrictControlSetting.DefaultSuggestLoadMinExpirationDays;
            alarmExpiration = this.state.AMDMSetting.ExpirationStrictControlSetting.DefaultDaysThresholdOfExpirationAlert;
            enableExpirationStrictControl = this.state.AMDMSetting.ExpirationStrictControlSetting.Enable;
        }
        //endregion
        //region 故障处置方案
        let hasError = ([0,4,5].indexOf(this.state.MaintenanceStatus)<0);
        let maintenanceStatusString = "";
        //region 状态码转换为显示文字
        switch (this.state.MaintenanceStatus) {
            case 0:
                maintenanceStatusString = "运行正常";
                break;
            case 1:
                maintenanceStatusString = "硬件故障";
                break;
            case 2:
                maintenanceStatusString = "软件故障";
                break;
            case 3:
                maintenanceStatusString = "系统维护中";
                break;
            case 4:
                maintenanceStatusString = "紫外线杀菌中";
                break;
            case 5:
                maintenanceStatusString = "紫外线杀菌准备中";
                break;
        }
        //endregion
        let troubleShootingPlanSetting = this.state.AMDMSetting.TroubleshootingPlanSetting;
        let medicineAlertSetting = this.state.AMDMSetting.MedicineAlertSetting;
        //endregion
        //region 药品预警消息接收人的获取
        let troubleShootingAlertReceiverUsers = (troubleShootingPlanSetting && troubleShootingPlanSetting.AlertReceiveUsers) ? troubleShootingPlanSetting.AlertReceiveUsers : [];
        let medicineAlertReceiverUsers = (medicineAlertSetting && medicineAlertSetting.LowInventoryAndExpirationAlertReceiveUsers) ? medicineAlertSetting.LowInventoryAndExpirationAlertReceiveUsers : [];
        //endregion
        return (
            <div className={classesName.main}>
                <div className={classesName.title}>
                    设置
                </div>
                <div className={classesName.AC}>
                    <div className={classesName.partName}>空调</div>
                    <div className={classesName.partContent}>
                        {acs.map((item, index) => {
                            return <WarehouseAc key={index} warehouse={item} onClickSettingBtn={() => {
                                this.onClickACSettingBtn(item)
                            }}/>
                        })}
                    </div>
                </div>
                <div className={classesName.UVLamp} onMouseEnter={() => this.setState({mouseIn: 'uv'})}
                     onMouseLeave={() => this.setState({mouseIn: null})}
                >
                    <div className={classesName.partName}>紫外线杀菌</div>
                    <div className={classesName.partContent}>
                        <div className={classesName.flexRow}>每日开启时间
                            <div className={classesName.lightWord}>{UVStartTime}</div>
                            <div
                                className={this.state.mouseIn === 'uv' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onChangeUVLampOnOffTime('on')
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                        <div className={classesName.flexRow}>每日关闭时间
                            <div className={classesName.lightWord}>{UVEndTime}</div>
                            <div
                                className={this.state.mouseIn === 'uv' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onChangeUVLampOnOffTime('off')
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                        <div>当前状态<Switch checked={status ? status.UVLampIsWorking : false} checkedChildren="开启"
                                         unCheckedChildren="关闭"
                                         onChange={() => {
                                             this.onClickTurnOnOffUVLamp()
                                         }}
                        /></div>
                    </div>

                </div>
                <div className={classesName.interactiveSetting}
                     onMouseEnter={() => this.setState({mouseIn: 'interactive'})}
                     onMouseLeave={() => this.setState({mouseIn: null})}
                >
                    <div className={classesName.partName}>用户交互</div>
                    <div className={classesName.partContent}>
                        <div className={classesName.flexRow}>在扫描处方二维码后如
                            <div className={classesName.lightWord}>{autoReturnTimeMS / 1000}</div>
                            秒未进行操作将返回
                            <div
                                className={this.state.mouseIn === 'interactive' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onChangeMedicineOrderAutoHideWhenNoActionMS();
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                        <div className={classesName.flexRow}>文本及语音提示的全屏消息框,在语音播放完毕后
                            <div className={classesName.lightWord}>{noticeShowerAutoHideMS / 1000}</div>
                            秒延迟关闭
                            <div
                                className={this.state.mouseIn === 'interactive' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onNoticeShowerAutoHideMS()
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={classesName.expiration}
                     onMouseEnter={() => this.setState({mouseIn: 'expiration'})}
                     onMouseLeave={() => this.setState({mouseIn: null})}
                >
                    <div className={classesName.partName}>药品有效期控制</div>

                    <div className={classesName.partContent}>
                        <Switch checked={enableExpirationStrictControl} checkedChildren="开启" unCheckedChildren="关闭"
                                onChange={(val) => {
                                    let that = this;
                                    if (val === false) {
                                        let md = Modal.confirm(
                                            {
                                                title: '关闭药品有效期严控模式后\r\n将使用先进先出原则进出库,请确认!',
                                                centered: true,
                                                onOk: () => {
                                                    that.onChangeEnableExpirationStrictControl(val);
                                                    md.destroy();
                                                }
                                                , onCancel: () => {
                                                    md.destroy();
                                                }
                                            }
                                        )
                                    } else {
                                        that.onChangeEnableExpirationStrictControl(val);
                                    }
                                }}/>
                        <div className={classesName.flexRow}>默认可装入药机的药品,有效期至少
                            <div className={classesName.lightWord}>{mixValidExpiration}</div>
                            天
                            <div
                                className={this.state.mouseIn === 'expiration' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onChangeDefaultCanLoadMinExpirationDays();
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                        <div className={classesName.flexRow}>默认建议有效期大于
                            <div className={classesName.lightWord}>{suggestValidExpiration}</div>
                            天
                            <div
                                className={this.state.mouseIn === 'expiration' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onChangeDefaultSuggestLoadMinExpirationDays();
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                        <div className={classesName.flexRow}>默认当有效期小于
                            <div className={classesName.lightWord}>{alarmExpiration}</div>
                            天时提醒
                            <div
                                className={this.state.mouseIn === 'expiration' ? classesName.settingBtn : classesName.settingBtnHide}
                                onClick={() => {
                                    this.onChangeDefaultDaysThresholdOfExpirationAlert();
                                }}
                            >
                                <div className="iconfont icon-shezhi" style={{fontSize: 20}}/>
                            </div>
                        </div>
                        <Tooltip title={'每个药品的有效期控制策略可单独在药品管理中设置'}>
                            <QuestionCircleOutlined/>
                        </Tooltip>
                    </div>
                </div>
                <div id={'故障处理方法设置区域'} className={classesName.errorProcessMethod}
                     onMouseEnter={() => this.setState({mouseIn: 'error'})}
                     onMouseLeave={() => this.setState({mouseIn: null})}
                >
                    <div className={classesName.partName}>故障处置方案</div>
                    <div className={classesName.partContent}>
                        <div className={classesName.flexRow}>
                            <Tag color={hasError ? "volcano" : "success"}>{maintenanceStatusString}</Tag>
                            <Button hidden={!hasError} size={'small'} type={'primary'}
                                    onClick={this.clearError.bind(this)}
                            >复位</Button>
                        </div>
                        <div className={classesName.flexRow}>

                            故障信息接收人:
                            <Avatar.Group
                                id={'接收故障信息的人员列表'}
                                maxCount={5}
                                maxPopoverTrigger="click"
                                maxStyle={{color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer'}}
                            >
                                {
                                    troubleShootingAlertReceiverUsers.map(id => {
                                        let acc = this.findAccount(this.state.allAccounts, id);
                                        if (acc) {
                                            let name = acc.Name ? acc.Name : "*未设置*";
                                            let mobile = acc.Mobile ? acc.Mobile : "*未设置*";
                                            // console.log('find user ', id, this.state.allAccounts, acc);
                                            if (acc) {
                                                return <Tooltip key={id} title={'姓名:' + name + " 手机:" + mobile}
                                                                placement="top">
                                                    <Avatar style={{
                                                        backgroundColor: '#87d068',
                                                        userSelect: 'none'
                                                    }}>{name[name.length - 1]}</Avatar>
                                                </Tooltip>
                                            }
                                        }
                                    })
                                }

                                {/*<Avatar style={{backgroundColor: '#1890ff'}} icon={<AntDesignOutlined/>}/>*/}
                            </Avatar.Group>
                            <Tooltip title={'点击以设定'}>
                                <div
                                    className={this.state.mouseIn === 'error' ? classesName.settingBtn : classesName.settingBtnHide}
                                    onClick={() => this.onClickSetErrorAlertReceiveUsersBtn()}
                                >
                                    {/*<div className={classesName.addUserBtn}>*/}
                                    {/*  <div className={classesName.heng}/>*/}
                                    {/*  <div className={classesName.shu}/>*/}
                                    {/*</div>*/}
                                    <EditOutlined style={{fontSize: 25}}/>
                                </div>
                            </Tooltip>
                        </div>
                        <div className={classesName.flexRow}>
                            若发生卡药故障时停用
                            <Switch checked={troubleShootingPlanSetting.DisableAMDMWhenDeliveryFailed}
                                    checkedChildren="是" unCheckedChildren="否"
                                    onChange={(val) => {
                                        this.onChangeDisableAMDMWhenDeliveryFailed(val);
                                    }}/>
                        </div>
                        <Tooltip title="联系客服" placement="top">
                            <div onClick={() => {
                                this.onClickCustomerSupport()
                            }}>
                                <WhatsAppOutlined
                                    style={{fontSize: '16px', color: '#08c', userSelect: 'none', cursor: 'pointer'}}/>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div className={classesName.medicineWarning}
                     onMouseEnter={() => this.setState({mouseIn: 'medicineWarning'})}
                     onMouseLeave={() => this.setState({mouseIn: null})}
                >
                    <div className={classesName.partName}>药品预警</div>
                    <div className={classesName.partContent}>
                        <div className={classesName.flexRow}>
                            药品库存预警及药品有效期预警消息接收人:
                            <Avatar.Group
                                id={'接收故障信息的人员列表'}
                                maxCount={2}
                                maxPopoverTrigger="click"

                                maxStyle={{color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer'}}
                            >
                                {
                                    medicineAlertReceiverUsers.map(id => {
                                        let acc = this.findAccount(this.state.allAccounts, id);
                                        if (acc) {
                                            let name = acc.Name ? acc.Name : "*未设置*";
                                            let mobile = acc.Mobile ? acc.Mobile : "*未设置*";
                                            // console.log('find user ', id, this.state.allAccounts, acc);
                                            if (acc) {
                                                return <Tooltip key={id} title={'姓名:' + name + " 手机:" + mobile}
                                                                placement="top">
                                                    <Avatar style={{
                                                        backgroundColor: '#87d068',
                                                        userSelect: 'none'
                                                    }}>{name[name.length - 1]}</Avatar>
                                                </Tooltip>
                                            }
                                        }
                                    })
                                }
                            </Avatar.Group>
                            <Tooltip title={'点击以设定'}>
                                <div
                                    className={this.state.mouseIn === 'medicineWarning' ? classesName.settingBtn : classesName.settingBtnHide}
                                    onClick={() => this.onCLickSetMedicineAlertReceiveUsersBtn()}
                                >
                                    {/*<div className={classesName.addUserBtn}>*/}
                                    {/*    <div className={classesName.heng}/>*/}
                                    {/*    <div className={classesName.shu}/>*/}
                                    {/*</div>*/}
                                    <EditOutlined style={{fontSize: 25}}/>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default SettingManage;
