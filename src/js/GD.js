/**
 * Created by 王军 on 2017/6/30.
 */

import smy from './SMY.js';

module.exports = (() =>{
    "use strict";

    const LNG = 121.378860,
        LAT = 31.245039,
        ZOOM = 15,
        CITY = 'shanghai',
        PAGEINDEX = 1,
        PAGESIZE = 60,
        RESIZEEABLE = false;

    let gd = {
        map: new AMap.Map('container', {
            resizeEnable: RESIZEEABLE,
            zoom: ZOOM,
            center: new AMap.LngLat(LNG, LAT)
        }),
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
                                    result.lineInfo[l].className = 'fa-random';
                                }
                            }
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
        draw: (data, type) => {
            switch(type) {
                case 'fa-random':
                    console.log(data);
                    smy.getBusBase(data.name.match(/^([^(]+)/)[0]).then((lines) => {
                        //未获取到数据
                        if(!lines['lineResults1'].stops || !lines['lineResults0'].stops) {
                            return;
                        }
                        //数据校正--start
                        var direction;
                        if(lines['lineResults1'].stops && lines['lineResults0'].stops) {
                            var left, right;
                            for(let stop of lines['lineResults1'].stops) {
                                left = data.via_stops.findIndex((item) => {
                                    return item.name == stop.zdmc.replace('（', '(').replace('）', ')')
                                })
                            }
                            for(let stop of lines['lineResults0'].stops) {
                                right = data.via_stops.findIndex((item) => {
                                    return item.name == stop.zdmc.replace('（', '(').replace('）', ')')
                                })
                            }
                            if(left > right) {
                                direction = 'lineResults1';
                            } else {
                                direction = 'lineResults0';
                            }
                        }
                        var stop = [];
                        var differentSD = [];
                        var jStart = 0;
                        for(let i = 0, l = data.via_stops.length; i < l; i++) {
                            for(let j = jStart, k = lines[direction].length; j < k; j++){
                                if( data.via_stops[i].name == lines[direction][j].zdmc.replace('（', '(').replace('）', ')')) {
                                    if(differentSD.length == j - jStart) {
                                        for(let q = 0, w = differentSD.length; q < w; q++) {
                                            differentSD[q].shiID = lines[direction][jStart + q].id;
                                            stop.push(differentSD[q]);
                                        }
                                    }
                                    differentSD.length = 0;
                                    data.via_stops[i].shiID = lines[direction][j].id;
                                    stop.push(data.via_stops[i]);
                                    jStart = j + 1;
                                    return;
                                } else if(j = k - 1) {
                                    differentSD.push(data.via_stops[i]);
                                }
                            }
                        }
                        //数据校正--end
                    });
                    break;
                case 'fa-bus':
                    break;
                case 'fa-bullseye':
                    break;
            }
        }
    };
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
    gd.stationSearch = (station, size) => {
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
                                s.className = 'fa-bus';
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
    };
    return gd;
})();