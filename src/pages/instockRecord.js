import React, {Component} from 'react';
import {DatePicker ,Tag, Input, Button, message, Radio, Table, Modal} from 'antd';
import classNames from './instockRecord.module.css'
import app from "../app";
import MedicineInfo from "./dialog/MedicineInfo";

// import moment from 'moment';
// import 'moment/locale/zh-cn';
// import locale from 'antd/lib/locale/zh_CN';
// 这个不行 这个时间选择控件里面的时间还是英文的
// import zhCN from 'antd/es/locale/zh_CN';
// import { ConfigProvider } from 'antd';

const {Search} = Input;
const defaultPageSize = 10;
const { RangePicker } = DatePicker;



class InstockRecord extends Component {
  state={
    data:[],
    searchingStartTime:'',
    searchingEndTime:'',
    loading:false,
    pagination: {
      current: 1,
      pageSize: defaultPageSize,
    },
  }
  columns = [
    {
      title: '编号',
      dataIndex: 'Id',
      key: 'Id',
      render:t=><div style={{color:'gray'}}>{t}</div>
    },
    // {
    //   title: '护士',
    //   dataIndex: 'NurseId',
    //   key: 'NurseId',
    // },
    {
      title: '总数',
      dataIndex: 'TotalMedicineCount',
      key: 'TotalMedicineCount',
      render:(count)=>
      {
        let color = count? 'geekblue':'lightgray';
        return <Tag color={color}>
          {count?count+'个':'无药品'}
        </Tag>
      }
    },
    {
      title: '类型',
      dataIndex: 'Type',
      key: 'Type',
      // width:100,
    },
    {
      title: '开始时间',
      key: 'CreateTime',
      dataIndex: 'CreateTime',
    },
    {
      title:'完成时间',
      key:'FinishTime',
      dataIndex: 'FinishTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render:(a,b)=>{
        // console.log('渲染收操作是:', a,b);
        return <Button type={'ghost'} onClick={()=>this.onEditMedicine(b)}>编辑</Button>
      }
    }
  ];

  abortController = new AbortController();

  componentDidMount() {
    this.onSearchInstockRecords(this.state.pagination);
  }
  componentWillUnmount() {
    this.abortController.abort();
  }

  onSearchInstockRecords(pagination,filters,sorter) {
    if (this.state.loading) {
      return;
    } else {
      let that = this;
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
            let api = 'instockrecords.get';
            let searchParam = {
              fields: '*',
              pageNum: pageNum,
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
                  cancelSignal: this.abortController.signal,
                  onFinish: (res) => {
                    let newState = {loading:false};
                    if (res.InstockRecords) {
                      console.log('搜索入库单结果列表:', res);
                      if (res && res.InstockRecords && res.InstockRecords.length > 0) {
                        for (let i = 0; i < res.InstockRecords.length; i++) {
                          res.InstockRecords[i].key = '' + res.InstockRecords[i].Id;
                        }
                      }
                      console.log('添加了key的入库单结果列表:', res);
                        newState.data = res.InstockRecords;
                        newState.pagination = {...pagination};
                      if (pageNum === 0) {
                        newState.pagination.total = res.TotalRecordCount;
                      }
                    } else {
                      message.error('没有搜索到入库单结果,' + res.ErrMsg);
                      console.log(res);
                    }
                    that.setState(newState);
                  }
                }
            )
            //endregion
          });
    }
  }

  onChangeTimeRange(dates, dateStrings)
  {
    console.log('时间有修改了:', dates, dateStrings);

    if (dates)
    {
      //选择了时间
      this.setState({searchingStartTime:dateStrings[0],searchingEndTime:dateStrings[1]}
      ,()=>
          {
            this.onSearchInstockRecords(this.state.pagination);
          });
    }
    else
    {
      //清空了时间
      this.setState({searchingStartTime:'',searchingEndTime:''},()=>{
        this.onSearchInstockRecords(this.state.pagination);
      });
    }
  }


  render() {
    let onSearchMedicine = this.onSearchInstockRecords.bind(this);
    let onChangeTimeRange = this.onChangeTimeRange.bind(this);
    let data = this.state.data;
    let loading = this.state.loading;
    return (
        <div className={classNames.main}>
          <div className={classNames.titleLine}>
            上药记录
          </div>
          <div className={classNames.toolsLine}>
            <div className={classNames.searchArea}>
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
                onChange={onSearchMedicine}
                pagination={this.state.pagination}
            />
          </div>
        </div>
    );
  }
}

export default InstockRecord;
