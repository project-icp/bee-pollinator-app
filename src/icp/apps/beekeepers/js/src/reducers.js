import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    SORT_CREATED,
    FORAGE_RANGE_3K,
    MAP_CENTER,
    MAP_ZOOM,
} from './constants';
import { setSort, setForageRange } from './actions';

const initialState = {
    sortBy: SORT_CREATED,
    forageRange: FORAGE_RANGE_3K,
    mapCenter: MAP_CENTER,
    zoom: MAP_ZOOM,
    apiaries: [
        /* Sample Apiary Structure
        {
            "name": "Sample Apiary",
            "location": {
                "lat": 1.0,
                "lon": 1.0
            },
            "scores": {
                "3k": {
                    "hive_density": {
                        "data": 26,
                        "error": null
                    },
                    "forage_fall": {
                        "data": 45,
                        "error": null
                    },
                    "forage_spring": {
                        "data": 61,
                        "error": null
                    },
                },
                "5k": {
                    "hive_density": {
                        "data": 30,
                        "error": null
                    },
                    "forage_fall": {
                        "data": 49,
                        "error": null
                    },
                    "forage_spring": {
                        "data": 65,
                        "error": null
                    },
                }
            },
            "fetching": false,
            "starred": false,
            "surveyed": false,
        }
        */
    ],
};

const mainReducer = createReducer({
    [setSort]:
        (state, payload) => update(state, { sortBy: { $set: payload } }),
    [setForageRange]:
        (state, payload) => update(state, { forageRange: { $set: payload } }),
}, initialState);

// Placeholder reducer for parts of state that will be persisted to localStorage
const savedReducer = createReducer({}, {});

export default {
    main: mainReducer,
    saved: savedReducer,
};
