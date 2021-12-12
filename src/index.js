import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SiderDemo from "./Main";
// import 'antd/dist/antd.css';
// import * as AAA from 'Main';

ReactDOM.render(
  <React.StrictMode>
    <SiderDemo/>
  </React.StrictMode>,
  document.getElementById('root')
);
if(module.hot)
{
  module.hot.accept();
}
