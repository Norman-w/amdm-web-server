import React from 'react';
import classNames from "../status.module.css";
import {Result} from "antd";

function LostAmdmConnect(props) {
    return (<div hidden={props.onLine} className={classNames.main}>
            <Result
                status="warning"
                title="付药机系统未启动或网络不可达."
            />
        </div>
    );
}

export default LostAmdmConnect;