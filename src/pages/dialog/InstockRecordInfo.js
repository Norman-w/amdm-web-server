import React, {Component} from 'react';
import {Tag, Table, Spin} from "antd";
import {Utils} from "../utils";

class InstockRecordInfo extends Component {
    componentDidMount() {
        if (this.props.record)
        {
            this.setState({record:this.props.record})
        }
    }

    columns=[
        {
            title:'流水号',
            dataIndex:'Id',
            key:'Id',
            render:(t)=><div style={{color:'gray'}}>{t}</div>
        },
        {
            title:'药品名',
            dataIndex:'MedicineName',
        },
        {
            title:'数量',
            dataIndex:'Count',
            render:(t)=><Tag color={'green'}>{t}</Tag>
        },
        {
            title:'位置',
            render:(a,b)=>{
                let str = Utils.GetGridLocationString(b.StockIndex,b.FloorIndex,b.GridIndex)
                return <div>{str}</div>;
            }
        },
        {
            title:'时间',
            dataIndex:'InstockTime',
        },
    ]

    state={
        record:{}
    }
    render() {
        if (!this.state.record)
        {
            return <Spin/>
        }
        return (
            <Table dataSource={this.state.record.Details} columns={this.columns}/>
        );
    }
}

export default InstockRecordInfo;