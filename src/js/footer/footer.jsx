import React, {Component} from 'react';
import {REALBUSICONDOWN, REALBUSICONUP, STAR, STARO} from '../variables.js';
require('./footer.scss');
const REALTIMEBUSSTOP = 'realTimeBusStops';
const REALTIMEBUSSTOPHIDEN = 'realTimeBusStops slideInDown';

export default class Footer extends Component {
    constructor(props) {
        "use strict";
        super(props);
    };
    componentDidUpdate() {
        this.props.handle.judgePosition.setPosition(this.refs.footer.clientHeight + 10 + 'px');
        this.props.realTimeBus.map((item, index) => {
            "use strict";
            if(item.realTimeBusInfoIcon == REALBUSICONUP) {
                if(!item.height) {
                    this.refs["realTimeBusStops" + index].style.height = "auto";
                    this.refs["realTimeBusStops" + index].style.height = this.refs["realTimeBusStops" + index].offsetHeight + 'px';
                }
                item.height = this.refs["realTimeBusStops" + index].style.height;
                if(item.stopAt) {
                    if(item.scrollLeft != undefined) {
                        this.refs["realTimeBusStops" + index].scrollLeft = item.scrollLeft;
                    } else {
                        this.refs["realTimeBusStops" + index].scrollLeft = this.refs["stopAt" + index].offsetLeft - 2.5 * this.refs["stopAt" + index].clientWidth;
                        item.scrollLeft = this.refs["realTimeBusStops" + index].scrollLeft;
                    }
                }
            } else {
                if(!item.height) {
                    this.refs["realTimeBusStops" + index].className = REALTIMEBUSSTOP;
                    item.height = this.refs["realTimeBusStops" + index].offsetHeight + 'px';
                    this.refs["realTimeBusStops" + index].className = REALTIMEBUSSTOPHIDEN;
                }
            }
        })
    };
    realTimeBusStopsScrollHandle(index) {
        "use strict";
        return () => {
            this.props.handle.scrollLeftUpdateHandle(index, this.refs["realTimeBusStops" + index].scrollLeft);
        };
    }
    componentDidMount() {
        this.props.realTimeBus.map((item, index) => {
            "use strict";
            item.realTimeBusInfoIcon != REALBUSICONDOWN && item.stopAt && (this.refs["realTimeBusStops" + index].scrollLeft = this.refs["stopAt" + index].offsetLeft - 2.5 * this.refs["stopAt" + index].clientWidth);
            this.refs["realTimeBusStops" + index].style.height = this.refs["realTimeBusStops" + index].clientHeight + 'px';
        })
    }
    realTimeBusUpdate(index) {
        "use strict";
        return () => {
            this.props.handle.realTimeBusInfoIconUpdate(index);
        }
    };
    stopClickHandle(index, stopIndex) {
        "use strict";
        return (e) => {
            e = e || window.event;
            this.props.handle.realTimeBusInfoStopAtUpdate(index, this.props.realTimeBus[index].via_stops[stopIndex]);
            this.refs["realTimeBusStops" + index].scrollLeft = e.currentTarget.offsetLeft - 2.5 * e.currentTarget.clientWidth;
        }
    };
    collectionClickHandle(index) {
        "use strict";
        return () => {
            if(this.props.realTimeBus[index].starStatus == STAR) {
                this.props.handle.collectionDel(this.props.realTimeBus[index], index);
            } else {
                this.props.handle.collectionAdd(this.props.realTimeBus[index], index);
            }
        }
    };
    render() {
        "use strict";
        var realTimeBus = 'realTimeBus';
        realTimeBus += this.props.realTimeBusHiden ? ' hiden' : '';
        return (
            <div className="footer" ref="footer">
                <ul className="radius">
                    {[{value: 1500, name: '1.5km'},{value: 1000, name: '1km'},{value: 500, name: '500m'}].map((radius, index) => {
                        return radius.value == this.props.radius ? <li value={radius.value} className="active" key={index}>{radius.name}</li> :
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
                                            <i className={item.starStatus} onClick={this.collectionClickHandle(index)}></i>
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
                                        <ul className={item.realTimeBusInfoIcon == REALBUSICONDOWN ? REALTIMEBUSSTOPHIDEN : REALTIMEBUSSTOP} ref={"realTimeBusStops" + index} onScroll={this.realTimeBusStopsScrollHandle(index)}>
                                            {
                                                item.via_stops.map((stop, stopIndex) => {
                                                    if( item.stopAt !== stop.id) {
                                                        return (
                                                            <li key={stopIndex} className="realTimeBusStop" onClick={this.stopClickHandle(index, stopIndex)}>
                                                                <i className="circle"></i>
                                                                <span>{stop.name}</span>
                                                            </li>
                                                        )
                                                    }
                                                    return  (
                                                        <li key={stopIndex} className="realTimeBusStop" onClick={this.stopClickHandle(index, stopIndex)} ref={"stopAt" + index}>
                                                            <i className="circle active"></i>
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