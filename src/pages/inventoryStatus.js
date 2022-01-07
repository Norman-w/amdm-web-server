import React, {Component} from 'react';
import InventoryChart1 from "./component/InventoryChart1";
import app from "../app";
import classNames from './inventoryStatus.module.css';
import {Button, message,Spin} from "antd";

class InventoryStatus extends Component {
  state=
      {
        loading:false,
        Inventory:[]
      }
  componentDidMount() {
      this.getAndShowCurrentInventory();
  }

  //region 获取药品并且更新到视图显示
getAndShowCurrentInventory() {
    if (this.state.loading)
    {
      return;
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
                  fields: 'name'
                },
              onFinish: (res) => {
                console.log('获取库存结果完成:', res)
                if (res.Inventory)
                {
                  that.setState({Inventory: res.Inventory, loading:false});
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
      chartElem = <InventoryChart1 Inventory={this.state.Inventory}/>
    }
    return (
      <div className={classNames.main}>
          <div className={classNames.titleLine}>当前库存
              <Button size={'large'} type={'primary'}
                      onClick={()=>{this.getAndShowCurrentInventory()}}
              >刷新</Button>
          </div>
          <div className={classNames.chartLine}>
            {chartElem}
          </div>
          {/*<div className={classNames.listArea}></div>*/}
      </div>
    );
  }
}

export default InventoryStatus;
