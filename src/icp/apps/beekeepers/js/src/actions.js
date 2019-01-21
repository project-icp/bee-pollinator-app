import { createAction } from 'redux-act';
import update from 'immutability-helper';

import csrfRequest from './csrfRequest';
import { INDICATORS } from './constants';
import { isSameLocation } from './utils';

export const setSort = createAction('Set apiary sort');
export const setForageRange = createAction('Set forage range');
export const setApiaryList = createAction('Set the apiary list');
export const startFetchApiaryScores = createAction('Start fetching apiary scores');
export const failFetchApiaryScores = createAction('Failed to fetch apiary scores');
export const completeFetchApiaryScores = createAction('Completed fetching apiary scores');
export const openSignUpModal = createAction('Open sign up modal');
export const closeSignUpModal = createAction('Close sign up modal');
export const openLoginModal = createAction('Open log in modal');
export const closeLoginModal = createAction('Close log in modal');
export const openParticipateModal = createAction('Open participate modal');
export const closeParticipateModal = createAction('Close participate modal');
export const setAuthState = createAction('Set auth information to the state');
export const clearAuthMessages = createAction('Clear saved auth message and error');
export const startSavingApiaryList = createAction('Start saving apiary list');
export const completeSavingApiaryList = createAction('Complete saving apiary list');
export const failSavingApiaryList = createAction('Fail saving apiary list');
export const startFetchingApiaryList = createAction('Start fetching apiary list');
export const completeFetchingApiaryList = createAction('Complete fetching apiary list');
export const failFetchingApiaryList = createAction('Fail fetching apiary list');
export const startUpdatingApiary = createAction('Start updating apiary');
export const completeUpdatingApiary = createAction('Complete updating apiary');
export const failUpdatingApiary = createAction('Fail updating apiary');
export const startDeletingApiary = createAction('Start deleting apiary');
export const completeDeletingApiary = createAction('Complete deleting apiary');
export const failDeletingApiary = createAction('Fail deleting apiary');
export const showCropLayer = createAction('Show crop layer');
export const hideCropLayer = createAction('Hide crop layer');
export const setCropLayerOpacity = createAction('Set crop layer opacity');
export const openUserSurveyModal = createAction('Open user survey modal');
export const closeUserSurveyModal = createAction('Close user survey modal');
export const openEmailFormModal = createAction('Open email form modal');
export const closeEmailFormModal = createAction('Close email form modal');
export const openSuccessModal = createAction('Open success message modal');
export const closeSuccessModal = createAction('Close success message modal');
export const setMapCenter = createAction('Set map center');


export function fetchApiaryScores(apiaryList, forageRange) {
    return (dispatch, getState) => {
        if (!apiaryList || !forageRange) {
            const err = !apiaryList
                ? 'No apiary provided' : 'No forage range provided';
            window.console.warn(err);
            return false;
        }

        if (!Array.isArray(apiaryList)) {
            window.console.warn('Must send in an array of propType Apiary');
            return false;
        }

        // check if data for the apiaries already exist
        if (apiaryList.every(apiary => apiary.scores[forageRange].data)) {
            return true;
        }

        const {
            main: {
                apiaries,
            },
            auth: {
                userId,
            },
        } = getState();

        // finally, declare starting to fetch scores
        dispatch(startFetchApiaryScores());

        // mark apiaries from input list as fetching data
        const fetchingApiaries = apiaries.map((apiary) => {
            if (apiaryList.find(a => isSameLocation(a, apiary))) {
                return update(apiary, {
                    fetching: { $set: true },
                });
            }
            return apiary;
        });
        dispatch(setApiaryList(fetchingApiaries));

        const locationList = apiaryList.map(apiary => ({
            lat: apiary.lat,
            lng: apiary.lng,
        }));

        return csrfRequest
            .post('/beekeepers/fetch/', {
                locations: locationList,
                forage_range: forageRange,
                indicators: Object.values(INDICATORS),
            })
            .then(({ data }) => {
                const apiaryListWithData = apiaryList.map((apiary, idx) => (
                    update(apiary, {
                        scores: {
                            [forageRange]: { $set: data[idx] },
                        },
                    })
                ));

                dispatch(completeFetchApiaryScores());

                if (userId) {
                    dispatch(startSavingApiaryList());

                    return csrfRequest
                        .post('/beekeepers/apiary/upsert/', apiaryListWithData)
                        .then(({ data: upsertResponse }) => {
                            dispatch(completeSavingApiaryList());
                            return upsertResponse;
                        })
                        .catch(error => dispatch(failSavingApiaryList(error)));
                }

                // For unauthenticated user relying purely on redux/
                // localStorage, manually update the apiary listings with data
                return apiaryListWithData;
            })
            .then((upsertResponse) => {
                // Add `fetching` and `selected` flags to upsert response.
                // The response doesn't include these as they are UI only.
                const apiaryListWithData = upsertResponse.map(apiary => update(apiary, {
                    fetching: { $set: false },
                    selected: { $set: false },
                }));

                const nonFetchingApiaryList = fetchingApiaries.filter(a => !a.fetching);
                const newList = nonFetchingApiaryList.concat(apiaryListWithData);

                dispatch(setApiaryList(newList));
            })
            .catch((error) => {
                const nonFetchingApiaryList = fetchingApiaries.filter(a => !a.fetching);
                const apiaryListWithData = apiaryList.map(apiary => (
                    update(apiary, {
                        fetching: { $set: false },
                    })
                ));
                const newList = nonFetchingApiaryList.concat(apiaryListWithData);

                window.console.warn(error);
                dispatch(failFetchApiaryScores(error));
                dispatch(setApiaryList(newList));
            });
    };
}


