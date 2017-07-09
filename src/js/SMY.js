/**
 * Created by 王军 on 2017/7/4.
 */

module.exports = (() => {
    var cacheBase = [];
    var cacheStop = [];
    var cacheArrive = [];
    var lastTime;
    return {
        getBusBase(bus) {
            "use strict";
            return new Promise((resolve, reject) => {
                if (!cacheBase[bus]) {
                    fetch("./api/getBusBase?name=" + bus, {
                        method: 'get'
                    }).then((response) => {
                        if (response.status == 200) {
                            return response.json();
                        } else {
                            //reject();
                            response = {
                                "start_latetime": "23:50",
                                "line_name": "76",
                                "end_earlytime": "04:10",
                                "start_earlytime": "04:50",
                                "end_stop": "凯旋路宜山路",
                                "line_id": "007600",
                                "start_stop": "中山北路中潭路",
                                "end_latetime": "23:10"
                            };
                            return response;
                        }
                    }).then(response => {
                        cacheBase[bus] = response;
                        resolve(response);
                    }).catch(error => {
                        console.log(error);
                        reject();
                    })
                } else {
                    resolve(cacheBase[bus]);
                }
            })
        },
        getBusStop(bus, id) {
            "use strict";
            return new Promise((resolve, reject) => {
                if (!cacheStop[id]) {
                    fetch("./api/getBusStop?name=" + bus + "&lineid=" + id, {
                        method: 'get'
                    }).then((response) => {
                        if (response.status == 200) {
                            return response.json();
                        } else {
                            //reject();
                            response = {
                                "lineResults1": {
                                    "stops": [{
                                        "id": "1",
                                        "zdmc": "凯旋路宜山路"
                                    }, {
                                        "id": "2",
                                        "zdmc": "宜山路蒲汇塘路"
                                    }, {
                                        "id": "3",
                                        "zdmc": "虹桥路宜山路"
                                    }, {
                                        "id": "4",
                                        "zdmc": "番禺路虹桥路"
                                    }, {
                                        "id": "5",
                                        "zdmc": "番禺路淮海西路"
                                    }, {
                                        "id": "6",
                                        "zdmc": "番禺路新华路"
                                    }, {
                                        "id": "7",
                                        "zdmc": "番禺路平武路"
                                    }, {
                                        "id": "8",
                                        "zdmc": "番禺路延安西路"
                                    }, {
                                        "id": "9",
                                        "zdmc": "延安西路江苏路"
                                    }, {
                                        "id": "10",
                                        "zdmc": "延安西路镇宁路"
                                    }, {
                                        "id": "11",
                                        "zdmc": "南京西路华山路(静安寺)"
                                    }, {
                                        "id": "12",
                                        "zdmc": "常德路新闸路"
                                    }, {
                                        "id": "13",
                                        "zdmc": "常德路康定路"
                                    }, {
                                        "id": "14",
                                        "zdmc": "常德路余姚路"
                                    }, {
                                        "id": "15",
                                        "zdmc": "海防路西康路"
                                    }, {
                                        "id": "16",
                                        "zdmc": "海防路江宁路"
                                    }, {
                                        "id": "17",
                                        "zdmc": "昌化路安远路"
                                    }, {
                                        "id": "18",
                                        "zdmc": "昌化路澳门路"
                                    }, {
                                        "id": "19",
                                        "zdmc": "中潭路远景路"
                                    }, {
                                        "id": "20",
                                        "zdmc": "中山北路中潭路"
                                    }],
                                    "direction": "false"
                                },
                                "lineResults0": {
                                    "stops": [{
                                        "id": "1",
                                        "zdmc": "中山北路中潭路"
                                    }, {
                                        "id": "2",
                                        "zdmc": "中潭路远景路"
                                    }, {
                                        "id": "3",
                                        "zdmc": "昌化路澳门路"
                                    }, {
                                        "id": "4",
                                        "zdmc": "昌化路安远路"
                                    }, {
                                        "id": "5",
                                        "zdmc": "海防路江宁路"
                                    }, {
                                        "id": "6",
                                        "zdmc": "海防路西康路"
                                    }, {
                                        "id": "7",
                                        "zdmc": "常德路余姚路"
                                    }, {
                                        "id": "8",
                                        "zdmc": "常德路康定路"
                                    }, {
                                        "id": "9",
                                        "zdmc": "常德路新闸路"
                                    }, {
                                        "id": "10",
                                        "zdmc": "静安寺"
                                    }, {
                                        "id": "11",
                                        "zdmc": "南京西路延安西路"
                                    }, {
                                        "id": "12",
                                        "zdmc": "延安西路江苏路"
                                    }, {
                                        "id": "13",
                                        "zdmc": "番禺路延安西路"
                                    }, {
                                        "id": "14",
                                        "zdmc": "番禺路平武路"
                                    }, {
                                        "id": "15",
                                        "zdmc": "番禺路新华路"
                                    }, {
                                        "id": "16",
                                        "zdmc": "番禺路淮海西路"
                                    }, {
                                        "id": "17",
                                        "zdmc": "番禺路虹桥路"
                                    }, {
                                        "id": "18",
                                        "zdmc": "番禺路南丹路"
                                    }, {
                                        "id": "19",
                                        "zdmc": "凯旋路宜山路"
                                    }],
                                    "direction": "true"
                                }
                            };
                            return response;
                        }
                    }).then((response) => {
                        cacheStop[id] = response;
                        resolve(response);
                    }).catch(error => {
                        console.log(error);
                        reject();
                    })
                } else {
                    resolve(cacheStop[id]);
                }
            })
        },
        getArriveBase(bus, id, direction, stopId) {
            "use strict";
            return new Promise((resolve, reject) => {
                var now = +new Date();
                if (!cacheStop[id] || lastTime + 5000 < now) {
                    lastTime = now;
                    fetch("./api/getArriveBase?name=" + bus + "&lineid=" + id + "&direction=" + direction + "&stopid=" + stopId, {
                        method: 'get'
                    }).then((response) => {
                        if (response.status == 200) {
                            return response.json();
                        } else {
                            //reject();
                            response = {};
                            return response;
                        }
                    }).then((response) => {
                        cacheArrive[id] = response;
                        resolve(response);
                    }).catch(error => {
                        console.log(error);
                        reject();
                    })
                } else {
                    cacheArrive[id]
                    resolve(cacheStop[id]);
                }
            });
        }
    }
})();

