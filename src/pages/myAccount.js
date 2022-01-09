import React, {Component} from 'react';
import classNames from './myAccount.module.css'
import app from "../app";
import AccountShower from "./AccountShower";


class MyAccount extends Component {
    componentDidMount() {
        console.log('我的账户页面被加载', app.account);
        if (app.account && app.account.Id>0)
        {
            console.log('app中的account:',app.account)
            this.setState({account:app.account})
        }
    }
    state=
        {
            account: undefined,
        }
    render()
    {
        return <div className={classNames.main}>
            <div>我的账户</div>
            <AccountShower account={this.state.account}/>
        </div>
    }
}

export default MyAccount;
