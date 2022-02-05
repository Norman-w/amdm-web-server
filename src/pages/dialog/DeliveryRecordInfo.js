import React from 'react';
// import PropTypes from 'prop-types';
import classNames from "../fulfillRecord.module.css";
import {Image, Table, Tag, Spin, message, Button, Modal} from "antd";
import app from "../../app";
import DeliveryRecordDetailInfo from "./DeliveryRecordDetailInfo";
// import DeliveryRecordDetailInfo from "./DeliveryRecordDetailInfo";

const SnapshotLocationEnum =
{
  /// <summary>
  /// 付药单据凭证图片
  /// </summary>
  DeliveryRecordPaper : 0,
  /// <summary>
  /// 取药斗
  /// </summary>
  MedicineBucket : 1,
  /// <summary>
  /// 交互区
  /// </summary>
  InteractiveArea : 2,
  /// <summary>
  /// 取药机械手相机点位1
  /// </summary>
  GrabbersArea1 : 3,
  /// <summary>
  /// 取药机械手相机点位2
  /// </summary>
  GrabbersArea2 : 4,
}

const getImageElem = (picUrl)=>
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
class DeliveryRecordInfo extends React.Component{
  state={
    record :{},
    //未定义的时候就是没有获取完呢 已经有值了 就是获取完了 但是空值 代表获取到了位空 就显示无图片即可
    billImg : undefined, interactiveAreaImg:undefined, bucketImg: undefined
  }
  signal = new AbortController();
    //付药单中的药品相关信息的明细列
    detailColumns =
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
            {
                title: '操作',
                dataIndex: 'IsError',
                key:'IsError',
                render:(elem,record)=>
                {
                    let err = record.IsError;
                    let type = err?'danger':'ghost';
                    let text = err?'查看错误':'查看详情';
                    return <Button type={type} size={'small'} onClick={()=>{
                        if (record.IsError)
                        {
                            Modal.error({
                                title:record.ErrMsg,
                                content: <DeliveryRecordDetailInfo detail={record}/>
                            })
                        }
                        else {
                            Modal.success({
                                title: '成功',
                                content: <DeliveryRecordDetailInfo detail={record}/>
                            })
                        }
                    }}
                    >{text}</Button>
                }
            },
        ];
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
                if (current.Location=== SnapshotLocationEnum.MedicineBucket)
                {
                  bucket = app.setting.SnapshotUrlBase+current.FileUrl;
                }
                else if(current.Location === SnapshotLocationEnum.InteractiveArea)
                {
                  interactive = app.setting.SnapshotUrlBase+current.FileUrl;
                }
                else if(current.Location === SnapshotLocationEnum.DeliveryRecordPaper )
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
          ,onFail:(t)=>
          {
            message.warn(t?'获取凭据图片超时':'获取凭据图片失败,请重试');
          },
            abortController :this.signal,
          timeoutMS:5000,
        }
    )
  }

  render()
  {
    let record = this.state.record;
    return (
        <Table
            size={'small'}
            pagination={{hideOnSinglePage: true}}
            columns={this.detailColumns}
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
                      getImageElem(this.state.billImg)
                    }
                  </div>
                  <div id={'取药处列'}>
                    <div>交互区画面</div>
                    {
                      getImageElem(this.state.interactiveAreaImg)
                    }
                  </div>
                  <div id={'取药斗处列'}>
                    <div>出药处画面</div>
                    {
                      getImageElem(this.state.bucketImg)
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
