import React, {Component} from "react";
import "./search.scss"

export default class Search extends Component {
    constructor(props){
        super(props);
        this.state = {
            searchHiden: this.props.searchHiden === false ? false : true,
            searchContent: this.props.searchContent ? this.props.searchContent : "",
            searchResult: this.props.searchResult ? this.props.searchResult : [],
            resultHiden: this.props.resultHiden === false ? false : true,
            searchListory: (() => {
                var search = [];
                if(window.localStorage) {
                    if(localStorage.search) {
                        search = JSON.parse(localStorage.search);
                    }
                }
                return search;
            })()
        };
    }
    hideClickHandle = (e) => {
        "use strict";
        this.setState({
            searchContent: "",
            searchHiden: true,
            resultHiden: true
        })
    };
    searchInputHandle = (() => {
        "use strict";
        var time;
        var bus;
        var resultCache = {};
        var searchInputUpdate = () => {
            let value = this.refs.searchKeyword.value.trim();
            if(value) {
                bus = value;
                this.setState({
                    searchContent: value,
                    searchHiden: false,
                    resultHiden: false
                });
                if(resultCache[value]) {
                    this.setState({
                        searchResult: resultCache[value],
                        resultHiden: false
                    });
                } else {
                    this.props.gd.lineSearch(value, 50).then(({result, preBus}) => {
                        resultCache[preBus] = resultCache[preBus] ? resultCache[preBus].concat(result) : result;
                        if(preBus == bus) {
                            this.setState({
                                searchResult: resultCache[preBus],
                                resultHiden: false
                            });
                        }
                    });
                }
                this.props.gd.stationSearch((stationSearch) => {
                     stationSearch.search(value, (status, result) => {
                         if(status === "complete" && result .info === 'OK') {
                             var stationInfo = [];
                             result.stationInfo.forEach((s) => {
                                 if(/\(公交站\)$/.test(s.name)) {
                                     s.location = s.location.getLng() + ',' + s.location.getLat();
                                     s.address = (() => {
                                         var arr = [];
                                         s.buslines.forEach((line) => {
                                             arr.push(line.name.replace(/\(.*\)/, ''));
                                         });
                                         return arr.join(';');
                                     })();
                                     s.className = "fa-bus";
                                     stationInfo.push(s);
                                 }
                             });
                             resultCache[value] = resultCache[value] ? resultCache[value].concat(result.stationInfo) : result.stationInfo;
                             if(value == this.refs.searchKeyword.value.trim()) {
                                 this.setState({
                                     searchResult: resultCache[value],
                                     resultHiden: false
                                 });
                             }
                         }
                     })
                 })
            } else {
                this.setState({
                    searchContent: "",
                    searchHiden: true,
                    resultHiden: true
                })
            }
        };
        return () => {
            var now = +new Date();
            if(time) {
                if(now - time < 150) {
                    return;
                } else {
                    time = now;
                    searchInputUpdate.bind(this)();
                }
            } else {
                time = now;
                searchInputUpdate.bind(this)();
            }
        }
    })();
    searchClickHandle = () => {
        "use strict";
        this.searchInputHandle();
    };
    resultClickHandle = (e) => {
        "use strict";
        e = e || window.event;
        if(window.localStorage) {
            this.state.searchListory.unshift({
                extData: dom.extData,
                title: dom.title
            });
            localStorage.search = JSON.stringify(obj.search.searchListory);
        }
        this.setState({
            searchHiden: true
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
                        <input type="text" placeholder="搜索公交线路/公交站点/地名" ref="searchKeyword"
                               onInput={this.searchInputHandle} value={this.state.searchContent} className="searchKeyword"/>
                        <i className={searchHidenIcon} onClick={this.hideClickHandle}></i>
                    </div>
                    <span onClick={this.searchClickHandle} className="searchButtom">搜索</span>
                </div>
                <div className={searchResult} onClick={this.resultClickHandle}>{this.state.searchResult.map((bus) => {
                    return <div className="item" title={bus.name} data-info={bus}><i className={"fa " + bus.className}></i>{bus.name}</div>
                })}</div>
            </div>
        )
    }
}