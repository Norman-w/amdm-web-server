import React, { Component } from 'react';
import {Button,Input} from "antd";

import classNames from './MedicineInfo.module.css'

const emptyMedicine =
  {
    Id:0,
    IdOfHIS:undefined,
    Barcode : undefined,
    Name: undefined,
    Company:undefined,
    BoxLongMM:0,
    BoxWidthMM:0,
    BoxHeightMM:0,
  }
class MedicineInfo extends Component {
    state={
      ...emptyMedicine,
      mode:'create',//edit
    }
    componentDidMount() {
        console.log('组件已经加载,参数是;', this.props)
        if (this.props.medicine)
        {
          let newState ={
            ...this.props.medicine,
            mode:this.props.mode,
          }
            this.setState(newState);
        }
        else
        {
          let newState = {
            ...emptyMedicine,
            mode:this.props.mode
          }
          this.setState(newState);
        }
    }
    //获取警告信息文本
    getWarningLabel(data,name,unit, min,max) {
        // console.log('输入的data为:',data);
        let longWarning = null;

        if (data !== undefined) {
            if (data) {
                let intLong = parseInt(data);
                if (isNaN(intLong)) {
                    longWarning = '无效的' + name + '信息';
                } else if (intLong > 300 || intLong < 30) {
                    longWarning = '有效值为' + min + '~' + max;
                    // '无效的长度信息,应当介于' + min + unit + '到' + max + unit + '之间';
                }
            } else {
                longWarning = '请输入有效的' + name;
            }
        } else {
        }

        return longWarning;
    }
    render() {
      let createMode = this.state.mode ==='create';
        //region 条码提示
        let barcodeWarning = null;
        if (this.state.Barcode !== undefined)
        {
            if (!this.state.Barcode) {
                barcodeWarning = '请输入有效的条码';
            }
            else
            {
              let length = this.state.Barcode.length;
              let isValidLongValue = (/^\d+$/.test(this.state.Barcode));
              console.log('长度:',length, '是否有效数字', isValidLongValue);
              if (length!==13 || !isValidLongValue) {
                barcodeWarning = '药品条码需为13位数字';
              }
            }
        }
        //endregion
      let hisCodeWarning = null
      if (this.state.IdOfHIS !== undefined)
      {
        if (!this.state.IdOfHIS) {
          hisCodeWarning = '请输入HIS系统内该药品的编码';
        }
        else
        {
        }
      }
        //region 名称提示
        let nameWarning = null;
        if(this.state.Name !== undefined)
        {
            if (!this.state.Name)
            {
                nameWarning = '请输入正确的药品名称';
            }
            else if(this.state.Name.length<2)
            {
                nameWarning = '药品名称太短';
            }
        }
        //endregion
        //region 长度宽度高度警告信息
        let longWarning = this.getWarningLabel(this.state.BoxLongMM, '药盒长度','毫米', 30,300);
        let widthWarning = this.getWarningLabel(this.state.BoxWidthMM, '药盒宽度','毫米', 30,300);
        let heightWarning = this.getWarningLabel(this.state.BoxHeightMM, '药盒高度','毫米', 30,300);
        //endregion

      //region 是否可以提交修改或者新增
      let canSubmit = true;
      if (nameWarning || barcodeWarning || longWarning || widthWarning || heightWarning)
      {
        canSubmit = false;
      }
      //endregion
        return <div id={'main'} className={classNames.main}>
            <div id={'条码行'} className={classNames.infoLine}>
                <div id={'条码文字和星号'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>条码</div>
                <Input id={'条码输入框'} placeholder={'请输入药品条码'} value={this.state.Barcode} onChange={(e) => {
    this.setState({Barcode: e.target.value})
}}/>
                <div id={'条码提示'} className={classNames.warningText}>{barcodeWarning}</div>
            </div>
          <div id={'his系统编码行'} className={classNames.infoLine}>
            <div id={'his编码文字和星号'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>HIS系统内部药品码</div>
            <Input id={'his编码输入框'} placeholder={'请输入HIS系统内部的药品编码'} value={this.state.IdOfHIS} onChange={(e) => {
              this.setState({IdOfHIS: e.target.value})
            }}/>
            <div id={'his编码输入框提示'} className={classNames.warningText}>{hisCodeWarning}</div>
          </div>
            <div id={'药品名称行'} className={classNames.infoLine}>
                <div id={'名称文字和星号'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>名称</div>
                <Input id={'名称输入框'} placeholder={'请输入药品名称'} value={this.state.Name} onChange={(e) => {
    this.setState({Name: e.target.value})
}}/>
                <div id={'名称提示'} className={classNames.warningText}>{nameWarning}</div>
            </div>
            <div id={'厂商行'} className={classNames.infoLine}>
                <div id={'厂商文字和星号'}>厂商</div>
                <Input id={'厂商输入框'} placeholder={'请输入药品厂商'} value={this.state.Company} onChange={(e) => {
    this.setState({Company: e.target.value})
}}/>
            </div>
            <div id={'药盒尺寸信息行'} className={classNames.sizeLine}>
                <div id={'药盒长度区域'}>
                    <div id={'星号药盒长度毫米'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>药盒长度(毫米)</div>
                    <Input id={'药盒长度输入'} placeholder={''} value={this.state.BoxLongMM} onChange={(e) => {
    this.setState({BoxLongMM: e.target.value})
}}/>
                    <div id={'药盒长度提示'} className={classNames.warningText}>{longWarning}</div>
                </div>
                <div id={'药盒宽度区域'}>
                    <div id={'星号药盒宽度毫米'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>药盒宽度(毫米)</div>
                    <Input id={'药盒宽度输入'} placeholder={''} value={this.state.BoxWidthMM} onChange={(e) => {
    this.setState({BoxWidthMM: e.target.value})
}}/>
                    <div id={'药盒宽度提示'} className={classNames.warningText}>{widthWarning}</div>
                </div>
                <div id={'药盒高度区域'}>
                    <div id={'星号药盒高度毫米'} className={classNames.titleLine}><div style={{color:'red'}}>*</div>药盒高度(毫米)</div>
                    <Input id={'药盒高度输入'} placeholder={''} value={this.state.BoxHeightMM} onChange={(e) => {
    this.setState({BoxHeightMM: e.target.value})
}}/>
                    <div id={'药盒高度提示'} className={classNames.warningText}>{heightWarning}</div>
                </div>
            </div>

            <div id={'按钮行'} className={classNames.buttonLine}>
                <Button type={'primary'} disabled={!canSubmit} onClick={()=>{
                  if (this.props.onSubmit)
                  {
                    this.props.onSubmit(this.state);
                  }
                }}>{createMode?'确认新增':'保存修改'}</Button>
              {!createMode&&<Button type={'danger'}
                                    onClick={
                                      ()=>
                                      {
                                        if (this.props.onDelete)
                                        {
                                          this.props.onDelete(this.state.Id);
                                        }
                                      }
                                    }
              >删除</Button>}
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
