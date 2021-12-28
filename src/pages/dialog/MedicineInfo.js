import React, { Component } from 'react';
import {Button, Modal, Form, Input, Radio, InputNumber} from 'antd';
const validateMessages = {
    required: '必须填写${label}!',
    types: {
        // email: '${label} is not a valid email!',
        number: '${label} 不是有效的数字!',
    },
    number: {
        range: '${label} 必须介于 ${min} 到 ${max} 之间',
    },
};

class MedicineInfo extends Component {
    state={
        medicine:null
    }
    componentDidMount() {
        // console.log('组件已经加载,参数是;', this.props)
        if (this.props)
        {
            this.setState({medicine:this.props.medicine});
        }
    }
    formRef = React.createRef();
    submit() {
        // let ret = this.formRef.current.submit();
        // console.log('检查结果:',ret);

        this.formRef.current.validateFields()
            .then((values) => {
                this.formRef.current.resetFields();
                console.log('校验信息完成', values);
                this.props.onSubmit(values);
            })
            .catch((info) => {
                console.log('校验信息不合规', info);
            });
    }
    render() {
        //region 测试按钮
        let testBtn = null;
        testBtn =<Button htmlType={'submit'}>测试按钮</Button>
        // testBtn=<div onClick={()=>{
        //     // console.log('当前类中的formRef是;', this.formRef)
        //     // console.log('当前类中的formRef2是:', this.formRef2);
        //     // this.formRef.current.validateFields()
        //     // .then((values) => {
        //     //     this.formRef.current.resetFields();
        //     //     console.log('要输出的values',values);
        //     // })
        //     // .catch((info) => {
        //     //     console.log('Validate Failed:', info);
        //     // });
        // }}>测试</div>
        //endregion

        let items = null;
        if(this.formRef.current) {
            items = <div>
                <Form.Item
                    name="Barcode"
                    label="条码"
                    rules={[
                        {
                            required: true,
                            message: '必须填写有效的条码',
                        },
                    ]}
                >
                    <Input defaultValue={this.state.medicine.Barcode}/>
                </Form.Item>
                <Form.Item name="Name" label="药品名称"
                           rules={[
                               {
                                   required: true,
                                   message: '必须填写有效的药品名称',
                               },
                           ]}
                >
                    <Input type="textarea" defaultValue={this.state.medicine.Name}/>
                </Form.Item>
                <Form.Item name="Company" label="厂商">
                    <Input type="textarea" defaultValue={this.state.medicine.Company}/>
                </Form.Item>
                <div style={{
                    width: '100%',
                    // border:'1px solid red',
                    display: 'flex',
                    justifyContent: 'space-around'
                }}><Form.Item
                    // name={['user', 'age']}
                    name={'BoxLongMM'}
                    label="药盒长度毫米"
                    rules={[
                        {
                            required: true,
                            type: 'number',
                            min: 20,
                            max: 260,
                        },
                    ]}
                ><InputNumber
                    defaultValue={this.state.medicine.BoxLongMM}
                /></Form.Item>
                    <Form.Item
                        // name={['user', 'age']}
                        name={'BoxWidthMM'}
                        label="药盒宽度毫米"
                        rules={[
                            {
                                required: true,
                                type: 'number',
                                min: 10,
                                max: 300,
                            },
                        ]}
                    ><InputNumber defaultValue={this.state.medicine.BoxWidthMM}/></Form.Item>
                    <Form.Item
                        // name={['user', 'age']}
                        name={'BoxHeightMM'}
                        label="药盒高度毫米"
                        rules={[
                            {
                                required: true,
                                type: 'number',
                                min: 5,
                                max: 100,
                            },
                        ]}
                    ><InputNumber defaultValue={this.state.medicine.BoxHeightMM}/></Form.Item></div>
                <div style={{display: 'flex', justifyContent: 'space-around'}}>
                    <Button type={'primary'}
                        // htmlType={'submit'}
                            onClick={() => {
                                this.submit()
                            }}
                    >确认新增</Button>
                    <Button type={'ghost'}
                            onClick={() => this.props.onCancel()}
                    >取消</Button>
                </div>
            </div>
        }
        //如果没给定medicine的话就是创建中.
        return (
            <Form
                form={this.formRef2}
                ref={this.formRef}
                layout="vertical"
                name="form_in_modal"
                initialValues={{
                    modifier: 'public',
                }}
                validateMessages={validateMessages}
            >
                {/*{testBtn}*/}
                {items}
            </Form>
        );
    }
}

export default MedicineInfo;