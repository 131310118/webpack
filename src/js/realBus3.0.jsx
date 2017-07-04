/**
 * Created by 王军 on 2017/6/30.
 */

'use strict';

import React, {Component} from "react";
import ReactDOM from 'react-dom';
import gd from './GD.js';
import Header from './header/header.jsx';

require('../css/font-awesome.min.css');
var scale = 1 / devicePixelRatio;
document.querySelector('meta[name="viewport"]').setAttribute('content','initial-scale=' + scale + ',' +
    'maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';

export default class RealBus extends Component {
    constructor() {
        super();
        gd.geolocation.then((geolocation) => {
            gd.map.addControl(geolocation);
            geolocation.getCurrentPosition();
            AMap.event.addListener(geolocation, 'complete', this.onComplete);
            AMap.event.addListener(geolocation, 'error', this.onError);
        });
    };
    onComplete(info) {

    };
    onError(info) {

    };
    render() {
        return (
            <div>
                <Header gd={gd}/>
            </div>
        )
    }
}

ReactDOM.render(<RealBus />, document.getElementById('realbus'));

