import React from 'react';
import { Map as LeafletMap, TileLayer } from 'react-leaflet';
import { connect } from 'react-redux';

import { MAP_CENTER, MAP_ZOOM } from '../constants';

const Map = () => (
    <div className="map">
        <LeafletMap
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
        >
            <TileLayer
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </LeafletMap>
    </div>
);

function mapStateToProps(state) {
    return state.main;
}

Map.propTypes = {};

export default connect(mapStateToProps)(Map);
