import React, { Component } from 'react';
import { Map as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import { connect } from 'react-redux';
import { arrayOf, object, func } from 'prop-types';

import { addApiary } from '../actions';
import { MAP_CENTER, MAP_ZOOM } from '../constants';

class Map extends Component {
    constructor() {
        super();
        this.onClickAddMarker = this.onClickAddMarker.bind(this);
    }

    onClickAddMarker(event) {
        const { apiaries, dispatch } = this.props;
        const newApiaryList = apiaries.concat({
            location: event.latlng,
        });
        dispatch(addApiary(newApiaryList));
    }

    render() {
        const { apiaries } = this.props;
        const markers = apiaries.map(apiary => (
            <Marker position={[apiary.location.lat, apiary.location.lng]} />
        ));

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
                    {markers}
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
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(Map);
