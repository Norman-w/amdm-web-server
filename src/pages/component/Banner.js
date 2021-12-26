import React, {Component} from 'react';
import classNames from './Banner.module.css';

class Banner extends Component {
    render() {
        return (
            <div className={classNames.main}>
                上面的横条
            </div>
        );
    }
}

export default Banner;