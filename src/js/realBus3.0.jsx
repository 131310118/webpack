/**
 * Created by 王军 on 2017/6/30.
 */

'use strict';

import React, {Component} from "react";
import ReactDOM from 'react-dom';
import smy from './SMY.js';
import Map from './map/map.jsx';
import Header from './header/header.jsx';
import Footer from './footer/footer.jsx';
import startIcon from '../img/start.png';
import endIcon from '../img/end.png';
import {CITY, PAGEINDEX, PAGESIZE, BUSTYPE, STATIONTYPE, POISTYPE, REALBUSICONDOWN, REALBUSICONUP} from './variables.js';

require('../css/font-awesome.min.css');
var scale = 1 / devicePixelRatio;
document.querySelector('meta[name="viewport"]').setAttribute('content','initial-scale=' + scale + ',' +
    'maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';


export default class RealBus extends Component {
    constructor() {
        super();
        console.log('realBus');

        var that = this;
        var gd = {
            setMap: map => {
                gd.map = map;
                gd.geolocation = new Promise((resolve, reject) => {
                    gd.map.plugin('AMap.Geolocation', () => {
                        var geolocation = new AMap.Geolocation({
                            enableHighAccuracy: true,//是否使用高精度定位
                            timeout: 10000,//超过10秒后停止定位
                            maximumAge: 0,//定位结果不缓存
                            convert: true,//自动偏移坐标，偏移后的坐标为高德坐标
                            showButton: true,//显示定位按钮
                            buttonPosition: 'LB',//定位按钮停靠位置，左下角
                            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量
                            showMarker: true,//定位成功后在定位到的位置显示点标记
                            showCircle: false,//定位成功后用圆圈表示定位经度范围
                            panToLocation: true,//定位成功后将定位到的位置作为地图中心点
                            zoomToAccuracy: false,//定位成功后调整地图视野范围使定位位置及经度范围视野内可见
                            //extension: 'all'
                        });
                        resolve(geolocation);
                    });
                });
            },
            startGeolocation: () => {
                gd.geolocation && gd.geolocation.then((geolocation) => {
                    gd.map.addControl(geolocation);
                    that.handle.judgePosition.setMap(document.getElementsByClassName('amap-geolocation-con')[0]);
                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, 'complete', that.onComplete);
                    AMap.event.addListener(geolocation, 'error', that.onError);
                });
            },
            stationSearchModule: new Promise((resolve, reject) => {
                AMap.plugin('AMap.StationSearch',() => {//回调函数
                    //实例化StationSearch
                    var stationSearch= new AMap.StationSearch({
                        pageIndex: PAGEINDEX, //页码
                        pageSize: PAGESIZE, //单页显示结果条数
                        city: CITY    //确定搜索城市
                    });
                    resolve(stationSearch);
                });
            }),
            stationSearch: (station, size) => {
                return new Promise((resolve, reject) => {
                    gd.stationSearchModule.then((module) => {
                        size ? module.setPageSize(size) : "";
                        module.search(station, (status, result) => {
                            if(status === 'complete' && result.info === 'OK'){
                                var stationInfo = [];
                                result.stationInfo.forEach(function(s) {
                                    if(/\(公交站\)$/.test(s.name)) {
                                        s.location = s.location.getLng() + ',' + s.location.getLat();
                                        s.address = function() {
                                            var arr = [];
                                            s.buslines.forEach(function(line) {
                                                arr.push(line.name.replace(/\(.*\)/, ''));
                                            });
                                            return arr.join(';')
                                        }();
                                        s.className = STATIONTYPE;
                                        stationInfo.push(s);
                                    }
                                });
                                resolve(stationInfo);
                            } else {
                                reject();
                            }
                        })
                    })
                })
            },
            lineSearch: (() => {
                var lineSearch = new AMap.LineSearch({
                    pageIndex: 1,
                    city: 'shanghai',
                    pageSize: 2,
                    extensions: 'all'
                });
                var flter = ['普通公交'];
                return (bus, size) => {
                    size ? lineSearch.setPageSize(size) : "";
                    return new Promise((resolve, reject) => {
                        lineSearch.search(bus, (status, result) => {
                            if(status === 'complete' && result.info === 'OK') {
                                for(var l = result.lineInfo.length - 1; l >= 0; l--) {
                                    if(flter.indexOf(result.lineInfo[l].type) == -1) {
                                        result.lineInfo.splice(l, 1);
                                    } else {
                                        result.lineInfo[l].className = BUSTYPE;
                                    }
                                }
                                result.lineInfo.forEach((line) => {
                                    var name = line.name.match(/^([^(]+)/)[0];
                                    that.cache.busline[name] ? (that.cache.busline[name].some((item) => {return item.id == line.id}) ? "" : that.cache.busline[name].push(line)) : that.cache.busline[name] = [line];
                                });
                                resolve(result.lineInfo)
                            } else {
                                reject();
                            }
                        })
                    });
                }
            })(),
            poisSearch: (pois, size) => {
                return new Promise((resolve, reject) => {
                    var params = {
                        key: '79a781fd5bc34c9c04a50d241db792c9',
                        keywords: pois,
                        city: 'shanghai',
                        citylimit: true,
                        offset: size || 50,
                        page: 1,
                        output: 'JSON'
                    };
                    var u = new URLSearchParams();
                    for(let key in params) {
                        if(params.hasOwnProperty(key)) {
                            u.append(key, params[key]);
                        }
                    }
                    fetch("https://restapi.amap.com/v3/place/text?" + u, {
                        method: 'get'
                    }).then((response) => {
                        if(response.status == 200) {
                            return response.json();
                        }
                    }).then((response) => {
                        response.pois.forEach((item) => {
                            item.className = "fa-bullseye";
                        });
                        resolve(response.pois);
                    })
                })
            },
            UI: (() => {
                var markers;
                var start;
                var end;
                var busPolyline;
                var station;
                var pois;
                return {
                    draw: (stop, type, data) => {
                        that.data = data;
                        switch (type) {
                            case BUSTYPE:
                                gd.UI.hideStation();
                                gd.UI.hidePois();
                                //绘图--start
                                if(stop[0] && start) {
                                    start.setPosition(new AMap.LngLat(stop[0].location.lng, stop[0].location.lat));
                                } else {
                                    start = new AMap.Marker({
                                        map: gd.map,
                                        position: [stop[0].location.lng, stop[0].location.lat],
                                        icon: new AMap.Icon({
                                            size: new AMap.Size(40, 50),  //图标大小
                                            image: startIcon
                                        }),
                                        zIndex: 200,
                                        extData: {
                                            stopid: stop[0].shiID,
                                            info: stop[0],
                                            index: 0
                                        }
                                    });
                                    start.on('click', that.markerClickHandle);
                                    start.show()
                                }
                                let ll = stop.length - 1;
                                if(stop[ll] && end) {
                                    end.setPosition(new AMap.LngLat(stop[ll].location.lng, stop[ll].location.lat));
                                } else {
                                    end = new AMap.Marker({
                                        map: gd.map,
                                        position: [stop[ll].location.lng, stop[ll].location.lat],
                                        icon: new AMap.Icon({
                                            size: new AMap.Size(40, 50),  //图标大小
                                            image: endIcon
                                        }),
                                        zIndex: 200,
                                        extData: {
                                            stopid: stop[ll].shiID,
                                            info: stop[ll],
                                            index: ll
                                        }
                                    });
                                    end.on('click', that.markerClickHandle);
                                    end.show();
                                }
                                busPolyline ? busPolyline.setPath(data.path) : (busPolyline = new AMap.Polyline({
                                    map: gd.map,
                                    path: data.path,
                                    strokeColoe: '#09f',
                                    strokeOpacity: 0.8,
                                    strokeWeight:6
                                }));
                                busPolyline.show();
                                var setLinePosition = (old, n, stops) => {
                                    //marker缓冲池
                                    if(markers === undefined) {
                                        markers = [];
                                    }
                                    let ii = 1;
                                    markers.forEach(function(stop) {
                                        if(ii <= old) {
                                            stop.show();
                                            stop.setPosition(new AMap.LngLat(stops[ii].location.lng, stops[ii].location.lat));
                                            stop.setExtData({
                                                stopid: stops[ii].shiID,
                                                info: stops[ii],
                                                index: ii
                                            });
                                        } else {
                                            stop.hide();
                                        }
                                        ii++;
                                    });
                                    let l = old + 1;
                                    while(n--) {
                                        var marker = new AMap.Marker({
                                            map: gd.map,
                                            position: [stops[ii].location.lng, stops[ii].location.lat],
                                            //content: '<div class="rtb_point_stop"></div>',
                                            content: '<i class="fa fa-circle" style="color: #534cef"></i>',
                                            zIndex: 150,
                                            offset: new AMap.Pixel(-6, -6),
                                            extData: {
                                                stopid: stops[ii].shiID,
                                                info: stops[ii],
                                                index: l++
                                            }
                                        });
                                        marker.on('click', that.markerClickHandle);
                                        markers.push(marker);
                                        ii++;
                                    }
                                };
                                if(markers) {
                                    if(markers.length > stop.length - 2) {
                                        setLinePosition(stop.length - 2, 0, stop);
                                    } else {
                                        setLinePosition(markers.length, stop.length - 2 - markers.length, stop);
                                    }
                                } else {
                                    setLinePosition(0, stop.length - 2, stop);
                                }
                                //绘图--end
                                if(start.getExtData().info.name === that.stopName) {
                                    this.linesearchInfo.start.emit('click', {
                                        target: start
                                    })
                                } else if(end.getExtData().info.name === that.stopName) {
                                    end.emit('click', {
                                        target: end
                                    })
                                } else {
                                    for(let a = stop.length - 2, p = 0; p < a; p++) {
                                        if(markers[p].getExtData().info.name === that.stopName) {
                                            stop[p].emit('click', {
                                                target: stop[p]
                                            });
                                            return;
                                        }
                                    }
                                }
                                gd.map.setFitView();
                                break;
                            case STATIONTYPE:
                            case POISTYPE:
                                gd.UI.hideLine();
                                gd.UI.hideStation();
                                gd.UI.hidePois();
                                var position = data.location.split(',');
                                position = new AMap.LngLat(position[0], position[1]);
                                var marker = new AMap.Marker({
                                    icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                                    position: position,
                                    clickable: true,
                                    map: gd.map,
                                    zIndex: 100,
                                    extData: data,
                                    bubble: true,
                                    label: {
                                        offset: new AMap.Pixel(2, 0)
                                    }
                                });
                                AMap.event.addListener(marker, 'click', that.stationClickHandle);
                                AMap.event.trigger(marker, 'click', {
                                    target: marker
                                });
                                gd.map.setCenter(position);
                                station = pois = marker;
                                break;
                        }
                    },
                    hideLine: () => {
                        start && start.hide();
                        end && end.hide();
                        markers && markers.forEach((marker) => {
                            marker.hide();
                        });
                        busPolyline && busPolyline.hide();
                    },
                    hideStation: () => {
                        station && station.hide();
                    },
                    hidePois: () => {
                        pois && pois.hide();
                    }
                }
            })()
        };

        this.state = {
            realTimeBus: [],
            realTimeBusHiden: true,
            collectionContent: (() => {
                var collections = [];
                if(window.localStorage) {
                    if(localStorage.collections) {
                        collections = JSON.parse(localStorage.collections);
                    }
                }
                return collections;
            })()
        };
        this.cache = {
            busline: (() => {
                var search = [];
                var cache = {};
                if(window.localStorage) {
                    if(localStorage.search) {
                        search = JSON.parse(localStorage.search);
                    }
                }
                search.map(item => {
                    "use strict";
                    if(item.data.className == BUSTYPE) {
                        var name = item.data.name.match(/^([^(]+)/)[0];
                        cache[name] = cache[name] ? cache[name] : [];
                        item.data && cache[name].every((line) => {return item.data.id != line.id}) && cache[name].push(item.data);
                        item.other && cache[name].every((line) => {return item.other.id != line.id}) && cache[name].push(item.other);
                    }
                });
                return cache;
            })()
        };
        this.id = undefined;
        this.stopName = undefined;
        this.stationName = undefined;
        this.lineName = undefined;
        this.data = undefined;
        this.gd = gd;
        this.handle = {
            lineChangeHandle: (stop, data) => {
                this.setState({
                    realTimeBus: [data],
                    realTimeBusHiden: false
                });
            },
            realTimeBusInfoIconUpdate: (index) => {
                this.state.realTimeBus[index].realTimeBusInfoIcon  = (this.state.realTimeBus[index].realTimeBusInfoIcon == REALBUSICONUP ? REALBUSICONDOWN : REALBUSICONUP);
                this.setState(this.state);
            },
            realTimeBusInfoStopAtUpdate: (index, stopId) => {
                this.state.realTimeBus[index].stopAt = stopId;
                //smy.getArriveBase(that.busName)
                this.setState(this.state);
            },
            stationChangeHandle: (stop, data) => {
                this.setState({
                    realTimeBusHiden: true
                })
            },
            poisChangeHandle: (stop, data) => {
                this.setState({
                    realTimeBusHiden: true
                })
            },
            mergeLineInfo: (data, type) => {
                return new Promise((resolve, reject) => {
                    switch (type) {
                        case BUSTYPE:
                            data.busName = data.name.match(/^([^(]+)/)[0];
                            data.lineName = data.start_stop + '--' + data.end_stop;
                            data.starStatus = this.state.collectionContent.some((item) => {return item.id == data.id}) ? 'fa fa-star': 'fa fa-star-o';
                            data.realTimeBusStatus = 'fa fa-bus';
                            data.realTimeBusMsg = "实时公交加载中...";
                            data.realTimeBusInfoIcon = REALBUSICONDOWN;
                            data.stopAt = undefined;
                            smy.getBusBase(data.busName).then((busInfo) => {
                                data.firstBusTime = busInfo.start_earlytime;
                                data.lastBusTime = busInfo.start_latetime;
                                smy.getBusStop(data.busName, busInfo.line_id).then((lines) => {
                                    data.isSingleLine = !(lines['lineResults1'].stops && lines['lineResults0'].stops);
                                    //未获取到数据
                                    if (!lines['lineResults1'].stops || !lines['lineResults0'].stops) {
                                        return;
                                    }
                                    //数据校正--start
                                    var direction;
                                    if (!data.isSingleLine) {
                                        var left, right;
                                        for (let stop of lines['lineResults1'].stops) {
                                            left = data.via_stops.findIndex((item) => {
                                                return item.name == stop.zdmc.replace('（', '(').replace('）', ')')
                                            });
                                            if (left != -1) {
                                                break;
                                            }
                                        }
                                        for (let stop of lines['lineResults0'].stops) {
                                            right = data.via_stops.findIndex((item) => {
                                                return item.name == stop.zdmc.replace('（', '(').replace('）', ')')
                                            });
                                            if (right != -1) {
                                                break;
                                            }
                                        }
                                        if (left < right) {
                                            direction = 'lineResults1';
                                        } else {
                                            direction = 'lineResults0';
                                        }
                                    }
                                    var stop = [];
                                    var differentSD = [];
                                    var jStart = 0;
                                    for (let i = 0, l = data.via_stops.length; i < l; i++) {
                                        for (let j = jStart, k = lines[direction].stops.length; j < k; j++) {
                                            if (data.via_stops[i].name == lines[direction].stops[j].zdmc.replace('（', '(').replace('）', ')')) {
                                                if (differentSD.length == j - jStart && differentSD.length != 0) {
                                                    for (let q = 0, w = differentSD.length; q < w; q++) {
                                                        differentSD[q].shiID = lines[direction].stops[jStart + q].id;
                                                        stop.push(differentSD[q]);
                                                    }
                                                }
                                                differentSD.length = 0;
                                                data.via_stops[i].shiID = lines[direction].stops[j].id;
                                                stop.push(data.via_stops[i]);
                                                jStart = j + 1;
                                                break;
                                            } else if (j == k - 1) {
                                                differentSD.push(data.via_stops[i]);
                                            }
                                        }
                                    }
                                    //数据校正--end
                                    resolve(stop);
                                });
                            });
                            break;
                        case STATIONTYPE:
                        case POISTYPE:
                            resolve(data);
                            break;
                    }
                })
            },
            changeDirectionHandle: () => {
                if(that.data.busName && that.cache.busline[that.data.busName] && that.cache.busline[that.data.busName].length > 1) {
                    for(let data of that.cache.busline[that.data.busName]) {
                        if(data.id != that.data.id) {
                            that.handle.mergeLineInfo(data, BUSTYPE).then((result) => {
                                for(let i = 0, j = that.state.realTimeBus.length; i < j; i++) {
                                    if(that.state.realTimeBus[i].id == that.data.id) {
                                        data.realTimeBusInfoIcon = that.state.realTimeBus[i].realTimeBusInfoIcon;
                                        that.data = data;
                                        that.state.realTimeBus[i] = data;
                                        break;
                                    }
                                }
                                gd.UI.draw(result, BUSTYPE, data);
                                that.setState({
                                    realTimeBus: that.state.realTimeBus
                                })
                            });
                            break;
                        }
                    }
                }
            },
            judgePosition: (() => {
                var amap;
                var o = {
                    setMap: function() {
                        amap = document.getElementsByClassName('amap-geolocation-con')[0];
                        this.then && this.then();
                    },
                    setPosition: height => {
                        if(amap) {
                            amap.style.bottom = height;
                        } else {
                            o.setMap.prototype.then = function() {
                                amap.style.bottom = height;
                            }
                        }
                    }
                };
                return o;
            })()
        }
    };
    onComplete(info) {

    };
    onError(info) {

    };
    markerClickHandle() {

    };
    stationClickHandle() {};
    render() {
        return (
            <div className="realBusRoot">
                <Map gd={this.gd} handle={this.handle}></Map>
                <Header gd={this.gd} handle={this.handle} collectionContent={this.state.collectionContent} cache={this.cache}/>
                <Footer gd={this.gd} handle={this.handle} realTimeBus={this.state.realTimeBus} realTimeBusHiden={this.state.realTimeBusHiden}/>
            </div>
        )
    }
}

ReactDOM.render(<RealBus />, document.getElementById('realbus'));

