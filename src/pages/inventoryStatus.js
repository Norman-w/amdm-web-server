import React, {Component} from 'react';
import InventoryChart1 from "./component/InventoryChart1";
import app from "../app";
import classNames from './inventoryStatus.module.css';
import {Button} from "antd";

class InventoryStatus extends Component {
  state=
      {
        Inventory:[]
      }
  componentDidMount() {
      this.getAndShowCurrentInventory();
  }

  //region 获取药品并且更新到视图显示
getAndShowCurrentInventory() {
    //region 获取数据并显示
    let url = 'http://192.168.2.191/ClientSide/ApiRouter/';
    let api = 'inventory.all.get';
    let that = this;
    app.doPost(
        {
            url: url,
            headers:
                {
                    'Content-Type': 'application/json;charset=utf-8;',
                    // 'apiName':api
                },
            params:
                {
                    method: api,
                    fields: 'name'
                },
            finish: (res) => {
                // that.setState({PeripheralsStatus:res.PeripheralsStatus})
                console.log('获取到库存信息')
                console.log(res);
                that.setState({Inventory: res.Inventory});
            }
        }
    )
    //endregion
}
    //endregion

  render() {
    return (
      <div className={classNames.main}>
          <div className={classNames.titleLine}>当前库存
              <Button size={'large'} type={'primary'}
                      onClick={()=>{this.getAndShowCurrentInventory()}}
              >刷新</Button>
          </div>
          <div className={classNames.chartLine}>
              <InventoryChart1 Inventory={this.state.Inventory}/>
          </div>
          {/*<div className={classNames.listArea}></div>*/}
      </div>
    );
  }
}

export default InventoryStatus;
