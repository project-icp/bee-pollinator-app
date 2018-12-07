import { createAction } from 'redux-act';
import update from 'immutability-helper';

import csrfRequest from './csrfRequest';
import { INDICATORS } from './constants';

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
        } = getState();

        // finally, declare starting to fetch scores
        dispatch(startFetchApiaryScores());

        // mark apiaries from input list as fetching data
        const fetchingApiaries = apiaries.map((apiary) => {
            if (apiaryList.find(a => a.lat === apiary.lat && a.lng === apiary.lng)) {
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
                // TODO: Authenticated user should save apiaryListWithData to
                // the database and update the redux store of apiaries
                // from a GET/list call

                // For unauthenticated user relying purely on redux/
                // localStorage, manually update the apiary listings with data
                const nonFetchingApiaryList = fetchingApiaries.filter(a => !a.fetching);
                const apiaryListWithData = apiaryList.map((apiary, idx) => (
                    update(apiary, {
                        scores: {
                            [forageRange]: { $set: data[idx] },
                        },
                        fetching: { $set: false },
                    })
                ));

                const newList = nonFetchingApiaryList.concat(apiaryListWithData);

                dispatch(completeFetchApiaryScores());
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
        csrfRequest
            .post('/user/login', form)
            .then(({ data }) => {
                dispatch(setAuthState({
                    username: data.username,
                    authError: '',
                    userId: data.id,
                }));
                dispatch(closeLoginModal());
            })
            .catch((error) => {
                dispatch(setAuthState({
                    username: '',
                    authError: error.response.data.errors[0],
                    userId: NaN,
                }));
            });
    };
}
