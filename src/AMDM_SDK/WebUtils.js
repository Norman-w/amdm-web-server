export default doPost ({url,headers,params,finish})
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