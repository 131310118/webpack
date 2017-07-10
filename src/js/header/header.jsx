import React, {Component} from "react";
import Search from "./../search/search.jsx";

require('./header.scss');

export default class Header extends Component {
    constructor(props) {
        "use strict";
        super(props);
        this.state = {
            stationName: this.props.stationName || "",
            stationHiden: this.props.stationHiden === false ? false : true,
            collectionHiden: this.props.collectionHiden === false ? false : true
        }
    }
    showStation = (stationName) => {
        "use strict";
        this.setState({
            stationName: stationName || this.state.stationName,
            stationHiden: false
        })
    };
    hideStation = () => {
        "use strict";
        this.setState({
            stationHiden: true
        })
    };
    toggleCollection = () => {
        "use strict";
        this.setState({
            collectionHiden: !this.state.collectionHiden
        })
    };
    collectionItemClickHandle = (data) => {
        "use strict";
        return () => {
            this.props.handle.lineChangeHandle(data);
        }
    };
    render() {
        "use strict";
        var stationName = "stationName";
        stationName += this.state.stationHiden ? " hiden" : "";
        var collectionList = "collectionList";
        collectionList += this.state.collectionHiden ? " hiden" : "";
        return (
            <div className="header">
                <Search gd={this.props.gd} showStation={this.showStation.bind(this)} hideStation={this.hideStation.bind(this)} handle={this.props.handle} cache={this.props.cache}/>
                <div className={stationName}>{this.state.stationName}</div>
                <span className="collection" onClick={this.toggleCollection}>
                    <i className="fa fa-star"></i>
                    收藏夹
                    <ul className={collectionList}>{this.props.collectionContent.length ? this.props.collectionContent.map((item, index) => {
                        return <li key={index} className="collectionListItem" onClick={this.collectionItemClickHandle(item)}>{item.name}</li>
                    }) : <li className="collectionListItem">空</li>}</ul>
                </span>
            </div>
        )
    }
}