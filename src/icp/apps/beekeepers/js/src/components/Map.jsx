import React, { Component, createRef } from 'react';
import { renderToString } from 'react-dom/server';
import * as esri from 'esri-leaflet-geocoder';
import update from 'immutability-helper';
import {
    Map as LeafletMap,
    TileLayer,
    Marker,
    ZoomControl,
} from 'react-leaflet';
import * as L from 'leaflet';
import { connect } from 'react-redux';
import {
    arrayOf,
    bool,
    func,
    number,
    string,
} from 'prop-types';

import { Apiary } from '../propTypes';
import {
    fetchApiaryScores,
    setApiaryList,
    updateApiary,
} from '../actions';
import {
    MAP_CENTER,
    MAP_ZOOM,
    FORAGE_RANGE_3KM,
    FORAGE_RANGE_5KM,
} from '../constants';
import { getNextInSequence, isSameLocation } from '../utils';

import ApiaryMarker from './ApiaryMarker';
import CropLayerControl from './CropLayerControl';

class Map extends Component {
    constructor() {
        super();
        this.onClickAddMarker = this.onClickAddMarker.bind(this);
        this.mapRef = createRef();
        this.addressLookup = (new esri.GeocodeService()).reverse();

        // click-differentiating handlers
        this.mapClickCount = 0;
        this.timeoutId = null;
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

        // Ignore clicks on a map control
        if (event.originalEvent.target.className.includes('control')) {
            return;
        }

        // Listen for double click before creating apiary
        // Direct implementation of https://github.com/azavea/Leaflet.favorDoubleClick
        this.mapClickCount += 1;
        if (this.mapClickCount > 1) {
            clearTimeout(this.timeoutId);
            L.DomEvent.stopPropagation(event);
        }

        this.timeoutId = setTimeout(() => {
            if (this.mapClickCount === 1) {
                // Traffic cop, prevent simultaneous, clobbered updates to the state
                // by only allowing 1 new apiary at a time
                if (apiaries.find(a => !!a.fetching)) {
                    return;
                }

                // Ignore clicks where an apiary exists
                if (apiaries.find(a => isSameLocation(a, event.latlng))) {
                    return;
                }

                const marker = (() => {
                    if (apiaries.length === 0) {
                        return 'A';
                    }

                    const lastMarker = apiaries[apiaries.length - 1].marker;

                    return getNextInSequence(lastMarker);
                })();

                const newApiary = {
                    name: 'Apiary',
                    marker,
                    lat: event.latlng.lat,
                    lng: event.latlng.lng,
                    scores: {
                        [FORAGE_RANGE_3KM]: {},
                        [FORAGE_RANGE_5KM]: {},
                    },
                    fetching: true,
                    selected: false,
                    starred: false,
                    surveyed: false,
                };
                const newApiaryList = apiaries.concat(newApiary);
                dispatch(setApiaryList(newApiaryList));

                this.addressLookup.latlng(event.latlng).run((error, result) => {
                    const name = result && result.address
                        ? result.address.Match_addr
                        : 'Apiary';

                    const apiary = update(newApiary, {
                        name: { $set: name },
                    });

                    dispatch(updateApiary(apiary));
                    dispatch(fetchApiaryScores([apiary], forageRange));
                });
            }

            this.mapClickCount = 0;
        }, 300);
    }

    render() {
        const { apiaries, cropLayerOpacity, isCropLayerActive } = this.props;
        const markers = apiaries.map((apiary) => {
            const icon = L.divIcon({
                className: 'custom icon',
                html: renderToString(<ApiaryMarker apiary={apiary} />),
            });
            return (
                <Marker
                    key={apiary.marker}
                    position={[apiary.lat, apiary.lng]}
                    icon={icon}
                />
            );
        });
        const cropLayer = !isCropLayerActive ? null : (
            <TileLayer
                url="https://{s}.tiles.azavea.com/cdl-reclass/{z}/{x}/{y}.png"
                subdomains="abcd"
                opacity={cropLayerOpacity}
            />
        );

        return (
            <div className="map">
                <LeafletMap
                    center={MAP_CENTER}
                    zoom={MAP_ZOOM}
                    zoomControl={false}
                    onClick={this.onClickAddMarker}
                    ref={this.mapRef}
                    maxZoom={18}
                >
                    {cropLayer}
                    <TileLayer
                        attribution="Tiles &copy; Esri"
                        url="https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <CropLayerControl position="bottomleft" />
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
    isCropLayerActive: bool.isRequired,
    cropLayerOpacity: number.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(Map);
