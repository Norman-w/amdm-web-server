import React, {Component} from 'react';
import {Button, Input, message, Modal} from "antd";

class Content extends Component
{
  state={
    placeholder:null,
    value:null,
  }
  componentDidMount() {
    if (this.ref && this.ref.current)
    {
      this.ref.current.focus();
    }
    this.setState({placeholder:this.props.placeholder,value:this.props.defaultValue})
  }
  ref=React.createRef();
  render() {
    let style =
      {
        width:'100%',
        height:'100%',
      }
    return (
      <div style={style}>
        <Input ref={this.ref} placeholder={this.state.placeholder} value={this.state.value}
        onChange={(e)=>{this.setState({value:e.target.value})}}
        />
        <div style={{width:'100%',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}}>
          <Button
            onClick={()=>{
              if (this.props.onOk)
              {
                this.props.onOk(this.state.value);
              }
            }}
          >确认</Button>
        </div>
      </div>

    );
  }
}
class NumberInputForm
{
  intCheckStr = "1234567890";
  floatCheckStr = "1234567890.";
  show(title,placeholder,defaultValue,onSubmit,floatMode=false)
  {
    let md = Modal.info(
      {
        centered:true,
        title:title,
        content:<Content placeholder={placeholder} defaultValue={defaultValue}
  onOk={(val) => {
    if (val) {
      let checkStr = floatMode? this.floatCheckStr:this.intCheckStr;
      let dotCount=0;
      for (let i = 0; i <val.length; i++) {
        let c = val[i];
        if (checkStr.indexOf(c)<0)
        {
          message.warn('不是有效的数字');
          return;
        }
        if (c === '.')
        {
          dotCount ++;
        }
      }
      if (floatMode)
      {
        if (val.startsWith("."))
        {
          val = '0'+val;
        }
        if (!parseFloat(val) || isNaN( parseFloat(val)) || dotCount>1)
        {
          message.warn('不是有效的小数');
          return ;
        }
      }
      md.destroy();
      if (onSubmit)
      {
        let ret = floatMode? parseFloat(val): parseInt(val);
        onSubmit(ret);
      }
    }
    else
    {
      message.warn('输入内容为空');
    }
  }}
  />,
        okButtonProps:{hidden:true},
        cancelButtonProps:{hidden:true}
      }
    )
  }
}

export default NumberInputForm;
