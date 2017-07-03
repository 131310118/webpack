import React, {Component} from "react";
import Search from "./../search/search.jsx";

export default class Header extends Component {
    render() {
        "use strict";
        return (
            <div className="header">
                <Search gd={this.props.gd}/>
                <div></div>
                <span>
                    <i></i>收藏夹
                    <ul></ul>
                </span>
            </div>
        )
    }
}