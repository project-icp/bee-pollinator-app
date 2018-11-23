import { createAction } from 'redux-act';
import update from 'immutability-helper';
import axios from 'axios';

import { INDICATORS } from './constants';

export const setSort = createAction('Set apiary sort');
export const setForageRange = createAction('Set forage range');
export const setApiaryList = createAction('Set the apiary list');
export const startFetchApiaryScores = createAction('Start fetching apiary scores');
export const failFetchApiaryScores = createAction('Failed to fetch apiary scores');
export const completeFetchApiaryScores = createAction('Completed fetching apiary scores');

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
            if (apiaryList.find(a => Object.is(a.location, apiary.location))) {
                return update(apiary, {
                    fetching: { $set: true },
                });
            }
            return apiary;
        });

        const locationList = apiaryList.map(apiary => apiary.location);

        return axios
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
                const apiaryListWithData = apiaryList.map((apiary) => {
                    const latLngName = String(apiary.location.lat.toFixed(10))
                        + String(apiary.location.lng.toFixed(10));
                    return update(apiary, {
                        scores: {
                            [forageRange]: { $set: data[latLngName] },
                        },
                        fetching: { $set: false },
                    });
                });

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
