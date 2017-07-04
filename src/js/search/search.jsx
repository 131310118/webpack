import React, {Component} from "react";
import "./search.scss"

export default class Search extends Component {
    constructor(props){
        super(props);
        this.state = {
            searchHiden: this.props.searchHiden === false ? false : true,
            searchContent: this.props.searchContent ? this.props.searchContent : "",
            searchResult: this.props.searchResult ? this.props.searchResult : [],
            resultHiden: this.props.resultHiden === false ? false : true
        };
        this.searchHistory = (() => {
            var search = [];
            if(window.localStorage) {
                if(localStorage.search) {
                    search = JSON.parse(localStorage.search);
                }
            }
            return search;
        })()
    }
    hideClickHandle = (e) => {
        "use strict";
        this.setState({
            searchContent: "",
            searchHiden: true,
            resultHiden: false,
            searchResult: this.searchHistory
        });
        this.refs.searchKeyword.focus();
    };
    searchInputHandle = (() => {
        "use strict";
        var time;
        var resultCache = {};
        var search = () => {
            var value = this.state.searchContent;
            let resultHandle = (result) => {
                resultCache[value] = resultCache[value] ? resultCache[value].concat(result) : result;
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
                this.props.gd.lineSearch(value, 50).then((result) => {
                    resultHandle.bind(this)(result);
                },() => {});
                this.props.gd.stationSearch(value, 50).then((result) => {
                    resultHandle.bind(this)(result);
                },() => {});
                this.props.gd.poisSearch(value, 50).then((result) => {
                    resultHandle.bind(this)(result);
                },() => {});
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
                    searchResult: this.searchHistory
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
                searchResult: this.searchHistory
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
            var index = this.searchHistory.findIndex((item) => {
                return item.name == data.name;
            });
            if(index != -1) {
                this.searchHistory.splice(index, 1);
            }
            this.searchHistory.unshift(data);
            this.searchHistory.length = this.searchHistory.length > 5 ? 5 : this.searchHistory.length;
            localStorage.search = JSON.stringify(this.searchHistory);
            var type = data.className;
            this.props.gd.draw(data, type);
            switch(type) {
                case 'fa-random':
                    this.props.hideStation();
                    break;
                case 'fa-bus':
                    this.props.hideStation();
                    break;
                case 'fa-bullseye':
                    this.props.showStation(data.name);
                    break;
            }
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