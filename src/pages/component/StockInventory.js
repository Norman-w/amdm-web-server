import React, {Component} from 'react';
import classNames from './StockInventory.module.css'
import {message, Spin} from "antd";
import app from "../../app";

const obj2List = (obj)=>
{
  let list = [];
  let keys = Object.keys(obj);
  let keysCount = keys.length;
  for (let i = 0; i < keysCount; i++) {
    let key = keys[i];
    let current = obj[key];
    list.push(current);
  }
  return list;
}

class StockInventory extends Component {
  state=
    {
      floors:[],
      loading:false,
    }

    componentDidMount() {
    this.getAndShow(this.props.stockIndex);
    }
    componentWillUnmount() {
    this.abortController.abort();
    }


  componentWillReceiveProps(nextProps, nextContext) {
    this.abortController = new AbortController();
      this.getAndShow(nextProps.stockIndex);
    }

  abortController = new AbortController();
  getAndShow(stockIndex)
  {
    if (stockIndex<0)
      return;
    if (this.state.loading)
    {

    }
    else
    {
      this.setState({loading:true},()=>{
        let that = this;
        app.doPost2(
          {
            url:app.setting.clientSideApiRouterUrl,
            apiName:'gridinventory.all.get',
            params:{
              stockIndex
            },
            onFinish:(res)=>
            {
              console.log('获取分仓库存结果:',res);
              if (res.IsError)
              {
                message.warn(res.ErrMsg);
                that.setState({loading:false});
              }
              else
              {
                let retList = [];
                // res.MachineInventoryTree.StocksInventory = obj2List(res.MachineInventoryTree.StocksInventory);

                let stocks = obj2List(res.MachineInventoryTree.StocksInventory);
                for (let i = 0; i < stocks.length; i++) {
                  let stock = stocks[i];
                  stock.FloorsInventory = obj2List(stock.FloorsInventory);
                  for (let j = 0; j < stock.FloorsInventory.length; j++) {
                    let floor = stock.FloorsInventory[j];
                    floor.GridsInventory = obj2List(floor.GridsInventory);
                    retList.push(floor);
                  }
                }
                that.setState({floors:retList,loading:false});
                console.log('转换后的floors', that.state.floors)
              }
            },
            onFail:(t)=>
            {
              message.error(t?'请求超时请稍后再试':'请检查网络连接');
              that.abortController = new AbortController();
              that.setState({loading:false});
            },
            abortController:this.abortController,
          }
        )
      })
    }
  }



  render() {
    if (this.state.loading)
    {
      return <div className={classNames.main}>
        <Spin/>
      </div>
    }
    return (
      <div className={classNames.main}>
        {this.state.floors.map(
          (floor,floorIndex)=>
          {
            return <div key={floorIndex} className={classNames.floor}>
              {floor.GridsInventory.map((grid,gIndex)=>{
                return <div key={gIndex} className={classNames.grid}>{grid.Count}</div>
              })}
            </div>
          }
        )}
      </div>
    );
  }
}

export default StockInventory;
