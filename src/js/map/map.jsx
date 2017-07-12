import React, {Component} from "react";
import './map.scss'

export default class Map extends Component {
    constructor(props) {
        "use strict";
        super(props);
    }
    componentDidMount() {
        "use strict";
        const LNG = 121.378860,
            LAT = 31.245039,
            ZOOM = 15,
            RESIZEEABLE = false;
        this.props.gd.setMap(new AMap.Map('container', {
            resizeEnable: RESIZEEABLE,
            zoom: ZOOM,
            center: new AMap.LngLat(LNG, LAT)
        }));
        this.props.gd.startGeolocation();
    }
    render() {
        "use strict";
        return (
            <div id="container"></div>
        )
    }
}