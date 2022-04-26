import React, {Component} from 'react';
import {Modal, DatePicker, message, Table, Tag, Input} from 'antd';
// import classNames from './instockRecord.module.css'
import app from "../app";
import classNames from './fulfillRecord.module.css'
import DeliveryRecordInfo from "./dialog/DeliveryRecordInfo";
import {Utils} from "./utils";
// import {disableButtons} from "sweetalert2";

// const {Search} = Input;
const defaultPageSize = 10;
const {RangePicker} = DatePicker;
const {Search} = Input;


class FulfillRecord extends Component {
    state = {
        data: [],
        searchingStartTime: '',
        searchingEndTime: '',
        //用于搜索的处方编号
        searchingPrescriptionId: '',
        //用于搜索的患者名称
        searchingPatientName: '',
        loading: false,
        pagination: {
            position: ['topRight', 'bottomRight'],
            current: 1,
            pageSize: defaultPageSize,
        },
    }
    columns = [
        {
            title: '流水号',
            dataIndex: 'Id',
            key: 'Id',
            render: t => <div style={{color: 'gray'}}>{t}</div>
        },
        {
            title: '处方号',
            dataIndex: 'PrescriptionId',
            key: 'PrescriptionId',
            render: t => <div style={{color: 'darkgreen'}}>{t}</div>
        }, {
            title: '患者姓名',
            dataIndex: 'PatientName',
            key: 'PatientName',
        },
        {
            title: '总数',
            dataIndex: 'TotalMedicineCount',
            key: 'TotalMedicineCount',
            render: (count) => {
                let color = count ? 'geekblue' : 'lightgray';
                return <Tag color={color}>
                    {count ? count + '个' : '无药品'}
                </Tag>
            }
        },
        {
            title: '开始时间',
            key: 'StartTime',
            dataIndex: 'StartTime',
        },
        {
            title: '停止时间',
            key: 'EndTime',
            dataIndex: 'EndTime',
        },
        {
            title: '状态',
            key: 'Status',
            render: (a) => {
                // console.log(a)
                return <div>
                    <Tag color={a.Finished ? 'green' : 'gray'}>{a.Finished ? '已完成' : '未完成'}</Tag>
                    {a.Canceled && <Tag color={'volcano'}
                    >已取消</Tag>}
                    {!a.Canceled&&<Tag color={'error'} style={{userSelect: 'none', cursor: 'pointer'}} onClick={() => {
                    this.onClickDeleteFulfillRecord(a)
                }}>删除</Tag>}
                </div>
            }
        },
        // {
        //   title: '操作',
        //   key: 'action',
        //   width: 100,
        //   render:(a,b)=>{
        //     // console.log('渲染收操作是:', a,b);
        //     return <Button type={'ghost'} onClick={()=>this.onViewDetail(b)}>查看明细</Button>
        //   }
        // }
    ];


    abortController = new AbortController();

