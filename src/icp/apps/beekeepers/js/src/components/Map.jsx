import React from 'react';
import { Map as LeafletMap, TileLayer } from 'react-leaflet';
import { arrayOf, number } from 'prop-types';
import { connect } from 'react-redux';

const Map = ({ mapCenter, zoom }) => (
    <div className="map">
        <LeafletMap
            center={mapCenter}
            zoom={zoom}
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

Map.propTypes = {
    mapCenter: arrayOf(number).isRequired,
    zoom: number.isRequired,
};

export default connect(mapStateToProps)(Map);
