import React, {Component} from 'react';
import classNames from './GridUsingRecordPicView.module.css'
import {Divider,Checkbox,Spin,Radio, Space, Button, message, Image} from "antd";
import app from "../../app";
const CheckboxGroup = Checkbox.Group;

const
    PageSwitchModeEnum=
        {
            循环查看各机位:0,
            只看当前机位:1,
        };
// const
//     关注位置=
//         {
//             看动作前后:0,
//             只看动作前:1,
//             只看动作后:2
//         }
const plainOptions = ['动作前','动作后','执行时'];
const defaultCheckedList = ['动作后','执行时'];
class GridUsingRecordPicView extends Component {
    state={
        loading:false,
        // interestPos:关注位置.看动作前后,
        //关注的动作时间点,1 2 3 分别是 动作前 动作后 动作执行时
        // interestTimePoint:[1,2,3],
        viewMode:PageSwitchModeEnum.循环查看各机位,
        snaps:[],
        currentSnap:null,
        currentStockIndex: null, currentFloorIndex :null, currentGridIndex:null,
        currentPageNum:0,
        sortByTimeDescMode:true,
        checkedList:defaultCheckedList,
        indeterminate:true,
        checkAll:false,
    }
    // onChangeInterestPos(e)
    // {
    //     // console.log('内容是:',e.target.value);
    //     this.setState({interestPos:e.target.value});
    // }
    onChangeViewMode(e)
    {
        this.setState({viewMode:e.target.value});
    }
    getGrids(loaded, max)
    {
        let gridStyle = {
            width: ''+(100/max).toFixed(0)+'%'
        };
        let ret = [];
        for (let i = 0; i < max; i++) {
            let cls = classNames.inventoryHas;
            if (i>=loaded)
            {
                cls=classNames.inventoryEmpty;
            }
            else
            {
            }
            let div = <div id={'存量电池1'} className={cls} style={gridStyle}/>
            ret.push(div);
        }
        return ret;
    }
    abortController = new AbortController();
    getClipInOutRecordSnaps(stockIndex,floorIndex,gridIndex,pageSize,pageNum, callback, reDoFunc)
    {
        if (this.state.loading)
        {
            return;
        }
        this.setState({loading:true}
        ,()=>
            {
                let api='clip.inoutrecord.snap.get';
                let that = this;
                app.doPost2(
                    {
                        url:app.setting.clientSideApiRouterUrl,
                        apiName:api,
                        params:{
                            stockIndex,floorIndex,gridIndex,pageSize,pageNum,
                            orderByTimeDescMode:this.state.sortByTimeDescMode,
                        },
                        onFinish:(res)=>
                        {
                            // console.log('获取弹夹进出记录截图结果:',res);
                            if (res.IsError)
                            {
                                message.warn(res.ErrMsg);
                                that.setState({loading:false});
                            }
                            else
                            {
                                if (res.Snaps&& res.Snaps.length>0) {
                                    let newSnaps = that.state.snaps.concat(res.Snaps);
                                    console.log('当前的所有拍照记录是:', newSnaps);
                                    let newState = {snaps: newSnaps, loading: false};
                                    if (!that.state.currentSnap)
                                    {
                                        newState.currentSnap = newSnaps[0];
                                    }
                                    that.setState(newState,()=>{
                                        if (callback)
                                        {
                                            let callbackRet = callback();
                                            //如果这次网络获取获取到的记录还是不够用的话 继续执行一次 直到获取到没结果.
                                            if (!callbackRet && reDoFunc)
                                            {
                                                reDoFunc();
                                            }
                                        }
                                    });
                                }
                                else
                                {
                                    that.setState({snaps: [], loading: false});
                                }
                                // console.log('获取到的结果是:', res.Snaps);
                            }
                        },
                        onFail:(t)=>
                        {
                            message.error(t?'请求超时请稍后再试':'请检查网络连接');
                            that.abortController = new AbortController();
                            that.setState({loading:false});
                        },
                        abortController:this.abortController,
                    }
                )
            }
        );

    }
    onClickPre()
    {
        let index = this.state.snaps.indexOf(this.state.currentSnap);
        // console.log('当前图片:', this.state.currentSnap);
        if (index>=0)
        {
            index --;
            if (index<0)//如果当前数组里面没有图了,继续加载
            {
                let pageNum = this.state.currentPageNum -1;
                if (pageNum <0)
                {
                    message.warn('没有数据了');
                    return;
                }
                message.success('请稍后,正在加载新记录');
                this.setState({currentPageNum:this.state.currentPageNum-1},
                    ()=>
                    {
                        this.getClipInOutRecordSnaps(this.state.currentStockIndex,
                            this.state.currentFloorIndex,
                            this.state.currentGridIndex,
                            10,
                            this.state.currentPageNum,
                            null,null
                        );
                    });
            }
            else
            {
                this.showPre();
            }
        }
    }
    onClickNext()
    {
        let index = this.state.snaps.indexOf(this.state.currentSnap);
        // console.log('当前图片:', this.state.currentSnap);
        if (index>=0)
        {
            index ++;
            if (index>=this.state.snaps.length || this.getNeighbour(false) == null)
            {
                message.success('请稍后,正在加载新记录');
                this.setState({currentPageNum:this.state.currentPageNum+1},
                    ()=>
                    {
                        this.getClipInOutRecordSnaps(this.state.currentStockIndex,
                            this.state.currentFloorIndex,
                            this.state.currentGridIndex,
                            10,
                            this.state.currentPageNum,
                            this.showNext.bind(this),
                            this.onClickNext.bind(this),
                        );
                    });
            }
            else
            {
                this.showNext();
            }
        }
    }
    //region 单纯的切换图片到下一个或者上一个,在执行这个操作的时候要保证已经获取完了数据
    showNext()
    {
        let next = this.getNeighbour(false);
        if (next) {
            this.setState({currentSnap: next});
            return true;
        }
        else
        {
            message.warn('向后没有查询到符合条件的图片,' + '当前页码:'+ (this.state.currentPageNum +1));
            return false;
        }
    }
    showPre()
    {
        let pre = this.getNeighbour(true);
        if (pre) {
            this.setState({currentSnap: pre});
            return true;
        }
        else
        {
            message.warn('前面没有符合条件的图片,' + '当前页码:'+ (this.state.currentPageNum +1));
            return false;
        }
    }
    //endregion
    //获取相邻的图
    getNeighbour(toPre)
    {
        let current = this.state.currentSnap;
        //当前显示的图片是在当前的集合中的什么位置.
        let currentIndex = this.state.snaps.indexOf(current);
        //当前显示的图片的机位
        let currentLocation = current.Location;
        //当前显示的图片是在动作的什么时候拍的.
        // let currentTimePoint = current.TimePoint;
        //下一张图
        if (current <= 0)
        {
            //根本没找到当前的图,基本上是不可能的.
            return null;
        }
        let nextIndex = currentIndex;
        let rightNext = null;
        while(true)
        {//超出界限的时候就跳出
            if (toPre)
            {
                nextIndex --
                if (nextIndex<0)
                {
                    break;
                }
            }else {
                nextIndex++;
                if (this.state.snaps.length<= nextIndex)
                {
                    break;
                }
            }

            let tempNext = this.state.snaps[nextIndex];
            let locationOk = true;
            let interestLocation = false;
            if (this.state.viewMode === PageSwitchModeEnum.只看当前机位 && tempNext.Location !== currentLocation)
                {
                    locationOk = false;
                    // console.log('不是当前机位')
                    continue;
                }
            if (this.state.checkedList.indexOf('动作前')>=0 && tempNext.TimePoint === 1)
            {//包含动作前但是当前图不是动作前
                interestLocation = true;
            }
            else if (this.state.checkedList.indexOf('动作后')>=0 && tempNext.TimePoint === 2 && !interestLocation)
            {
                interestLocation = true;
            }
            else if (this.state.checkedList.indexOf('执行时')>=0 && tempNext.TimePoint === 3 && !interestLocation)
            {
                interestLocation = true;
            }
            if (!interestLocation)
            {
                continue;
            }
            rightNext = tempNext;
            break;
        }
        return rightNext;
    }
    onClickTest()
    {
        this.setState({currentStockIndex:0,currentFloorIndex:3,currentGridIndex:3,snaps:[],currentSnap:null},
            ()=>{
                this.getClipInOutRecordSnaps(this.state.currentStockIndex,this.state.currentFloorIndex,this.state.currentGridIndex,100,this.state.currentPageNum);
            })
    }
    onCheckAllChange(e)
    {
        this.setState(
            {
                checkedList:e.target.checked ? plainOptions : [],
                indeterminate:false,
                checkAll:e.target.checked,
            }
        )
    }
    onChangeCheck(list)
    {
        let state =
            {
                checkedList: list,
                indeterminate: !!list.length && list.length < plainOptions.length,
                checkAll: list.length === plainOptions.length,
            }
            this.setState(state);
    }
    render() {
        let currentSnap = this.state.currentSnap?this.state.currentSnap:{};
        //是否成功
        let success = !currentSnap.OutIsErr && ! currentSnap.InIsError;
        //是在动作发生之前还是之后
        let timePoint = '-';
        if (currentSnap.TimePoint === 1)
        {
            timePoint = '前';
        }
        else if(currentSnap.TimePoint === 2)
        {
            timePoint = '后';
        }
        //是否显示位置信息
        let showTimePoint = true;
        //是否为入库
        let isInStock = currentSnap.InOrOut === 'In';
        //图片的标题,当前使用图片拍摄原因
        let picTitle = currentSnap.Because;
        //动作的结束时间
        let startTime =isInStock?currentSnap.InDetailTime : currentSnap.OutStartTime;
        //动作的开始时间
        let endTime =  isInStock?currentSnap.InDetailTime: currentSnap.OutEndTime;
        //要单张过模式还是同机位模式
        let viewMode = this.state.viewMode;
        //要看哪个地方的摄像机
        // let interestPos = this.state.interestPos;
        //格子的最大存量是多少
        let maxLoadAbleCount = 6;
        //格子的当前存量是多少
        let currentCount = 4;
        //当点击上一张图
        let onClickPre = this.onClickPre.bind(this);
        //当点击下一张图
        let onClickNext = this.onClickNext.bind(this);
        //图片地址
        let picUrl = currentSnap.FileUrl? app.setting.SnapshotUrlBase+currentSnap.FileUrl : null;

        //是进入还是取出
        let inOrOut = currentSnap.InOrOut>0?'入槽':'取出';

        let loading = this.state.loading;
        let loadingDom = <Spin/>;
        let actionsDomList = <><Button size={'large'}
                                    onClick={onClickPre}
        >上一张</Button>
            <Button size={'large'}
                    onClick={this.onClickTest.bind(this)}
            >测试取图</Button>
            <Button size={'large'}
                    onClick={onClickNext}
            >下一张</Button></>
        // console.log(picUrl);
        return (
            <div className={classNames.main}>
                <div id={'标题行'} className={classNames.titleLine}>
                    <div id={'取药时间点标示行'} className={classNames.topLeft}>
                        {showTimePoint && <div className={classNames.topLeftBackground}/>}
                        {showTimePoint && <div className={classNames.topLeftText}>{timePoint}</div>}
                    </div>
                    <div id={'状态标识区'} className={classNames.topRight}>
                        <div className={success ? classNames.topRightBackgroundSuccess : classNames.topRightBackgroundFail}/>
                        <div className={classNames.topRightText}>{success?'成功':'失败'}</div>
                    </div>
                </div>
                <div id={'内容区'} className={classNames.contentArea}>
                    <div id={'左侧'} className={classNames.leftArea}>
                        <div id={'信息行'} className={classNames.infoLine}>
                            <div>图片名称:{picTitle}</div>
                            <div>始{startTime}至{endTime}末</div>
                        </div>
                        <div id={'图片行'} className={classNames.picLine}>
                            {picUrl && <Image height={'100%'} width={'100%'} src={picUrl} alt={'图片已不存在或不可读'}/>}
                        </div>
                        <div id={'存量行'} className={classNames.inventoryLine}>
                            <div id={'存量标题'} className={classNames.inventoryTitle}>此刻库存应为:{currentCount}/{maxLoadAbleCount}</div>
                            <div id={'存量内容'} className={classNames.inventoryContent}>
                                {this.getGrids(currentCount,maxLoadAbleCount)}
                            </div>
                        </div>
                    </div>
                    <div id={'右侧'} className={classNames.rightArea}>
                        <div className={classNames.rightAreaContent}>
                            <div>{inOrOut}</div>
                            <div id={'模式选择区'} className={classNames.modeSelectArea}>
                                <Radio.Group onChange={this.onChangeViewMode.bind(this)} value={viewMode}>
                                    <Space direction="vertical">
                                        <Radio value={PageSwitchModeEnum.循环查看各机位}>循环查看各机位</Radio>
                                        <Radio value={PageSwitchModeEnum.只看当前机位}>只看当前机位</Radio>
                                    </Space>
                                </Radio.Group>
                            </div>
                            <div id={'关注位置区'} className={classNames.locationSelectArea}>
                                <>
                                    <Checkbox indeterminate={this.state.indeterminate} onChange={this.onCheckAllChange.bind(this)} checked={this.state.checkAll}>
                                        选择全部时间点
                                    </Checkbox>
                                    <Divider />
                                    <CheckboxGroup options={plainOptions} value={this.state.checkedList} onChange={this.onChangeCheck.bind(this)} />
                                </>
                            </div>
                            <div id={'上下张动作按钮区'} className={classNames.actionArea}>
                                {loading?loadingDom:actionsDomList}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default GridUsingRecordPicView;