    componentDidMount() {
        this.onSearchDeliveryRecord(this.state.pagination);
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    onClickDeleteFulfillRecord(record) {
        let that = this;
        let md = Modal.confirm({
            centered:true,
            title:'这将删除这条取药记录',
            content:<div>该功能仅限维护人员使用且操作不可逆,确认继续吗?</div>,
            onCancel:()=>{md.destroy()},
            onOk:()=>{
                app.doPost2(
                    {
                        url: app.setting.clientSideApiRouterUrl,
                        apiName: "deliveryrecord.delete",
                        params: {Id:record.Id},
                        abortController: this.abortController,
                        onFinish: (res) => {
                            if(!res.ErrMsg)
                            {
                                message.success('删除药品交付记录完成');
                                that.onSearchDeliveryRecord(that.state.pagination);
                            }
                            else
                            {
                                message.error('删除药品交付记录失败:'+res.ErrMsg);
                            }
                        },
                        timeoutMS: 10000,
                        onFail: (t) => {
                            message.warn(t ? '获取取药记录超时' : '获取取药记录发生错误,请重试');
                            that.setState({loading: false})
                        }
                    }
                )
            }
        })
    }

    onSearchDeliveryRecord(pagination
                           // ,filters,sorter
    ) {
        if (this.state.loading) {
        } else {
            this.setState({loading: true},
                () => {
                    //region 设置完了正在获取中 才开始正式执行
                    let pageNum = 0;
                    if (pagination && pagination.current > 0) {
                        pageNum = pagination.current - 1;
                    }
                    let pageSize = defaultPageSize;
                    if (pagination && pagination.pageSize > 0) {
                        pageSize = pagination.pageSize;
                    }
                    let that = this;
                    let api = 'deliveryrecords.get';
                    let searchParam = {
                        fields: '*',
                        pageNum: pageNum,
                        prescriptionId: this.state.searchingPrescriptionId,
                        patientName: this.state.searchingPatientName,
                        // pageNum:1,
                        getTotalRecordCount: true,
                        pageSize: pageSize
                    };
                    if (this.state.searchingEndTime && this.state.searchingStartTime) {
                        searchParam.startCreate = this.state.searchingStartTime;
                        searchParam.endCreate = this.state.searchingEndTime;
                    }
                    console.log('搜索参数:', searchParam)
                    app.doPost2(
                        {
                            url: app.setting.clientSideApiRouterUrl,
                            apiName: api,
                            params: searchParam,
                            abortController: this.abortController,
                            onFinish: (res) => {
                                let newState = {loading: false};
                                if (res.DeliveryRecords) {
                                    console.log('搜索取药记录结果列表:', res);
                                    if (res && res.DeliveryRecords && res.DeliveryRecords.length > 0) {
                                        for (let i = 0; i < res.DeliveryRecords.length; i++) {
                                            res.DeliveryRecords[i].key = '' + res.DeliveryRecords[i].Id;
                                        }
                                    }
                                    console.log('添加了key的取药记录结果列表:', res);
                                    newState.data = res.DeliveryRecords;
                                    newState.pagination = {...pagination};
                                    if (pageNum === 0) {
                                        newState.pagination.total = res.TotalRecordCount;
                                    }
                                } else {
                                    message.error('没有搜索到取药记录' + res.ErrMsg);
                                    console.log(res);
                                }
                                that.setState(newState);
                            },
                            timeoutMS: 10000,
                            onFail: (t) => {
                                message.warn(t ? '获取取药记录超时' : '获取取药记录发生错误,请重试');
                                that.setState({loading: false})
                            }
                        }
                    )
                    //endregion
                });
        }
    }

    onChangeTimeRange(dates, dateStrings) {
        console.log('时间有修改了:', dates, dateStrings);

        if (dates) {
            //选择了时间
            this.setState({searchingStartTime: dateStrings[0], searchingEndTime: dateStrings[1]}
                , () => {
                    this.onSearchDeliveryRecord(this.state.pagination);
                });
        }
        {
            //清空了时间
            this.setState({searchingStartTime: '', searchingEndTime: ''}, () => {
                this.onSearchDeliveryRecord(this.state.pagination);
            });
        }
    }


    onViewDetail(record) {

    }

    render() {
        let onSearchDeliveryRecord = this.onSearchDeliveryRecord.bind(this);
        let onChangeTimeRange = this.onChangeTimeRange.bind(this);
        let data = this.state.data;
        let loading = this.state.loading;
        return (
            <div className={classNames.main}>
                <div className={classNames.titleLine}>
                    取药记录
                </div>
                <div className={classNames.toolsLine}>
                    <div className={classNames.searchArea}>
                        <div className={classNames.nameArea}>
                            <div className={classNames.nameLabel}>处方编号:</div>
                            <Search
                                placeholder="请输入处方编号"
                                enterButton
                                value={this.state.searchingPrescriptionId}
                                onSearch={onSearchDeliveryRecord}
                                onChange={(v) => {
                                    this.setState({searchingPrescriptionId: v.target.value})
                                }}
                            />
                        </div>
                        <div className={classNames.nameArea}>
                            <div className={classNames.nameLabel}>患者姓名:</div>
                            <Search
                                placeholder="请输入患者姓名"
                                enterButton
                                value={this.state.searchingPatientName}
                                onSearch={onSearchDeliveryRecord}
                                onChange={(v) => {
                                    this.setState({searchingPatientName: v.target.value})
                                }}
                            />
                        </div>
                        <div className={classNames.noteArea}>在指定时间段内搜索:</div>
                        <div className={classNames.timeSpanArea}>
                            <RangePicker showTime
                                         onChange={onChangeTimeRange}
                            />
                        </div>
                        <div className={classNames.searchBtnArea}>
                            {/*<Button type={"primary"}>搜索</Button>*/}
                        </div>
                    </div>
                </div>
                <div className={classNames.tableLine}>
                    <Table
                        columns={this.columns}
                        dataSource={data}
                        className={classNames.table}
                        loading={loading}
                        onChange={onSearchDeliveryRecord}
                        pagination={this.state.pagination}
                        expandable={{
                            // expandedRowRender: record => <p style={{ margin: 20 }}>{record.Details.length}</p>,
                            expandedRowRender: record => {
                                for (let i = 0; i < record.Details.length; i++) {
                                    let detail = record.Details[i];
                                    record.Details[i].gridPosition = Utils.GetGridLocationString(detail.StockIndex, detail.FloorIndex, detail.GridIndex)
                                    record.Details[i].key = '' + record.Details[i].Id;
                                }
                                // console.log('要展示在Table中的内容:',record.Details)
                                return <DeliveryRecordInfo record={record}/>
                            },
                            defaultExpandAllRows: true,
                            expandRowByClick: true,
                            // rowExpandable: record => record.name !== 'Not Expandable',
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default FulfillRecord;
