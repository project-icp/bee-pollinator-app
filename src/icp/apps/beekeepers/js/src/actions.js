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
export const clearAuthError = createAction('Clear saved auth error');
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
                    userId: data.id || null,
                }));
                dispatch(closeLoginModal());
            })
            .catch((error) => {
                dispatch(setAuthState({
                    username: '',
                    authError: error.response.data.errors[0],
                    userId: null,
                }));
            });
    };
}

export function logout() {
    return dispatch => csrfRequest.get('/user/logout').then(() => {
        dispatch(setAuthState({
            username: '',
            authError: '',
            userId: null,
        }));
        dispatch(setApiaryList([]));
    });
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
