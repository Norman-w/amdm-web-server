import React, {Component} from 'react';
import classNames from './CustomerSupport.module.css';
class CustomerSupport extends Component {
  render() {
    let phone='19803356298';
    return (
      <div className={classNames.main} >
        <div className={classNames.content}>
          <div className={classNames.logo}>CK</div>
          <div className={classNames.cpName}>河北潮咖医疗科技</div>
          <div className={classNames.subTitle}>客服电话:{phone}</div>
        </div>
      </div>
    );
  }
}

export default CustomerSupport;