export function flashSuccessModal() {
    return (dispatch) => {
        dispatch(openSuccessModal());
        setTimeout(() => dispatch(closeSuccessModal()), 2000);
    };
}


export function signUp(form) {
    return dispatch => csrfRequest.post('/user/sign_up?beekeepers', form)
        .then(({ data: { result } }) => {
            if (result === 'success') {
                dispatch(closeSignUpModal());
                dispatch(setAuthState({
                    username: '',
                    authError: '',
                    userId: null,
                    userSurvey: null,
                    message: 'Please click the validation link in your email and then log in.',
                }));
                dispatch(openLoginModal());
            }
        })
        .catch((error) => {
            dispatch(setAuthState({
                username: '',
                authError: error.response.data.errors[0],
                userId: null,
                userSurvey: null,
                message: '',
            }));
        });
}


export function login(form) {
    return (dispatch) => {
        const request = form
            ? csrfRequest.post('/user/login', form)
            : csrfRequest.get('/user/login');

        return request
            .then(({ data }) => {
                dispatch(setAuthState({
                    username: data.username || '',
                    authError: '',
                    message: '',
                    userId: data.id || null,
                    userSurvey: data.beekeeper_survey,
                }));
                dispatch(closeLoginModal());
            })
            .catch((error) => {
                dispatch(setAuthState({
                    username: '',
                    message: '',
                    authError: error.response.data.errors[0],
                    userId: null,
                    userSurvey: null,
                }));
            });
    };
}

export function logout() {
    return dispatch => csrfRequest.get('/user/logout').then(() => {
        dispatch(setAuthState({
            username: '',
            authError: '',
            message: '',
            userId: null,
            userSurvey: null,
        }));
        dispatch(setApiaryList([]));
    });
}

export function sendAuthLink(form, endpoint) {
    // valid endpoints at /user/forgot and /user/resend
    return dispatch => csrfRequest
        .post(`/user/${endpoint}`, form)
        .then(() => {
            dispatch(setAuthState({
                username: '',
                userId: null,
                message: 'Check your email to reset your password or activate your account',
                authError: '',
                userSurvey: null,
            }));
        }).catch((error) => {
            dispatch(setAuthState({
                message: '',
                authError: error.response.data.errors[0],
                username: '',
                userSurvey: null,
                userId: null,
            }));
        });
}

export function createUserSurvey(form) {
    return (dispatch, getState) => {
        const {
            auth: {
                username,
                userId,
            },
        } = getState();

        return csrfRequest.post('/beekeepers/user_survey/', form)
            .then(({ data }) => {
                dispatch(setAuthState({
                    username,
                    message: '',
                    authError: '',
                    userId,
                    userSurvey: data.beekeeper_survey,
                }));
                dispatch(closeUserSurveyModal());
                dispatch(flashSuccessModal());
            })
            .catch(() => {
                const errorMsg = 'Error submitting user survey. Check the fields and try again, or try again later.';
                dispatch(setAuthState({
                    username,
                    message: '',
                    authError: errorMsg,
                    userId,
                    userSurvey: null,
                }));
            });
    };
}


