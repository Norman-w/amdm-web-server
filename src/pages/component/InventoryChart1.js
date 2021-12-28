import React from 'react';
import {Treemap} from "@ant-design/charts";
import classNames from './InventoryChart1.module.css';

function InventoryChart1(props) {
    const inventory2Chart = function (inventory){
        if (!inventory)
        {
            return [];
        }
        let ret= [];
        let dic = {};
        for (let i = 0; i < inventory.length; i++) {
            let current = inventory[i];
            //region 如果是没有库存的就不展示的话
            if (!current.Count)
            {continue;}
            //endregion
            if(!dic[current.Name])
            {
                dic[current.Name]={
                    name:current.Name,
                    value:current.Count? current.Count:0,
                };
            }
            else
            {
                dic[current.Name].value += current.Count;
            }
        }
        let keys = Object.keys(dic);
        for (let i = 0; i < keys.length; i++) {
            ret.push(dic[keys[i]]);
        }
        return ret;
    }
    const data = {
        name: 'root',
        children: inventory2Chart(props.Inventory),
    };
    const config = {
        data,
        // colorField: 'name',
        color:'darkcyan'
    };
    // return <div className={classNames.main}/>
    return <Treemap {...config} autoFit={true}/>;
}

export default InventoryChart1;