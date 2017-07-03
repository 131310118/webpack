/**
 * Created by 王军 on 2017/6/30.
 */

module.exports = (() =>{
    "use strict";

    const LNG = 121.378860,
        LAT = 31.245039,
        ZOOM = 15,
        CITY = 'shanghai',
        PAGEINDEX = 1,
        PAGESIZE = 60,
        RESIZEEABLE = false;

    let stationSearch, stationSearchOnload;
    let geolocation, geolocationOnload;

    AMap.plugin('AMap.StationSearch',() => {//回调函数
        //实例化StationSearch
        stationSearch= new AMap.StationSearch({
            pageIndex: PAGEINDEX, //页码
            pageSize: PAGESIZE, //单页显示结果条数
            city: CITY    //确定搜索城市
        });
        if(typeof stationSearchOnload == 'function' && stationSearch !== undefined) {
            stationSearchOnload(stationSearch);
        }
        //TODO: 使用stationSearch对象调用行政区查询的功能
    });

    let gd = {
        map: new AMap.Map('container', {
            resizeEnable: RESIZEEABLE,
            zoom: ZOOM,
            center: new AMap.LngLat(LNG, LAT)
        }),
        stationSearch: (fn) => {
            if(typeof fn == 'function' && stationSearch !== undefined) {
                fn(stationSearch);
            } else {
                stationSearchOnload = fn;
            }
        },
        geolocation: (fn) => {
            if(typeof fn == 'function' && geolocation !== undefined) {
                fn(geolocation);
            } else {
                geolocationOnload = fn;
            }
        },
        linesearch: new AMap.LineSearch({
            pageIndex: 1,
            city: 'shanghai',
            pageSize: 2,
            extensions: 'all'
        })//公交线路查询服务
    };
    gd.lineSearch = (function(that) {
        var flter = ['地铁'];
        return (bus, size) => {
            size ? that.linesearch.setPageSize(size) : "";
            return new Promise((resolve, reject) => {
                that.linesearch.search(bus, (status, result) => {
                    if(status === 'complete' && result.info === 'OK') {
                        for(var l = result.lineInfo.length - 1; l >= 0; l--) {
                            if(flter.indexOf(result.lineInfo[l].type) >= 0) {
                                result.lineInfo.splice(l, 1);
                            } else {
                                result.lineInfo[l].className = 'fa-random';
                            }
                        }
                        resolve({
                            result: result.lineInfo,
                            preBus: bus
                        })
                    } else {
                        reject();
                    }
                })
            });
        }
    })(gd);//公交线路查询

    gd.map.plugin('AMap.Geolocation', () => {
        geolocation = new AMap.Geolocation({
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
        if(typeof geolocationOnload == 'function' && geolocation !== undefined) {
            geolocationOnload(geolocation);
        }
    });
    return gd;
})();