import React from 'react';
// import PropTypes from 'prop-types';
import classNames from "../fulfillRecord.module.css";
import {Image, Table, Tag, Spin, message} from "antd";
import app from "../../app";


//付药单中的药品相关信息的明细列
const detailColumns =
    [
      {
        title: '流水号',
        dataIndex: 'Id',
        key: 'Id',
        render:t=><div style={{color:'gray'}}>{t}</div>
      },
      {
        title: '数量',
        dataIndex: 'Count',
        key: 'Count',
        render:(count)=>
        {
          return <Tag color={'geekblue'}>
            {count}
          </Tag>
        }
      },
      {
        title: '药品名',
        dataIndex: 'MedicineName',
        key: 'MedicineName',
        // render:t=><div style={{color:'gray'}}>{t}</div>
      },
      {
        title: '药品条码',
        dataIndex: 'MedicineBarcode',
        key: 'MedicineBarcode',
        // render:t=><div style={{color:'gray'}}>{t}</div>
      },
      {
        //这个变量是后生成的,Details数据中不包含
        title: '药槽位置',
        dataIndex: 'gridPosition',
        key: 'gridPosition',
        // render:t=><div style={{color:'gray'}}>{t}</div>
      },
    ];
class DeliveryRecordInfo extends React.Component{
  state={
    record :{},
    //未定义的时候就是没有获取完呢 已经有值了 就是获取完了 但是空值 代表获取到了位空 就显示无图片即可
    billImg : undefined, interactiveAreaImg:undefined, bucketImg: undefined
  }
  signal = new AbortController();
  componentDidMount() {
    if(this.props.record)
    {
      this.setState({record:this.props.record});
      this.onInit(this.props.record)
    }
  }

  onInit(record)
  {
    let that = this;
    console.log('将要获取图片:', record);
    app.doPost2(
        {
          url: app.setting.clientSideApiRouterUrl,
          apiName: 'snapshots.get',
          params:
              {
                ParentType:'DeliveryRecord',
                ParentId:record.Id,
              },
          onFinish:(res)=>
          {
            console.log('获取完毕,res:', res);
            if (!res.Snapshots || res.IsError)
            {
              message.error(res.ErrMsg);
            }
            else
            {
              let bill = '';
              let bucket = '';
              let interactive = '';
              for (let i = 0; i < res.Snapshots.length; i++) {
                let current = res.Snapshots[i];
                if (current.Location==='取药斗上方')
                {
                  bucket = app.setting.SnapshotUrlBase+current.FileUrl;
                }
                else if(current.Location === '用户交互区')
                {
                  interactive = app.setting.SnapshotUrlBase+current.FileUrl;
                }
                else if(current.Location === '付药单' )
                {
                  bill = app.setting.SnapshotUrlBase+current.FileUrl;
                }
              }
              console.log('将要设置三张图:', bill, bucket, interactive);
              that.setState({
                billImg : bill, interactiveAreaImg:interactive, bucketImg: bucket
              });
            }
          }
          ,onTimeout:()=>
          {
            message.warn('获取凭据图片超时');
          },
            abortController :this.signal,
          timeoutMS:5000,
        }
    )
  }
  getImageElem(picUrl)
  {
    if  (picUrl === undefined)
    {
      return <Spin/>
    }
    else if(picUrl)
    {
      return <Image src={picUrl} className={classNames.image} width={160} alt={'图片已不存在或不可读'}/>
    }
    else
    {
      return <div className={classNames.noImage}>无图片</div>
    }
  }
  render()
  {
    let record = this.state.record;
    return (
        <Table
            size={'small'}
            pagination={{hideOnSinglePage: true}}
            columns={detailColumns}
            dataSource={record.Details}
            footer={(
                // currentPageData
            ) => {
              return <div>
                {/*总记录数:{currentPageData.length}*/}
                <div id={'凭证信息行'} className={classNames.imagesLine}>
                  <div id={'小票列'}>
                    <div>付药单据图</div>
                    {
                      this.getImageElem(this.state.billImg)
                    }
                  </div>
                  <div id={'取药处列'}>
                    <div>交互区画面</div>
                    {
                      this.getImageElem(this.state.interactiveAreaImg)
                    }
                  </div>
                  <div id={'取药斗处列'}>
                    <div>出药处画面</div>
                    {
                      this.getImageElem(this.state.bucketImg)
                    }
                  </div>
                </div>
              </div>
            }
            }
        >
        </Table>
    );
  }
}
export default DeliveryRecordInfo;
