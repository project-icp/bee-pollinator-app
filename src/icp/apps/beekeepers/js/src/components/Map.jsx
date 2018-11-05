import React, { Component } from 'react';
import { Map as LeafletMap, TileLayer, Marker } from 'react-leaflet';
import { connect } from 'react-redux';
import { arrayOf, func } from 'prop-types';

import { Apiary } from '../propTypes';
import { setApiaryList } from '../actions';
import { MAP_CENTER, MAP_ZOOM, RASTERS } from '../constants';

class Map extends Component {
    constructor() {
        super();
        this.onClickAddMarker = this.onClickAddMarker.bind(this);
    }

    onClickAddMarker(event) {
        const { apiaries, dispatch } = this.props;
        const newApiaryList = apiaries.concat({
            name: 'dummy name',
            marker: 'F',
            location: event.latlng,
            scores: {
                threeKm: {
                    [RASTERS.HIVE_DENSITY]: { data: 26, error: null },
                    [RASTERS.HABITAT]: { data: 13, error: null },
                    [RASTERS.PESTICIDE]: { data: 20, error: null },
                    [RASTERS.FORAGE_SPRING]: { data: 61, error: null },
                    [RASTERS.FORAGE_SUMMER]: { data: 54, error: null },
                    [RASTERS.FORAGE_FALL]: { data: 45, error: null },
                    [RASTERS.OVERALL]: { data: 45, error: null },
                },
                fiveKm: {
                    [RASTERS.HIVE_DENSITY]: { data: 26, error: null },
                    [RASTERS.HABITAT]: { data: 13, error: null },
                    [RASTERS.PESTICIDE]: { data: 20, error: null },
                    [RASTERS.FORAGE_SPRING]: { data: 61, error: null },
                    [RASTERS.FORAGE_SUMMER]: { data: 54, error: null },
                    [RASTERS.FORAGE_FALL]: { data: 45, error: null },
                    [RASTERS.OVERALL]: { data: 45, error: null },
                },
            },
            fetching: false,
            selected: false,
            starred: false,
            surveyed: false,
        });
        dispatch(setApiaryList(newApiaryList));
    }

    render() {
        const { apiaries } = this.props;
        const markers = apiaries.map((apiary, idx) => {
            const key = apiary.name + String.fromCharCode(idx);
            return (
                <Marker
                    key={key}
                    position={[apiary.location.lat, apiary.location.lng]}
                />
            );
        });

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
    apiaries: arrayOf(Apiary).isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(Map);
