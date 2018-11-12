import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    DEFAULT_SORT,
    FORAGE_RANGE_3KM,
    INDICATORS,
    FORAGE_RANGE_5KM,
} from './constants';
import { setSort, setForageRange, setApiaryList } from './actions';


const initialState = {
    sortBy: DEFAULT_SORT,
    forageRange: FORAGE_RANGE_3KM,
    apiaries: [
        // TODO Remove dummy data
        {
            name: '423 Waltz Road',
            marker: 'A',
            location: {
                lat: 1.0,
                lng: 1.0,
            },
            scores: {
                [FORAGE_RANGE_3KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 16, error: null },
                    [INDICATORS.PESTICIDE]: { data: 30, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 61, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 54, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 45, error: null },
                },
                [FORAGE_RANGE_5KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 36, error: null },
                    [INDICATORS.PESTICIDE]: { data: 30, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 71, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 64, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 55, error: null },
                },
            },
            fetching: false,
            selected: false,
            starred: false,
            surveyed: false,
        },
        {
            name: '990 Spring Garden',
            marker: 'B',
            location: {
                lat: 1.0,
                lng: 1.0,
            },
            scores: {
                [FORAGE_RANGE_3KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 56, error: null },
                    [INDICATORS.PESTICIDE]: { data: 20, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 61, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 54, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 45, error: null },
                },
                [FORAGE_RANGE_5KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 36, error: null },
                    [INDICATORS.PESTICIDE]: { data: 30, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 71, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 64, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 55, error: null },
                },
            },
            fetching: true,
            selected: false,
            starred: true,
            surveyed: true,
        },
        {
            name: '341 N 12th Street',
            marker: 'C',
            location: {
                lat: 1.0,
                lng: 1.0,
            },
            scores: {
                [FORAGE_RANGE_3KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 26, error: null },
                    [INDICATORS.PESTICIDE]: { data: 10, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 61, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 54, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 45, error: null },
                },
                [FORAGE_RANGE_5KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 36, error: null },
                    [INDICATORS.PESTICIDE]: { data: 30, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 71, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 64, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 55, error: null },
                },
            },
            fetching: false,
            selected: false,
            starred: true,
            surveyed: false,
        },
        {
            name: '1234 Market Street',
            marker: 'D',
            location: {
                lat: 1.0,
                lng: 1.0,
            },
            scores: {
                [FORAGE_RANGE_3KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 23, error: null },
                    [INDICATORS.PESTICIDE]: { data: 50, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 61, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 54, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 45, error: null },
                },
                [FORAGE_RANGE_5KM]: {
                    [INDICATORS.NESTING_QUALITY]: { data: 36, error: null },
                    [INDICATORS.PESTICIDE]: { data: 30, error: null },
                    [INDICATORS.FORAGE_SPRING]: { data: 71, error: null },
                    [INDICATORS.FORAGE_SUMMER]: { data: 64, error: null },
                    [INDICATORS.FORAGE_FALL]: { data: 55, error: null },
                },
            },
            fetching: false,
            selected: true,
            starred: false,
            surveyed: false,
        },
    ],
};

const mainReducer = createReducer({
    [setSort]:
        (state, payload) => update(state, { sortBy: { $set: payload } }),
    [setForageRange]:
        (state, payload) => update(state, { forageRange: { $set: payload } }),
    [setApiaryList]:
        (state, payload) => update(state, { apiaries: { $set: payload } }),
}, initialState);

// Placeholder reducer for parts of state that will be persisted to localStorage
const savedReducer = createReducer({}, {});

export default {
    main: mainReducer,
    saved: savedReducer,
};
