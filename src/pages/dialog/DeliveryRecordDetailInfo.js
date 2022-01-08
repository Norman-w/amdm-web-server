import React, {Component} from 'react';
import {Image, message, Spin} from "antd";
import app from "../../app";
// import classNames from "../fulfillRecord.module.css";

class DeliveryRecordDetailInfo extends Component {
    componentDidMount() {
        if (this.props.detail) {
            this.setState({detail:this.props.detail});
            this.loadDetailImages(this.props.detail.Id);
        }
    }
    componentWillUnmount() {
    }

    loadDetailImages(id)
    {
        if (id)
        {
            if (this.state.imagesLoading)
            {
            }
            else
            {
                this.setState({imagesLoading:true},
                    ()=>
                    {
                        let that = this;
                        app.doPost2(
                            {
                                url: app.setting.clientSideApiRouterUrl,
                                apiName: 'snapshots.get',
                                params:
                                    {
                                        ParentType:'DeliveryRecordDetail',
                                        ParentId:id,
                                    },
                                onFinish:(res)=>
                                {
                                    console.log('获取完毕,res:', res);
                                    if (!res.Snapshots || res.IsError)
                                    {
                                        message.error(res.ErrMsg);
                                        that.setState({imagesLoading:false});
                                    }
                                    else
                                    {
                                        that.setState({
                                            images : res.Snapshots,imagesLoading:false
                                        });
                                    }
                                }
                                ,onTimeout:()=>
                                {
                                    message.warn('获取凭据图片超时');
                                    that.setState({imagesLoading:false});
                                },
                                abortController :this.abortController,
                                timeoutMS:2000,
                            }
                        )
                    })
            }
        }
    }

    state={
        detail:null,
        imagesLoading:false,
        images:[]
    }

    abortController = new AbortController();

    render() {
        if (!this.state.detail)
        {
            return <Spin/>
        }
        let imagesElements = [];
        for (let i = 0; i < this.state.images.length; i++) {
            imagesElements.push(
                <div>
                    <div>{this.state.images[i].Location}</div>
                    <Image src={this.state.images[i].FileUrl}/>
                </div>
                )
        }
        return (
            <div>
                {imagesElements.length>0?imagesElements:'无图片'}
            </div>
        );
    }
}

export default DeliveryRecordDetailInfo;