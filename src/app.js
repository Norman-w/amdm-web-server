import {message} from 'antd'

class App {
    debugMode = true;
    setting= {
        clientSideAMDMControlPanelRouterUrl:'http://192.168.2.191:8080/',
        clientSideApiRouterUrl:'http://192.168.2.191/clientside/apirouter/?method=',
        serverSideApiRouterUrl:'http://192.168.2.191/serverside/apirouter/?method=',
    };
    account;
    session;
    constructor() {
        // let hostname = window.location.hostname;
        //
        // if(hostname)
        // {
        //     this.setting = require('./appSetting.json');
        //     this.setting = this.setting[hostname];
        // }
    }
    define = {
        //小时,分钟,秒的 <picker>的选择器的数据,小程序默认只支持小时和分钟的,不支持到秒的.所以定义这个数据
        hoursMinutesSecondsPickerDataArr: [],
        load_status_loading: 'loading',
        load_status_loaded: 'loaded',
        load_status_none: 'none',
        load_status_all: 'all',
    };
    request = function ({api, params, success, errProcFunc, failProcFunc, session, dest}) {
        // console.log('执行请求:', api, params, success, errProcFunc,failProcFunc, serviceName,session);
        if (!this.session) {
            let msg = 'invalid session err in request func at app.js' + api;
            if (failProcFunc) {
                failProcFunc(msg);
            } else {
                //message.error(msg);
                console.log('%c' + msg, 'color:red;font-size:18px');
            }
        }

        let url = this.setting.clientSideApiRouterUrl;
        if (dest === 'server')
        {
            url = this.setting.serverSideApiRouterUrl;
        }
        let s = '';
        if(session)
        {
            s= session;
        }
        else if (this.session)
        {
            s = this.session;
        }
        url += api
            + "&session="
            + s;
        if (params !== undefined) {
            for (var val in params) {
                url += "&" + val + "=" + params[val];
            }
        }
        fetch(url).then(
            response => {
                console.log('fetch的response是:',response);
                return response.json()
            }
        ).then(
            // data=>console.log('fetch后的结果是:',data)
            (data) => {
                if (data) {
                    // if (this.debugMode) {
                        console.log('获取到data:', data);
                    // }
                    if (data.IsError === true)// || !data.ErrMsg || !data.ErrCode)
                    {
                        if (errProcFunc) {
                            errProcFunc(data)
                        } else {
                            message.warn(JSON.stringify(data));
                            if (this.debugMode)
                                console.log('%c在home.js中未获取到错误处理函数,由控制台输出,request发生错误:' + data.ErrMsg, 'color:red;font-size:12px');
                        }
                    } else {
                        if (success) {
                            success(data);
                        }
                    }
                } else {
                    if (failProcFunc) {
                        failProcFunc();
                    }
                }
            }
        ).catch((e)=>
        {
            console.error('app.js,fetch获取到json,进行回调函数的调用时发生错误e:',e,
                '请求名称:',api,
                '参数集:',params,
                '执行成功回调函数:', success,
                '服务器返回错误消息回调函数:',errProcFunc,
                '发生网络等错误回调函数:',failProcFunc,
                // '服务名称', serviceName,
                '授权码:',session,
                'url:', url
            );
        });
    }

    //region 使用post的方式请求自建服务器
    doPost = function ({url,headers,params,finish})
    {
        let isTimeout = false;
        //中断控制器
        let controller = new AbortController();
        let signal = controller.signal;

        let request = new Request(url, {
            method:'post',
            headers:headers,
            body:JSON.stringify(params),
            signal:signal
        });

        //超时控制器
        let timeoutPromise = (timeout) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    isTimeout = true;
                    resolve(new Response("timeout", { status: 504, statusText: "timeout " }));
                    controller.abort();
                }, timeout);
            });
        }
        //请求控制器
        let requestPromise = (request) => {
            return fetch(request);
        };
        Promise.race([timeoutPromise(3000), requestPromise(request)])
            .then(
                (response)=> {
                    if (isTimeout)
                    {
                        //超时了不需要请求的结果了,给的response其实是个error
                    }
                    else
                    {
                        // console.log('请求完了request以后,response是:', response);
                        let result = response.json();
                        // console.log('request请求完,result:', result);//result是一个promise
                        result.then(
                            (json) => {
                                console.log('请求得到了返回 json:', json);
                                if (finish)
                                {
                                    finish(json);//执行回调函数
                                }
                            }
                        )
                    }

                }
            )
            .catch(error => {
                console.log(error);
            });
    }
    //endregion
    // 获取cookie
    getCookie(key) {
        const name = key + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            const c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    // 设置cookie,默认是30天
    setCookie(key, value) {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toGMTString();
        document.cookie = key + "=" + value + "; " + expires;
    }
}
const app = new App();
export default app;
