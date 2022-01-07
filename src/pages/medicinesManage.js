// 当进入页面和搜索的时候  应该和实际请求搜索的函数分开.具体2021年12月27日17:59:38 明天再测试

import React, {Component} from 'react';
import {Input, Button, message, Table, Modal} from 'antd';
import classNames from './medicinesManage.module.css';
import app from "../app";
import MedicineInfo from "./dialog/MedicineInfo";

const {Search} = Input;
const defaultPageSize = 10;

class MedicinesManage extends Component {
  state={
    data:[],
    searchingName:'',
    searchingBarcode:'',
    searchingCompany:'',
    loading:false,
    pagination: {
      current: 1,
      pageSize: defaultPageSize,
    },
  }
  columns = [
    {
      title: 'HIS码',
      dataIndex: 'IdOfHIS',
      key: 'IdOfHIS',
      // width:80,
      // render: text => <div style={{color:'red'}}>{text}</div>,
    },
    {
      title: '名称',
      dataIndex: 'Name',
      key: 'Name',
      // width:80,
      // render: text => <div>{text}</div>,
    },
    {
      title: '条码',
      dataIndex: 'Barcode',
      key: 'Barcode',
      // width: 120
    },
    {
      title: '厂商',
      dataIndex: 'Company',
      key: 'Company',
      // width:100,
    },
    {
      title: '药盒宽',
      key: 'BoxWidthMM',
      dataIndex: 'BoxWidthMM',
      width:80,
    },
    {
      title: '药盒高',
      dataIndex: 'BoxHeightMM',
      key: 'BoxHeightMM',
      width:80,
    },
    {
      title: '药盒长',
      key: 'BoxLongMM',
      dataIndex: 'BoxLongMM',
      width: 80,
    },
    // {
    //   title: '创建时间',
    //   key: 'CreateTime',
    //   dataIndex: 'CreateTime',
    // },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render:(a,b)=>{
        // console.log('渲染收操作是:', a,b);
        return <Button type={'ghost'} onClick={()=>this.onEditMedicine(b)}>编辑</Button>
      }
    }
  ];

  abortController = new AbortController();
  componentDidMount() {
    this.onSearchMedicine(this.state.pagination);
  }


  onEditMedicine(medicine)
  {
    // console.log('要编辑的信息是:', medicine);
    this.showMedicine(medicine);
  }

  onSearchMedicine(pagination
                   // ,filters,sorter
  )
  {
    if(this.state.loading)
    {
    }
    else {
      this.setState({loading:true},
        ()=>
      {
        let pageNum = 0;
        if (pagination && pagination.current>0)
        {
          pageNum = pagination.current-1;
        }
        let pageSize=defaultPageSize;
        if (pagination && pagination.pageSize>0)
        {
          pageSize=pagination.pageSize;
        }
        let that = this;
        let api = 'medicines.get';
        let searchParam = {
          method:api,
          fields:'*',
          barcode:this.state.searchingBarcode,
          tags:this.state.searchingName,
          pageNum:pageNum,
          // pageNum:1,
          getTotalRecordCount:true,
          pageSize:pageSize
        };
        // console.log('搜索参数:', searchParam)
        app.doPost2(
          {
            url:app.setting.clientSideApiRouterUrl,
            apiName:api,
            params:searchParam,
            onFinish:(res)=>
            {
              if(res.Medicines)
              {
                console.log('搜索结果:',res);
                if (res && res.Medicines && res.Medicines.length>0)
                {
                  for (let i = 0; i < res.Medicines.length; i++) {
                    res.Medicines[i].key=res.Medicines[i].IdOfHIS;
                  }
                }
                console.log('添加了key的药品表:', res);
                let newState = {
                  data:res.Medicines,
                  pagination:{...pagination}
                }
                if (pageNum===0)
                {
                  newState.pagination.total = res.TotalRecordCount;
                }
                newState.loading=false;
                that.setState(newState);
              }
              else
              {
                message.error('没有搜索到药品,'+ res.ErrMsg);
                console.log(res);
                that.setState({loading:false});
              }

            },
            onTimeout:()=>
            {
              message.warn('获取药品信息超时');
              that.setState({loading:false});
            },
              abortController:this.abortController
          }
        )
      }
    )
    }
  }
  //region 当点击了新增药品的按钮
  // onClickCreateMedicineBtn()
  // {
  //   this.setState({showingMedicine: {}});
  // }
  // onCancelCreateMedicine()
  // {
  //   this.setState({showingMedicine:null});
  // }
  // saveMedicine(values)
  // {
  //   console.log('要添加药品:',values);
  // }
  addMedicine2Sql(medicine)
  {
    // let medicine = {
    //   Name:values.Name,
    //   Barcode:values.Barcode,
    //   Company:values.Company,
    //   BoxLongMM:values.BoxLongMM,
    //   BoxHeightMM:values.BoxHeightMM,
    //   BoxWidthMM:values.BoxWidthMM,
    // }
    let that = this;
    app.doPost2(
        {
          url:app.setting.clientSideApiRouterUrl,
          params:{
            MedicineInfoJson:JSON.stringify(medicine),
            method:'medicine.add'
          },
          onFinish:(res)=>
          {
            if (res.Success && res.NewMedicine && res.NewMedicine.Id>0) {
              Modal.success(
                  {
                    title: '添加药品信息完成',
                    content: '药品ID为:' + res.NewMedicine.Id,
                    okText: '关闭'
                  }
              );
              that.onSearchMedicine(that.state.pagination);

            }
            else
            {
              Modal.error(
                  {
                    title:'添加药品信息失败',
                    content:res.ErrMsg,
                    okText:'关闭',
                  }
              )
              console.log('添加药品信息到数据库完成', res);
            }
          },
          onTimeout:()=>
          {
            message.error('执行药品添加操作超时');
          },
        }
    )
  }
  updateMedicine2Sql(medicine)
  {
    let that = this;
    app.doPost2(
      {
        url:app.setting.clientSideApiRouterUrl,
        apiName:'medicine.update',
        params:medicine,
        onFinish:()=>
        {
          message.success('药品信息已保存');
          that.onSearchMedicine(that.state.pagination);
        },
        onTimeout:()=>
        {
          message.error('更新药品数据超时');
        },
          abortController:this.abortController,
        timeoutMS:4000,
      }
    )
  }
  deleteMedicineFromSql(id)
  {
    let that = this;
    app.doPost2(
      {
        url:app.setting.clientSideApiRouterUrl,
        apiName:'medicine.delete',
        params: {
          Id:id,
        },
        onFinish:(res)=>
        {
          if (res.IsError)
          {
            message.error(res.ErrMsg);
          }
          else
          {
            message.success('药品已删除');
          }
          that.onSearchMedicine(that.state.pagination);
        },
        onTimeout:()=>
        {
          message.error('删除药品数据超时');
        },
          abortController:this.abortController,
        timeoutMS:4000,
      }
    )
  }
  medicineInfoDialogRef = React.createRef();
  showMedicine(medicine)
  {
    let createMode = !medicine;
    const tText = createMode? '新增药品信息':'编辑药品信息';
    let that = this;
    let modal = Modal.info(
        {
          okButtonProps:{
            // loading:true,
            hidden:true
          },
          destroyOnClose:true,
          footer:null,
          icon:null,
          width:800,
          title:tText,
          content:<MedicineInfo ref={this.medicineInfoDialogRef} onSubmit={
            (newMedicine)=>
            {
              if(createMode)
              {
                //region 像数据库中添加药品信息
                delete newMedicine.Id;
                that.addMedicine2Sql(newMedicine);
                //endregion
              }
              else
              {
                //region 保存药品到数据库
                that.updateMedicine2Sql(newMedicine);
                //endregion
              }

              modal.destroy();
            }
          }
                                onDelete={(id)=>{
                                  if (id)
                                  {
                                    this.deleteMedicineFromSql(id);
                                    modal.destroy();
                                  }
                                }}
                                onCancel={()=>modal.destroy()}
                                medicine={medicine}
                                mode={createMode?'create':'edit'}
          />,
        }
    )

        // <Modal
        //     visible={visible}
        //     title={tText}
        //     okText={oText}
        //     cancelText={"取消"}
        //     onCancel={onCancel}
        //     onOk={() => {
        //       form
        //           .validateFields()
        //           .then((values) => {
        //             form.resetFields();
        //             onCreate(values);
        //           })
        //           .catch((info) => {
        //             console.log('Validate Failed:', info);
        //           });
        //     }}
        // >

        // mode= {medicine? 'create':'edit'}
        // medicine={medicine}
        // onCancel={()=>{this.onCancelCreateMedicine()}}
        // onCreate={(values)=>{this.saveMedicine(values)}}
        // visible={!!this.state.showingMedicine}
    // />
  }
  //endregion


  render() {
    let onSearchMedicine = this.onSearchMedicine.bind(this);
    let data = this.state.data;
    let loading = this.state.loading;
    // let onClickCreateMedicineBtn = this.onClickCreateMedicineBtn.bind(this);
    return (
      <div className={classNames.main}>
        <div className={classNames.titleLine}>
          药品管理
        </div>
        <div className={classNames.toolsLine}>
          <div className={classNames.searchArea}>
            <div className={classNames.nameArea}>
              <div className={classNames.nameLabel}>名称:</div>
              <Search
                  placeholder="输入要搜索的名称"
                  enterButton
                  value={this.state.searchingName}
                  onSearch={onSearchMedicine}
                  onChange={(v)=>{this.setState({searchingName:v.target.value})}}
              />
            </div>
            <div className={classNames.mobileArea}>
              <div className={classNames.mobileLabel}>条形码:</div>
              <Search placeholder="输入要搜索的条形码" enterButton
                      value={this.state.searchingBarcode}
                      onSearch={onSearchMedicine}
                      onChange={(v)=>{this.setState({searchingBarcode:v.target.value})}}
              />
            </div>
          </div>
          <div className={classNames.createArea}>
            <Button type={'primary'} style={{width:'100%'}}
                    onClick={()=>{this.showMedicine()}}
            >新增</Button>

          </div>
        </div>
        <div className={classNames.tableLine}>
          <Table
    columns={this.columns}
    dataSource={data}
    className={classNames.table}
    loading={loading}
    onChange={this.onSearchMedicine.bind(this)}
    pagination={this.state.pagination}
    />
        </div>
      </div>
    );
  }
}

export default MedicinesManage;
