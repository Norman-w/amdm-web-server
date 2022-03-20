import React, {Component} from 'react';
import {Button, Input, message, Modal} from "antd";

class Content extends Component
{
  state={
    placeholder:null,
    value:null,
  }
  componentDidMount() {
    if (this.ref)
    {
      this.ref.focus();
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
        <Input ref={this.ref} placeholder={this.state.placeholder} value={this.state.value} />
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
  show(title,placeholder,defaultValue,onSubmit)
  {
    let md = Modal.confirm(
      {
        title:title,
        content:<Content placeholder={placeholder} defaultValue={defaultValue}
  onOk={(val) => {
    if (val) {
      for (let i = 0; i <val.length; i++) {
        let c = val[i];
        if ("1234567890".indexOf(c)<0)
        {
          message.warn('不是有效的数字');
          return;
        }
      }
      md.destroy();
      if (onSubmit)
      {
        onSubmit(val);
      }
    }
    else
    {
      message.warn('输入内容为空');
    }
  }}
  />,
        okButtonProps:{hidden:true},
      }
    )
  }
}

export default NumberInputForm;
