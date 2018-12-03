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
    openSignUpModal,
    closeSignUpModal,
    openLoginModal,
    closeLoginModal,
} from './actions';

const initialState = {
    sortBy: DEFAULT_SORT,
    forageRange: FORAGE_RANGE_3KM,
    apiaries: [],
    isSignUpModalOpen: false,
    isLoginModalOpen: false,
};

const mainReducer = createReducer({
    [setSort]:
        (state, payload) => update(state, { sortBy: { $set: payload } }),
    [setForageRange]:
        (state, payload) => update(state, { forageRange: { $set: payload } }),
    [setApiaryList]:
        (state, payload) => update(state, { apiaries: { $set: payload } }),
    [openSignUpModal]:
        state => update(state, { isSignUpModalOpen: { $set: true } }),
    [closeSignUpModal]:
        state => update(state, { isSignUpModalOpen: { $set: false } }),
    [openLoginModal]:
        state => update(state, { isLoginModalOpen: { $set: true } }),
    [closeLoginModal]:
        state => update(state, { isLoginModalOpen: { $set: false } }),
}, initialState);

// Placeholder reducer for parts of state that will be persisted to localStorage
const savedReducer = createReducer({}, {});

export default {
    main: mainReducer,
    saved: savedReducer,
};
