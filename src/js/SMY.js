/**
 * Created by 王军 on 2017/7/4.
 */

module.exports = {
    getBusBase(bus) {
        "use strict";
        return new Promise((resolve, reject) => {
            fetch("./api/getBusBase?name=" + bus, {
                method: 'get'
            }).then((response) => {
                if(response.status == 200) {
                    return response.json();
                }
            }).then((response) => {
                if(response.line_id) {
                    fetch("./api/getBusStop?name=" + bus + "&lineid=" + response.line_id, {
                        method: 'get'
                    }).then((response) => {
                        if(response.status == 200) {
                            return response.json();
                        }
                    }).then((response) => {
                        resolve(response);
                    })
                }
            }).catch(error => {
                console.log(error);
            })
        })
    }
};

