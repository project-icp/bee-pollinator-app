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
    openParticipateModal,
    closeParticipateModal,
    setAuthState,
    clearAuthMessages,
    showCropLayer,
    hideCropLayer,
    setCropLayerOpacity,
    openUserSurveyModal,
    closeUserSurveyModal,
    openEmailFormModal,
    closeEmailFormModal,
} from './actions';

const initialState = {
    sortBy: DEFAULT_SORT,
    forageRange: FORAGE_RANGE_3KM,
    apiaries: [],
    isSignUpModalOpen: false,
    isLoginModalOpen: false,
    isParticipateModalOpen: false,
    isCropLayerActive: false,
    cropLayerOpacity: 0.5,
    isUserSurveyModalOpen: false,
    isEmailFormModalOpen: false,
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
    [openParticipateModal]:
        state => update(state, { isParticipateModalOpen: { $set: true } }),
    [closeParticipateModal]:
        state => update(state, { isParticipateModalOpen: { $set: false } }),
    [showCropLayer]:
        state => update(state, { isCropLayerActive: { $set: true } }),
    [hideCropLayer]:
        state => update(state, { isCropLayerActive: { $set: false } }),
    [setCropLayerOpacity]:
        (state, payload) => update(state, { cropLayerOpacity: { $set: payload } }),
    [openUserSurveyModal]:
        state => update(state, { isUserSurveyModalOpen: { $set: true } }),
    [closeUserSurveyModal]:
        state => update(state, { isUserSurveyModalOpen: { $set: false } }),
    [openEmailFormModal]:
        state => update(state, { isEmailFormModalOpen: { $set: true } }),
    [closeEmailFormModal]:
        state => update(state, { isEmailFormModalOpen: { $set: false } }),
}, initialState);

// Placeholder reducer for parts of state that will be persisted to localStorage
const savedReducer = createReducer({}, {});

const initialAuthState = {
    username: '',
    userId: null,
    authError: '',
    message: '',
    userSurvey: null,
};

const authReducer = createReducer({
    [setAuthState]:
        (state, payload) => update(state, { $set: payload }),
    [clearAuthMessages]:
        state => update(state, {
            authError: { $set: '' },
            message: { $set: '' },
        }),
}, initialAuthState);

export default {
    main: mainReducer,
    saved: savedReducer,
    auth: authReducer,
};