export function fetchUserApiaries() {
    return (dispatch) => {
        dispatch(startFetchingApiaryList());

        csrfRequest
            .get('/beekeepers/apiary/')
            .then(({ data }) => {
                const apiaryListWithData = data.map(apiary => (
                    update(apiary, {
                        fetching: { $set: false },
                        selected: { $set: false },
                    })
                ));

                dispatch(completeFetchingApiaryList());
                dispatch(setApiaryList(apiaryListWithData));
            })
            .catch(error => dispatch(failFetchingApiaryList(error)));
    };
}

export function updateApiary(apiary) {
    return (dispatch, getState) => {
        const {
            main: {
                apiaries,
            },
            auth: {
                userId,
            },
        } = getState();

        const newList = apiaries.map((a) => {
            if (isSameLocation(a, apiary)) {
                return apiary;
            }

            return a;
        });

        dispatch(setApiaryList(newList));

        if (userId && apiary.id) {
            dispatch(startUpdatingApiary());

            csrfRequest
                .patch(`/beekeepers/apiary/${apiary.id}/`, apiary)
                .then(() => dispatch(completeUpdatingApiary()))
                .catch(error => dispatch(failUpdatingApiary(error)));
        }
    };
}

function toggleApiaryFlag(flag) {
    return apiary => (dispatch) => {
        const toggled = update(apiary, {
            [flag]: {
                $set: !apiary[flag],
            },
        });

        dispatch(updateApiary(toggled));
    };
}

export const setApiaryStar = toggleApiaryFlag('starred');
export const setApiarySurvey = toggleApiaryFlag('surveyed');

export function deleteApiary(apiary) {
    return (dispatch, getState) => {
        const {
            main: {
                apiaries,
            },
            auth: {
                userId,
            },
        } = getState();

        const newList = apiaries.filter(a => !isSameLocation(a, apiary));

        dispatch(setApiaryList(newList));

        if (userId && apiary.id) {
            dispatch(startDeletingApiary());

            csrfRequest
                .delete(`/beekeepers/apiary/${apiary.id}/`)
                .then(() => dispatch(completeDeletingApiary()))
                .catch(error => dispatch(failDeletingApiary(error)));
        }
    };
}

export function saveAndFetchApiaries() {
    return (dispatch, getState) => {
        const {
            main: {
                apiaries,
            },
            auth: {
                userId,
            },
        } = getState();

        if (!userId) {
            return;
        }

        if (apiaries.length > 0) {
            /* There are client-side unsaved apiaries. Save them if the user
               does not have any saved on server-side. If they do  have server-
               side saved apiaries, then discard the client-side ones. */

            dispatch(startFetchingApiaryList());

            csrfRequest
                .get('/beekeepers/apiary/')
                .then(({ data }) => {
                    if (data.length === 0) {
                        /* No apiaries from server. Upsert client ones. */

                        dispatch(startSavingApiaryList());

                        csrfRequest
                            .post('/beekeepers/apiary/upsert/', apiaries)
                            .then(({ data: upsertResponse }) => {
                                const apiaryListWithData = upsertResponse.map(apiary => (
                                    update(apiary, {
                                        fetching: { $set: false },
                                        selected: { $set: false },
                                    })
                                ));

                                dispatch(setApiaryList(apiaryListWithData));
                                dispatch(completeSavingApiaryList());
                            })
                            .catch(error => dispatch(failSavingApiaryList(error)));
                    } else {
                        /* Server has apiaries. Discard client ones. */

                        const apiaryListWithData = data.map(apiary => (
                            update(apiary, {
                                fetching: { $set: false },
                                selected: { $set: false },
                            })
                        ));

                        dispatch(setApiaryList(apiaryListWithData));
                        dispatch(completeFetchingApiaryList());
                    }
                })
                .catch(error => dispatch(failFetchingApiaryList(error)));
        } else {
            /* No client-side apiaries. Just fetch from server. */

            dispatch(fetchUserApiaries());
        }
    };
}
