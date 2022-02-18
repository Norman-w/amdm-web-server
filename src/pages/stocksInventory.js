import React, {Component} from 'react';
import classNames from './stocksInventory.module.css'
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
          <StockInventory stockIndex={this.state.currentStockIndex}/>
        </div>
      </div>
    );
  }
}

export default StocksInventory;
