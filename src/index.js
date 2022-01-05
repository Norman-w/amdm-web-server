import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Main from "./Main";

//这一行可以少.
// import moment from 'moment';
//这一行不能少.
import 'moment/locale/zh-cn';
import locale from 'antd/lib/locale/zh_CN';
import { ConfigProvider } from 'antd';

// import 'antd/dist/antd.css';
// import * as AAA from 'Main';

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={locale}>
        <Main/>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
if(module.hot) {
    module.hot.accept();
}
