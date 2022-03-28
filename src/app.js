import {message} from 'antd'

class App {
    debugMode = true;
    setting1= {
        SnapshotUrlBase :'http://192.168.2.191',
        clientSideAMDMControlPanelRouterUrl:'http://192.168.2.191:8080/',
        clientSideApiRouterUrl:'http://192.168.2.191/clientside/apirouter/',
        serverSideApiRouterUrl:'http://192.168.2.191/serverside/apirouter/',
    };
    setting= {
        SnapshotUrlBase :'http://10.10.10.17',
        clientSideAMDMControlPanelRouterUrl:'http://10.10.10.17:8080/',
        clientSideApiRouterUrl:'http://10.10.10.17/clientside/apirouter/',
        serverSideApiRouterUrl:'http://10.10.10.17/serverside/apirouter/',
    };
    setting2= {
        SnapshotUrlBase :'http://192.168.2.210',
        clientSideAMDMControlPanelRouterUrl:'http://192.168.2.210:8080/',
        clientSideApiRouterUrl:'http://192.168.2.210/clientside/apirouter/',
        serverSideApiRouterUrl:'http://192.168.2.210/serverside/apirouter/',
    };
    //付药机的设置
    amdmSetting={};
    account;
    session;
    constructor() {
        console.log(window.location.hostname);
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
        if (!app.session) {
            let msg = 'invalid session err in request func at app.js' + api;
            if (failProcFunc) {
                failProcFunc(msg);
            } else {
                //message.error(msg);
                console.log('%c' + msg, 'color:red;font-size:18px');
            }
        }

        let url = app.setting.clientSideApiRouterUrl;
        if (dest === 'server')
        {
            url = app.setting.serverSideApiRouterUrl;
        }
        let s = '';
        if(session)
        {
            s= session;
        }
        else if (app.session)
        {
            s = app.session;
        }
        url += api
            + "&session="
            + s;
        if (params !== undefined) {
            for (let val in params) {
                let key = ''+val;
                url += "&" + val + "=" + params[key];
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
                            if (app.debugMode)
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
            return new Promise((resolve
                                // , reject
            ) => {
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
                                // console.log('请求得到了返回 json:', json);
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
                console.log('执行fetch超时',error);
            });
    }
    //endregion

    //region 使用post的方式请求服务器,第二个版本 2022年01月05日13:48:08
    //当页面已经关闭了的时候,就是已经发了取消信号.如果取消信号已经发出了,那就直接取消不调用回调函数了.
    doPost2 = function ({url,apiName,params,abortController, onFinish, onFail,timeoutMS,session})
    {
        let isTimeout = false;
        //中断控制器
        let controller = abortController?abortController: new AbortController();
        let signal = controller.signal;
        //如果params里面没有给定apiName,自动填写进去
        if (!params['method'])
        {
            params['method'] = apiName;
        }
        params.session = session?session:app.session;

        let request = new Request(url, {
            method:'POST',
            headers: {
                'Content-Type':'application/json;charset=utf-8',
                apiName:apiName,
            },
            body:JSON.stringify(params),
            signal:signal,
        });
        let timeOutController = null;
        //超时控制器
        let timeoutPromise = (timeout) => {
            return new Promise((resolve
                                , reject
            ) => {
                timeOutController = setTimeout(() => {
                    isTimeout = true;
                    // resolve(new Response("timeout", { status: 504, statusText: "timeout " }));
                    let msg = '执行dopost2超时';
                    console.log('c%', 'color:red,font-size:20px', msg);
                    reject('执行dopost2超时');
                    controller.abort();
                }, timeout);
            });
        }
        //请求控制器
        let requestPromise = (request) => {
          let fetchPromise = fetch(request);
          fetchPromise.catch((reason => {
            console.log('fetch发生了错误:', reason);
            if (onFail)
            {
              onFail(isTimeout);
            }
          }))
            return fetchPromise;
        };
        Promise.race([timeoutPromise(timeoutMS?timeoutMS:200000), requestPromise(request)])
            .then(
                (response)=> {
                    if (isTimeout)
                    {
                        //超时了不需要请求的结果了,给的response其实是个error
                      if (onFail)
                      {
                        onFail(true);
                      }
                    }
                    else
                    {
                        // console.log('请求完了request以后,response是:', response);
                        let result = response.json();
                        result.catch(reason => {
                          console.log('在fetch中,未超时但执行response->json过程失败:',reason);
                          if (onFail)
                          {
                            onFail(false);
                          }
                        });
                        // console.log('request请求完,result:', result);//result是一个promise
                        result.then(
                            (json) => {
                                // console.log('请求得到了返回 json:', json);
                                if (onFinish)
                                {
                                    onFinish(json);//执行回调函数
                                }
                            }
                        )
                    }

                    //region 有了response以后就是网络请求成功了,清空计时器
                    clearTimeout(timeOutController);
                    //endregion
                }
            )
            .catch(error => {
                console.log('%c 在App.DoPost2中执行fetch超时,详细内容是:','color:red', error, 'url:',url, 'api:', apiName);
                //region 发生了错误以后,也清空计时器
                clearTimeout(timeOutController);
                //endregion
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
