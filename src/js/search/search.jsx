import React, {Component} from "react";
import "./search.scss"

export default class Search extends Component {
    constructor(props){
        super(props);
        console.log('search');
        this.state = {
            searchHiden: this.props.searchHiden === false ? false : true,
            searchContent: this.props.searchContent ? this.props.searchContent : "",
            searchResult: this.props.searchResult ? this.props.searchResult : [],
            resultHiden: this.props.resultHiden === false ? false : true
        };
        this.searchHistory = (() => {
            var search = [];
            var searchArr = [];
            if(window.localStorage) {
                if(localStorage.search) {
                    search = JSON.parse(localStorage.search);
                }
            }
            search.map(item => {
                "use strict";
                searchArr.push(item.data);
            });
            return {
                objArr: search,
                arr: searchArr
            }
        })();
    }
    hideClickHandle = (e) => {
        "use strict";
        this.setState({
            searchContent: "",
            searchHiden: true,
            resultHiden: false,
            searchResult: this.searchHistory.arr
        });
        this.refs.searchKeyword.focus();
    };
    searchInputHandle = (() => {
        "use strict";
        var time;
        var resultCache = {};
        var that = this;
        var search = () => {
            var value = this.state.searchContent;
            let resultHandle = (result) => {
                resultCache[value] = result;
                if(value == this.state.searchContent) {
                    this.setState({
                        resultHiden: false,
                        searchResult: resultCache[value]
                    });
                }
            };
            if(resultCache[value]) {
                this.setState({
                    resultHiden: false,
                    searchResult: resultCache[value]
                });
            } else {
                var resultSort = (() => {
                    var resultBySort = [];
                    var resultSortEnd = [];
                    var currentWeight = 0;
                    return (result, weight) => {
                        resultBySort[weight] = result;
                        if(currentWeight >= weight) {
                            resultSortEnd = resultSortEnd.concat(result);
                            while(resultBySort[++currentWeight]){
                                resultSortEnd = resultSortEnd.concat(resultBySort[currentWeight])
                            }
                            resultHandle.bind(that)(resultSortEnd);
                        }
                    }
                })();
                this.props.gd.lineSearch(value, 50).then((result) => {
                    resultSort(result, 0);
                },() => {
                    resultSort([], 0);
                });
                this.props.gd.stationSearch(value, 50).then((result) => {
                    resultSort(result, 1);
                },() => {
                    resultSort([], 1);
                });
                this.props.gd.poisSearch(value, 50).then((result) => {
                    resultSort(result, 2);
                },() => {
                    resultSort([], 2);
                });
            }
        };
        return () => {
            let value = this.refs.searchKeyword.value.trim();
            if(value) {
                this.setState({
                    searchContent: value,
                    searchHiden: false,
                    resultHiden: false
                });
                clearTimeout(time);
                time = setTimeout(search.bind(this), 150);
            } else {
                this.setState({
                    searchContent: "",
                    searchHiden: true,
                    resultHiden: true,
                    searchResult: this.searchHistory.arr
                })
            }
        };
    })();
    searchFocusHandle =() => {
        "use strict";
        if(!this.state.searchContent) {
            this.setState({
                searchHiden: true,
                resultHiden: false,
                searchResult: this.searchHistory.arr
            })
        }
    };
    searchClickHandle = () => {
        "use strict";
        this.searchInputHandle();
    };
    resultClickHandle = (e) => {
        "use strict";
        e = e || window.event;
        if(window.localStorage) {
            var data = this.state.searchResult[e.target.getAttribute('data-index')];
            var index = this.searchHistory.arr.findIndex((item) => {
                return item.id == data.id;
            });
            if(index != -1) {
                this.searchHistory.objArr.splice(index, 1);
                this.searchHistory.arr.splice(index, 1);
            }
            let name = data.name.match(/^([^(]+)/)[0];
            let other = undefined;
            if(this.props.cache.busline[name] && this.props.cache.busline[name].length > 1) {
                for(let d of this.props.cache.busline[name]) {
                    if(d.id != data.id) {
                        other = d;
                    }
                }
            }
            this.searchHistory.objArr.unshift({data: data, other: other});
            this.searchHistory.arr.unshift(data);
            this.searchHistory.objArr.length = this.searchHistory.objArr.length > 5 ? 5 : this.searchHistory.objArr.length;
            this.searchHistory.arr.length = this.searchHistory.arr.length > 5 ? 5 : this.searchHistory.arr.length;
            localStorage.search = JSON.stringify(this.searchHistory.objArr);
            var type = data.className;
            this.props.handle.mergeLineInfo(data, type).then((result) => {
                this.props.gd.UI.draw(result, type, data);
                switch(type) {
                    case 'fa-random':
                        this.props.hideStation();
                        this.props.handle.lineChangeHandle(result, data);
                        break;
                    case 'fa-bus':
                        this.props.hideStation();
                        this.props.handle.stationChangeHandle(result, data);
                        break;
                    case 'fa-bullseye':
                        this.props.showStation(data.name);
                        this.props.handle.poisChangeHandle(result, data);
                        break;
                }
            });
        }
        this.setState({
            searchContent: data.name,
            searchHiden: false,
            resultHiden: true
        })
    };
    render() {
        "use strict";
        var searchHidenIcon = 'fa fa-close';
        searchHidenIcon += this.state.searchHiden ? ' hiden': '';
        var searchResult = 'searchResult';
        searchResult += this.state.resultHiden ? ' hiden' : '';
        return (
            <div className="search">
                <div className="searchInput">
                    <div className="searchValue">
                        <i className="fa fa-search"></i>
                        <input type="text" placeholder="搜索公交线路/公交站点/地名" ref="searchKeyword" onFocus={this.searchFocusHandle}
                               onInput={this.searchInputHandle} value={this.state.searchContent} className="searchKeyword"/>
                        <i className={searchHidenIcon} onClick={this.hideClickHandle}></i>
                    </div>
                    <span onClick={this.searchClickHandle} className="searchButtom">搜索</span>
                </div>
                <div className={searchResult} onClick={this.resultClickHandle}>{this.state.searchResult.map((bus, index) => {
                    return <div className="item" title={bus.name} data-index={index} key={index}><i className={"fa " + bus.className}></i>{bus.name}</div>
                })}</div>
            </div>
        )
    }
}