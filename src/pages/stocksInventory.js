import React, {Component} from 'react';
import classNames from './stocksInventory.module.css'
import app from "../app";
import {Spin,message} from "antd";
import StockInventory from "./component/StockInventory";


class StocksInventory extends Component {

  state=
    {
      currentStockIndex:0,
    }

  render() {
    return (
      <div className={classNames.main}>
        <div className={classNames.titleLine}>
          各分仓载量
        </div>
        <div className={classNames.content}>
          <StockInventory stockIndex={this.state.currentStockIndex}></StockInventory>
        </div>
      </div>
    );
  }
}

export default StocksInventory;
