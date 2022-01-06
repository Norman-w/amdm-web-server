import React, { Component } from 'react';
import {Button,Input} from "antd";

import classNames from './MedicineInfo.module.css'

class MedicineInfo extends Component {
    state={
        medicine:null,
        barcode : undefined,
        name: undefined,
        company:undefined,
    }
    componentDidMount() {
        // console.log('组件已经加载,参数是;', this.props)
        if (this.props)
        {
            this.setState({medicine:this.props.medicine});
        }
    }
    //获取警告信息文本
    getWarningLabel(data,name,unit, min,max)
    {
        console.log('输入的data为:',data);
        let longWarning = null;
        {
            if (data !== undefined)
            {
                if (data)
                {
                    let intLong = parseInt(data);
                    if(isNaN(intLong))
                    {
                        longWarning = '无效的'+name+'信息';
                    }
                    else if (intLong>300 || intLong <30)
                    {
                        longWarning = '有效值为' +min +'~'+max;
                            // '无效的长度信息,应当介于' + min + unit + '到' + max + unit + '之间';
                    }
                }
                else
                {
                    longWarning = '请输入有效的'+name;
                }
            }
            else
            {
            }
        }
        return longWarning;
    }
    render() {
        //region 条码提示
        let barcodeWarning = null;
        if (this.state.barcode !== undefined)
        {
            if (!this.state.barcode) {
                barcodeWarning = '请输入有效的条码';
            }
            else if(this.state.barcode.length!==13)
            {
                barcodeWarning = '药品条码需为13位数字';
            }
        }
        //endregion
        //region 名称提示
        let nameWarning = null;
        if(this.state.name !== undefined)
        {
            if (!this.state.name)
            {
                nameWarning = '请输入正确的药品名称';
            }
            else if(this.state.name.length<2)
            {
                nameWarning = '药品名称太短';
            }
        }
        //endregion
        //region 长度宽度高度警告信息
        let longWarning = this.getWarningLabel(this.state.boxLongMM, '药盒长度','毫米', 30,300);
        let widthWarning = this.getWarningLabel(this.state.boxWidthMM, '药盒宽度','毫米', 30,300);
        let heightWarning = this.getWarningLabel(this.state.boxHeightMM, '药盒高度','毫米', 30,300);
        //endregion
        return <div id={'main'} className={classNames.main}>
            <div id={'条码行'} className={classNames.infoLine}>
                <div id={'条码文字和星号'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>条码</div>
                <Input id={'条码输入框'} placeHolder={'请输入药品条码'} value={this.state.barcode} onChange={(e) => {
    this.setState({barcode: e.target.value})
}}/>
                <div id={'条码提示'} className={classNames.warningText}>{barcodeWarning}</div>
            </div>
            <div id={'药品名称行'} className={classNames.infoLine}>
                <div id={'名称文字和星号'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>名称</div>
                <Input id={'名称输入框'} placeHolder={'请输入药品名称'} value={this.state.name} onChange={(e) => {
    this.setState({name: e.target.value})
}}/>
                <div id={'名称提示'} className={classNames.warningText}>{nameWarning}</div>
            </div>
            <div id={'厂商行'} className={classNames.infoLine}>
                <div id={'厂商文字和星号'}>厂商</div>
                <Input id={'厂商输入框'} placeHolder={'请输入药品厂商'} value={this.state.company} onChange={(e) => {
    this.setState({company: e.target.value})
}}/>
            </div>
            <div id={'药盒尺寸信息行'} className={classNames.sizeLine}>
                <div id={'药盒长度区域'}>
                    <div id={'星号药盒长度毫米'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>药盒长度(毫米)</div>
                    <Input id={'药盒长度输入'} placeHolder={''} value={this.state.boxLongMM} onChange={(e) => {
    this.setState({boxLongMM: e.target.value})
}}/>
                    <div id={'药盒长度提示'} className={classNames.warningText}>{longWarning}</div>
                </div>
                <div id={'药盒宽度区域'}>
                    <div id={'星号药盒宽度毫米'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>药盒宽度(毫米)</div>
                    <Input id={'药盒宽度输入'} placeHolder={''} value={this.state.boxWidthMM} onChange={(e) => {
    this.setState({boxWidthMM: e.target.value})
}}/>
                    <div id={'药盒宽度提示'} className={classNames.warningText}>{widthWarning}</div>
                </div>
                <div id={'药盒高度区域'}>
                    <div id={'星号药盒高度毫米'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>药盒高度(毫米)</div>
                    <Input id={'药盒高度输入'} placeHolder={''} value={this.state.boxHeightMM} onChange={(e) => {
    this.setState({boxHeightMM: e.target.value})
}}/>
                    <div id={'药盒高度提示'} className={classNames.warningText}>{heightWarning}</div>
                </div>
            </div>

            <div id={'按钮行'} className={classNames.buttonLine}>
                <Button type={'primary'}>确认新增</Button>
                <Button type={'ghost'}
                        onClick={()=>
                        {
                            if (this.props.onCancel)
                            {
                                this.props.onCancel();
                            }
                        }}
                >取消</Button>
            </div>
        </div>
    }
}

export default MedicineInfo;