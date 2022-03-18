import React, {Component} from 'react';
import classNames from './stocksInventory.module.css'
// import StockInventory from "./component/StockInventory";
import GridsShower from "./component/GridsShower";
import Modal from "antd/es/modal";
import GridUsingRecordPicView from "./component/GridUsingRecordPicView";


class GridsUsingRecord extends Component {

    state=
        {
            currentStockIndex:0,
        }

        onClickGridShowersGrid(grid)
        {
            Modal.info(
                {
                    width:1000,
                    title:'药槽使用记录',
                    content:
                    <GridUsingRecordPicView grid={grid}/>
                }
            )
        }
    render() {
        return (
            <div className={classNames.main}>
                <GridUsingRecordPicView/>
                <div className={classNames.titleLine}>
                    药槽使用记录
                </div>
                <div className={classNames.content}>
                    <GridsShower stockIndex={this.state.currentStockIndex} onClickGrid={this.onClickGridShowersGrid.bind(this)}/>
                </div>
            </div>
        );
    }
}

export default GridsUsingRecord;
