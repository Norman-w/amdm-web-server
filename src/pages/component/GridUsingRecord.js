import React, {Component} from 'react';
import classNames from './StockInventory.module.css'
import {message, Spin} from "antd";
import app from "../../app";

// const obj2List = (obj)=>
// {
//   let list = [];
//   let keys = Object.keys(obj);
//   let keysCount = keys.length;
//   for (let i = 0; i < keysCount; i++) {
//     let key = keys[i];
//     let current = obj[key];
//     list.push(current);
//   }
//   return list;
// }

class GridUsingRecord extends Component {
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
                if(res.Machine&&res.Machine.Stocks&& res.Machine.Stocks.length>0 && res.Machine.Stocks[0].Floors)
                {
                  retList = res.Machine.Stocks[0].Floors;
                }
                else
                {
                  message.error('未获取到有效的分仓库存结果信息')
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

  getObjects(grid)
  {
    if(!grid)
      return null;
    let m = grid["Max"];
    if (m)
    {
      let oStyle = {
        width:(100/m).toFixed(1)+'%',
        height: '90%',
        border:'1px dashed gray',
        margin:2,
      }
      let ret = [];
      for (let i = 0; i < m; i++) {
        let oo = {...oStyle
          ,
          backgroundColor:i<grid.Count?
            (grid.Count>=m?'darkgreen':'darkorange')
            :'none'
        }
        ret.push(
          <div style={oo}/>
        )
      }
      return ret;
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
            let perHeight = 100/this.state.floors.length;
            let fStyle = {
              height:''+perHeight.toFixed(1)+'%'
            };
            return <div key={floorIndex} className={classNames.floor} style={fStyle}>
              {floor.Grids.map((grid,gIndex)=>{
                let gStyle =
                  {
                    width:(100/floor.Grids.length).toFixed(1)+'%',
                    margin:3,
                  };

                let objs = this.getObjects(grid);
                console.log('objs:', objs);
                return <div key={gIndex} className={classNames.grid} style={gStyle}>
                  <div className={classNames.medicineName}>{grid.Name}</div>
                  <div className={classNames.objs}>{objs}</div>
                </div>
              })}
            </div>
          }
        )}
      </div>
    );
  }
}

export default GridUsingRecord;
