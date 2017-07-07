import React, {Component} from 'react';
import {REALBUSICONDOWN, REALBUSICONUP} from '../variables.js';
require('./footer.scss');

export default class Footer extends Component {
    constructor(props) {
        "use strict";
        super(props);
        this.state = {
            radius: this.props.radius || 500
        }
    };
    componentDidUpdate() {
        this.props.handle.judgePosition.setPosition(this.refs.footer.clientHeight + 10 + 'px');
    };
    realTimeBusUpdate(index) {
        "use strict";
        return () => {
            this.props.handle.realTimeBusInfoIconUpdate(index);
        }
    };
    stopClickHandle(index, stopId) {
        "use strict";
        return () => {
            this.props.handle.realTimeBusInfoStopAtUpdate(index, stopId);
        }
    }
    render() {
        "use strict";
        var realTimeBus = 'realTimeBus';
        realTimeBus += this.props.realTimeBusHiden ? ' hiden' : '';
        return (
            <div className="footer" ref="footer">
                <ul className="radius">
                    {[{value: 1500, name: '1.5km'},{value: 1000, name: '1km'},{value: 500, name: '500m'}].map((radius, index) => {
                        return radius.value == this.state.radius ? <li value={radius.value} className="active" key={index}>{radius.name}</li> :
                            <li value={radius.value} key={index}>{radius.name}</li>
                    })}
                </ul>
                <div className={realTimeBus}>
                    <ul className="realTimeBusList">
                        {
                            this.props.realTimeBus.map((item, index) => {
                                return (
                                    <li key={index}>
                                        <div className="busInfo">
                                            <span className="busName" title={item.busName} onClick={this.props.handle.changeDirectionHandle}>{item.busName}</span>
                                            {((that) => {if(!item.isSingleLine) {return <i className="fa fa-exchange" onClick={this.props.handle.changeDirectionHandle}></i>}})(this)}
                                            <i className={item.starStatus}></i>
                                        </div>
                                        <div className="lineInfo">
                                            <span className="lineName" title={item.lineName}>{item.lineName}</span>
                                            <span className="time">
                                                <span className="last">末</span>
                                                <span>{item.lastBusTime}</span>
                                            </span>
                                             <span className="time">
                                                <span className="first">首</span>
                                                <span>{item.firstBusTime}</span>
                                            </span>
                                        </div>
                                        <div className="realTimeBusInfo">
                                            <i className={item.realTimeBusStatus}></i>
                                            <span className="realTimeBusMsg">{item.realTimeBusMsg}</span>
                                            <i className={item.realTimeBusInfoIcon} onClick={this.realTimeBusUpdate(index)}></i>
                                        </div>
                                        <ul className={item.realTimeBusInfoIcon == REALBUSICONDOWN ? "realTimeBusStops hiden" : "realTimeBusStops"}>
                                            {
                                                item.via_stops.map((stop, stopIndex) => {
                                                    return (
                                                        <li key={stopIndex} className="realTimeBusStop" onClick={this.stopClickHandle(index, stop.id)}>
                                                            <i className={item.stopAt === stop.id ? "circle active" : "circle"}></i>
                                                            <span>{stop.name}</span>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }
}