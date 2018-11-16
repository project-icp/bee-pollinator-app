import { createReducer } from 'redux-act';
import update from 'immutability-helper';

import {
    DEFAULT_SORT,
    FORAGE_RANGE_3KM,
} from './constants';
import {
    setSort,
    setForageRange,
    setApiaryList,
    startFetchApiaryScores,
    failFetchApiaryScores,
    completeFetchApiaryScores,
} from './actions';

const initialState = {
    sortBy: DEFAULT_SORT,
    forageRange: FORAGE_RANGE_3KM,
    apiaries: [],
};

const mainReducer = createReducer({
    [setSort]:
        (state, payload) => update(state, { sortBy: { $set: payload } }),
    [setForageRange]:
        (state, payload) => update(state, { forageRange: { $set: payload } }),
    [setApiaryList]:
        (state, payload) => update(state, { apiaries: { $set: payload } }),
    [startFetchApiaryScores]: state => update(state, { apiaries: { fetching: { $set: true } } }),
    [failFetchApiaryScores]: state => update(state, { apiaries: { fetching: { $set: false } } }),
    [completeFetchApiaryScores]: state => update(state, { apiaries: { fetching: { $set: true } } }),
}, initialState);

// Placeholder reducer for parts of state that will be persisted to localStorage
const savedReducer = createReducer({}, {});

export default {
    main: mainReducer,
    saved: savedReducer,
};
