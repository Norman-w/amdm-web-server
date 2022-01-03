/*
2022年01月03日14:29:35
构建基础的sdk调用客户端,他支持通过websocket,http,https来访问请求
构造函数中 address(ip) 为必填项, 类型也为必填项, 端口可以不指定.
如果不指定端口,默认的 http为80端口,https为443端口,ws为80端口,wss为443端口
* */
import doPost from './WebUtils';

/// <reference path = "./Domain/BaseRequestAndResponse.ts" />
import {SDKClient} from './Domain/BaseRequestAndResponse';
const {BaseResponse} = SDKClient;
declare namespace SDKClient {
    export class DefaultClient {
        set url(value:string) {
            this._url = value;
        }
        //region 构造函数
        constructor(props: {
                        address: string,
                        type: 'ws' | 'wss' | 'http' | 'https',
                        path? :string,
                        port?: number,
                    }
        ) {
            this._url = props.type;
            this._url +='://';
            this._url +=props.address;
            if (props.port)
            {
                this._url += ':'+props.port;
            }
            // this.url += '/';
            if (props.path)
            {
                this._url += props.path;
            }
        }

        //endregion

        //region 私有全局变量
        private _url :string;
        //endregion

        //region 公共全局变量
        public Execute(
            //要执行的请求Request
            request:IRequest<BaseResponse>,
                       //请求使用的session,非必须
                       session?:string,
                       //请求的时间戳,如果不指定,使用当前时间
                       timeStamp?:number,
                       //请求成功后的回调函数,只要网络成功就是成功.否则是失败.
                       doRequestSuccess?:any,
            ///请求失败的回调函数,不关心返回的结果如何,这个失败是指示网络请求是否成功或者失败.
            doRequestFail?:any,
        ) {
            let apiName = request.GetApiName();
            doPost({
                url:this._url,
                headers:{},
                params:{
                    ...request,
                    method:apiName
                },
                finish:(res:any)=>{
                    if(doRequestSuccess)
                    {
                        doRequestSuccess(res);
                    }
                }
            });
        }

        //endregion

        //region 私有方法

        //endregion

        //region 公共方法
        //endregion

        //region 回调函数
        //endregion
    }
// const defaultClient = new DefaultClient({address:'localhost',type:'http'});
// export default defaulClient;
}