import React, {Component} from 'react';
import InventoryChart1 from "./component/InventoryChart1";
import app from "../app";
import classNames from './inventoryStatus.module.css';
import {Table, Button, message, Spin, Tag} from "antd";

const inventoryTableColumns=
    [
        {
            title: '编号',
            dataIndex: 'Id',
            key: 'key',
            render:t=><div style={{color:'gray'}}>{t}</div>
        },
        {
            title: '名称',
            dataIndex: 'Name',
        },
        {
            title: '库存',
            dataIndex: 'Count',
            render:(t)=>{return !t?<Tag color={'lightgray'}>无</Tag> :<Tag color={'green'}>{t}</Tag>}
        },

        {
            title: 'HIS编码',
            dataIndex: 'IdOfHIS',
        },
        {
            title: '条码',
            dataIndex: 'Barcode',
        },

        {
            title: '厂商',
            dataIndex: 'Company',
        },
    ]

class InventoryStatus extends Component {
  state=
      {
        loading:false,
        // Inventory:[],
          //合并完了的库存信息
          MergedInventory:[],
          //当前库存存量一共有多少
          totalCount :0
      }
  componentDidMount() {
      this.getAndShowCurrentInventory();
  }

    mergeInventory = function (inventory){
        if (!inventory)
        {
            return [];
        }
        let ret= [];
        let dic = {};
        for (let i = 0; i < inventory.length; i++) {
            let current = inventory[i];
            if(!dic[current.Id])
            {
                if (!current.Count)
                {
                    current.Count = 0;
                }
                dic[current.Id]=current;
            }
            else
            {
                dic[current.Id].Count += current.Count?current.Count:0;
            }
        }
        let keys = Object.keys(dic);
        let totalCount = 0;
        for (let i = 0; i < keys.length; i++) {
            ret.push(dic[keys[i]]);
            totalCount += dic[keys[i]].Count;
        }
        this.setState({totalCount:totalCount});
        return ret;
    }

  //region 获取药品并且更新到视图显示
getAndShowCurrentInventory() {
    if (this.state.loading)
    {
    }
    else
    {
      let that = this;
      this.setState({loading:true},
        ()=>
        {
          //region 获取数据并显示
          let api = 'inventory.all.get';
          app.doPost2(
            {
              url: app.setting.clientSideApiRouterUrl,
              apiName:api,
              params:
                {
                  method: api,
                  // fields: 'name'
                },
              onFinish: (res) => {
                console.log('获取库存结果完成:', res)
                if (res.Inventory)
                {
                  that.setState({
                      // Inventory: res.Inventory,
                      loading:false,
                      MergedInventory:that.mergeInventory(res.Inventory)
                  });
                }
                else
                {
                  message.warn(res.ErrMsg);
                  that.setState({loading:false});
                }
              },
              onTimeout:()=>
              {
                message.warn('获取库存信息超时');
                that.setState({loading:false});
              }
            }
          )
          //endregion
        })
    }

}
    //endregion

  render() {
    let chartElem = <div className={classNames.loading}><Spin/></div>
    if (!this.state.loading)
    {
      chartElem = <InventoryChart1 Inventory={this.state.MergedInventory}/>
    }
    return (
      <div className={classNames.main}>
          <div className={classNames.titleLine}>当前库存
              <div>总存量:{this.state.totalCount}</div>
              <Button size={'small'} type={'primary'}
                      onClick={()=>{this.getAndShowCurrentInventory()}}
              >刷新</Button>
          </div>
          <div className={classNames.chartLine}>
            {chartElem}
          </div>
          <Table className={classNames.listArea} columns={inventoryTableColumns} dataSource={this.state.MergedInventory}/>
          {/*<div className={classNames.listArea}></div>*/}
      </div>
    );
  }
}

export default InventoryStatus;
