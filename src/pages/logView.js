import React, {Component} from 'react';
import classNames from "./fulfillRecord.module.css";
import {Radio, Table, Input, DatePicker, message} from "antd";
import app from "../app";
const {Search} = Input;
const { RangePicker } = DatePicker;
const defaultPageSize = 30;
class LogView extends Component {
  columns = [
    {
      title: '流水号',
      dataIndex: 'id',
      key: 'id',
      render:t=><div style={{color:'gray'}}>{t}</div>
    },
    // {
    //   title: '来源',
    //   dataIndex: 'Source',
    //   key: 'Source',
    // },
    {
      title: '类型',
      dataIndex: 'level',
      key: 'level',
    },{
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '内容',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '时间',
      key: 'time',
      dataIndex: 'time',
    },
  ];
  state={
    searchingLogType:'all',
    searchingLogTitle:null,
    searchingStartTime:null,
    searchingEndTime:null,
    pagination: {
      position:['topRight','bottomRight'],
      current: 1,
      pageSize: defaultPageSize,
    },
  }

  componentDidMount() {
      this.onSearchLog(this.state.pagination);
  }

    onSearchLog(pagination
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
            let api = 'logs.get';
            let searchParam = {
              pageNum: pageNum,
              Level:this.state.searchingLogType,
              TitleTag:this.state.searchingLogTitle,
              pageSize: pageSize,
            };
            if (this.state.searchingEndTime && this.state.searchingStartTime) {
              searchParam.startTime = this.state.searchingStartTime;
              searchParam.endTime = this.state.searchingEndTime;
            }
            console.log('搜索参数:', searchParam)
            app.doPost2(
                {
                  url: app.setting.clientSideApiRouterUrl,
                  apiName: api,
                  params: searchParam,
                  abortController: this.abortController,
                  onFinish: (res) => {
                    let newState = {loading:false};
                    if (res.Logs) {
                      console.log('获取日志记录表:', res);
                      if (res && res.Logs && res.Logs.length > 0) {
                        for (let i = 0; i < res.Logs.length; i++) {
                          res.Logs[i].key = '' + res.Logs[i].id;
                        }
                      }
                      console.log('添加了key的日志记录结果列表:', res);
                      newState.data = res.Logs;
                      newState.pagination = {...pagination};
                      if (pageNum === 0) {
                        newState.pagination.total = res.TotalResultCount;
                      }
                    } else {
                      message.error('没有搜索到日志记录' + res.ErrMsg);
                      console.log(res);
                    }
                    that.setState(newState);
                  },
                  timeoutMS:10000,
                  onFail:(t)=>
                  {
                    message.warn(t?'搜索日志记录超时':'获取日志记录发生错误,请重试');
                    that.setState({loading:false})
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
            this.onSearchLog(this.state.pagination);
          });
    }
    else
    {
      //清空了时间
      this.setState({searchingStartTime:'',searchingEndTime:''},()=>{
        this.onSearchDeliveryRecord(this.state.pagination);
      });
    }
  }
  render() {
    let onSearchLog = this.onSearchLog.bind(this);
    let onChangeTimeRange = this.onChangeTimeRange.bind(this);
    let data = this.state.data;
    let loading = this.state.loading;
    let showBug = false;
    return (
        <div className={classNames.main}>
          <div className={classNames.titleLine}>
            日志查询
          </div>
          <div className={classNames.toolsLine}>
            <div className={classNames.searchArea} style={{width:'100%'}}>
              <div className={classNames.nameArea}>
                <div className={classNames.nameLabel}>日志类型:</div>
                <Radio.Group onChange={(e)=>{
                  this.setState({searchingLogType:e.target.value},()=>{
                    this.onSearchLog();
                  })
                }} value={this.state.searchingLogType}>
                  <Radio value={'all'}>全部</Radio>
                  <Radio value={'Info'}>普通</Radio>
                  <Radio value={'Warning'}>警告</Radio>
                  <Radio value={'Error'}>错误</Radio>
                  {showBug&&<Radio value={'Bug'}>Bug</Radio>}
                </Radio.Group>
              </div>
              <div className={classNames.nameArea}>
                <div className={classNames.nameLabel}>日志标题:</div>
                <Search
                    placeholder="请输入日志标题"
                    enterButton
                    value={this.state.searchingLogTitle}
                    onSearch={onSearchLog}
                    onChange={(v)=>{this.setState({searchingLogTitle:v.target.value})}}
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
                onChange={onSearchLog}
                pagination={this.state.pagination}
            />
          </div>
        </div>
    );
  }
}

export default LogView;
