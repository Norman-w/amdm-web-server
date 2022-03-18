import React, {Component} from 'react';
import {message, Spin} from "antd";
import app from "../../app";
import classNames from './GridsShower.module.css'

class GridsShower extends Component {
  state=
    {
      floors:[],
      loading:false,
      hoverGridIndex:-1,
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
            apiName:'grids.get',
            params:{
              stockIndex
            },
            onFinish:(res)=>
            {
              console.log('获取格子信息结果:',res);
              if (res.IsError)
              {
                message.warn(res.ErrMsg);
                that.setState({loading:false});
              }
              else
              {
                let floors = [];
                if (res.Grids&& res.Grids.length>0)
                {
                  let lastFloorIndex = res.Grids[0].FloorIndex;
                  let currentFloorGrids = [];
                  floors.push(currentFloorGrids);
                  for (let i = 0; i < res.Grids.length; i++) {
                    let currentGrid = res.Grids[i];
                    if (lastFloorIndex!==currentGrid.FloorIndex)
                    {
                      currentFloorGrids = [];
                      floors.push(currentFloorGrids);
                      lastFloorIndex = currentGrid.FloorIndex;
                    }
                    currentFloorGrids.push(currentGrid);
                  }
                }
                that.setState({floors:floors,loading:false});
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
            let perHeight = 100/this.state.floors.length;
            let fStyle = {
              height:''+perHeight.toFixed(1)+'%'
            };
            return <div key={floorIndex} className={classNames.floor} style={fStyle}>
              {floor.map((grid,gIndex)=>{
                let gStyle =
                  {
                    width:(100/floor.length).toFixed(1)+'%',
                    // margin:10,
                    transition:'0.2s',
                    // border:'1px solid red'
                  };
                if (this.state.hoverGridIndex === grid.IndexOfStock && !grid.Disable)
                {
                  gStyle.transform='scale(1.03)';
                  // gStyle.border='dashed 1px skyblue'
                  gStyle.backgroundColor='lightcyan';
                }
                else
                {
                  // gStyle.filter='blur(1px)'
                }

                let gridNumberStr = String(grid.IndexOfStock? ''+grid.IndexOfStock:'0');
                gridNumberStr = gridNumberStr.padStart(3,'0');
                let gridLocationStr = ''+(grid.StockIndex?grid.StockIndex+1:1)
                    +'仓'+ (grid.FloorIndex<0?(grid.FloorIndex):(grid.FloorIndex?grid.FloorIndex+1:1))
                    + '层'+ (grid.IndexOfFloor? grid.IndexOfFloor+1:1) + '槽'
                ;
                // let objs = this.getObjects(grid);
                // console.log('objs:', objs);
                return <div key={gIndex} className={grid.Disable?classNames.gridDisable:classNames.grid} style={gStyle}
                            onMouseEnter={()=>{this.setState({hoverGridIndex:grid.IndexOfStock})}}
                            onMouseLeave={()=>{this.setState({hoverGridIndex:-1})}}
                            onClick={()=>{if (this.props.onClickGrid){this.props.onClickGrid(grid)}}}
                >
                  <div className={classNames.indexOfStock}>{gridNumberStr}</div>
                  <div className={classNames.gridLocation}>{gridLocationStr}<div >
                    {grid.Disable?'未启用':''}
                  </div></div>
                  {/*<div className={classNames.objs}>{objs}</div>*/}
                </div>
              })}
            </div>
          }
        )}
      </div>
    );
  }
}

export default GridsShower;
