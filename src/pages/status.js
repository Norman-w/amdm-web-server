import React, {Component} from 'react';
import classNames from './status.moudule.css'
class Status extends Component {
  render() {
    return (
      <div className={classNames.main}>
        当前状态
      </div>
    );
  }
}

export default Status;
