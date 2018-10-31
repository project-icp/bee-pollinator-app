import React, { Component } from 'react';
import { Map as LeafletMap, TileLayer } from 'react-leaflet';
import { connect } from 'react-redux';
import { arrayOf, object } from 'prop-types';

import { MAP_CENTER, MAP_ZOOM } from '../constants';

class Map extends Component {
    constructor() {
        super();
        this.onClickAddMarker = this.onClickAddMarker.bind(this);
    }

    onClickAddMarker(event) {
        window.console.log(event);
        const { apiaries } = this.props;
        apiaries.push({
            name: 'Geocoded name',
            location: event.latlng,
        });
    }

    render() {
        return (
            <div className="map">
                <LeafletMap
                    center={MAP_CENTER}
                    zoom={MAP_ZOOM}
                    onClick={this.onClickAddMarker}
                >
                    <TileLayer
                        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LeafletMap>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.main;
}

Map.propTypes = {
    apiaries: arrayOf(object).isRequired,
};

export default connect(mapStateToProps)(Map);
