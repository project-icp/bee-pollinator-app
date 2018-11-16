import React, { Component, createRef } from 'react';
import * as esri from 'esri-leaflet-geocoder';
import {
    Map as LeafletMap,
    TileLayer,
    Marker,
    ZoomControl,
} from 'react-leaflet';
import { connect } from 'react-redux';
import { arrayOf, func, string } from 'prop-types';

import { Apiary } from '../propTypes';
import { fetchApiaryScores, setApiaryList } from '../actions';
import {
    MAP_CENTER,
    MAP_ZOOM,
    FORAGE_RANGE_3KM,
    FORAGE_RANGE_5KM,
} from '../constants';

class Map extends Component {
    constructor() {
        super();
        this.onClickAddMarker = this.onClickAddMarker.bind(this);
        this.mapRef = createRef();
    }

    componentDidMount() {
        const geocoderUrl = 'https://utility.arcgis.com/usrsvcs/appservices/OvpAtyJwoLLdQcLC/rest/services/World/GeocodeServer/';
        const map = this.mapRef.current.leafletElement;
        const geocoder = new esri.Geosearch({
            providers: [
                new esri.ArcgisOnlineProvider({
                    url: geocoderUrl,
                    maxResults: 7,
                    categories: ['Address', 'Postal'],
                }),
            ],
            placeholder: 'Find location',
            expanded: true,
            collapseAfterResult: false,
            position: 'topleft',
            /*
                The geocoder and leaflet error without `useMapBounds` and
                `zoomToResult` set to false.
                See: https://github.com/Esri/esri-leaflet-geocoder/issues/209
            */
            useMapBounds: false,
            zoomToResult: false,
        }).addTo(map);

        geocoder.on('results', ({ results }) => {
            const selectedResult = results && results[0];
            if (selectedResult) {
                map.panTo(selectedResult.latlng);
            }
        });
    }

    onClickAddMarker(event) {
        const { forageRange, apiaries, dispatch } = this.props;
        const newApiary = {
            name: 'dummy name',
            marker: 'F',
            location: event.latlng,
            scores: {
                [FORAGE_RANGE_3KM]: {},
                [FORAGE_RANGE_5KM]: {},
            },
            fetching: false,
            selected: false,
            starred: false,
            surveyed: false,
        };
        const newApiaryList = apiaries.concat(newApiary);
        dispatch(setApiaryList(newApiaryList));
        dispatch(fetchApiaryScores(newApiary, forageRange));
    }

    render() {
        const { apiaries } = this.props;
        const markers = apiaries.map((apiary, idx) => {
            // TODO: Replace unique key generator once app uses real, complete data
            // Currently solution appeases React unique key error
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
                    zoomControl={false}
                    onClick={this.onClickAddMarker}
                    ref={this.mapRef}
                >
                    <TileLayer
                        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomleft" />
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
    forageRange: string.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(Map);
