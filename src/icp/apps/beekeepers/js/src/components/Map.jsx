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
    shape,
} from 'prop-types';

import { Apiary } from '../propTypes';
import {
    fetchApiaryScores,
    setApiaryList,
    updateApiary,
    setMapCenter,
    setMapZoom,
} from '../actions';
import {
    FORAGE_RANGE_3KM,
    FORAGE_RANGE_5KM,
    MAP_ZOOM,
    MAP_CENTER,
    MAX_MAP_ZOOM,
} from '../constants';
import { getNextInSequence, isSameLocation } from '../utils';

import ApiaryMarker from './ApiaryMarker';
import CropLayerControl from './CropLayerControl';

class Map extends Component {
    constructor() {
        super();
        this.onClickAddMarker = this.onClickAddMarker.bind(this);
        this.enableMapZoom = this.enableMapZoom.bind(this);
        this.disableMapZoom = this.disableMapZoom.bind(this);
        this.onMapDragEnd = this.onMapDragEnd.bind(this);
        this.onMapZoom = this.onMapZoom.bind(this);
        this.mapRef = createRef();
        this.addressLookup = (new esri.GeocodeService()).reverse();

        // click-differentiating handlers
        this.mapClickCount = 0;
        this.timeoutId = null;
    }

    componentDidMount() {
        const { mapCenter, mapZoom, dispatch } = this.props;
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
            placeholder: 'Search location',
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
                dispatch(setMapCenter(selectedResult.latlng));
                dispatch(setMapZoom(MAX_MAP_ZOOM));
            }
        });

        // initialize map with user's latest settings
        map.setView(mapCenter, mapZoom);
    }

    componentDidUpdate({ mapCenter: prevMapCenter, mapZoom: prevMapZoom }) {
        const { mapCenter, mapZoom } = this.props;

        if (!isSameLocation(prevMapCenter, mapCenter) || prevMapZoom !== mapZoom) {
            const map = this.mapRef.current.leafletElement;
            map.setView(mapCenter, mapZoom);
        }
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

    onMapDragEnd(event) {
        const { dispatch } = this.props;
        const center = event.target.getCenter();
        dispatch(setMapCenter([center.lat, center.lng]));
    }

    onMapZoom(event) {
        const { dispatch } = this.props;
        const zoom = event.target.getZoom();
        dispatch(setMapZoom(zoom));
    }

    enableMapZoom() {
        this.mapRef.current.leafletElement.scrollWheelZoom.enable();
    }

    disableMapZoom() {
        this.mapRef.current.leafletElement.scrollWheelZoom.disable();
    }

    render() {
        const {
            apiaries,
            cropLayerOpacity,
            isCropLayerActive,
        } = this.props;
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
                url="https://{s}.tiles.azavea.com/cdl-reclass-2017-gdal/{z}/{x}/{y}.png"
                subdomains="abcd"
                maxNativeZoom={13}
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
                    onDragEnd={this.onMapDragEnd}
                    onZoomEnd={this.onMapZoom}
                    ref={this.mapRef}
                    maxZoom={MAX_MAP_ZOOM}
                >
                    {cropLayer}
                    <TileLayer
                        attribution="Tiles &copy; Esri"
                        url="https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <TileLayer
                        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                    />
                    <CropLayerControl
                        position="bottomleft"
                        enableMapZoom={this.enableMapZoom}
                        disableMapZoom={this.disableMapZoom}
                    />
                    <ZoomControl position="topright" />
                    {markers}
                </LeafletMap>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        apiaries: state.main.apiaries,
        forageRange: state.main.forageRange,
        isCropLayerActive: state.main.isCropLayerActive,
        cropLayerOpacity: state.main.cropLayerOpacity,
        dispatch: state.main.dispatch,
        mapCenter: state.saved.mapCenter,
        mapZoom: state.saved.mapZoom,
    };
}

Map.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
    forageRange: string.isRequired,
    isCropLayerActive: bool.isRequired,
    cropLayerOpacity: number.isRequired,
    dispatch: func.isRequired,
    mapCenter: shape({
        lat: number.isRequired,
        lng: number.isRequired,
    }).isRequired,
    mapZoom: number.isRequired,
};

export default connect(mapStateToProps)(Map);
