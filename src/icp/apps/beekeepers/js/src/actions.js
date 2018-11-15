import { createAction } from 'redux-act';
import axios from 'axios';
import { INDICATORS } from './constants';

export const setSort = createAction('Set apiary sort');
export const setForageRange = createAction('Set forage range');
export const setApiaryList = createAction('Set the apiary list');
export const startFetchApiaryScores = createAction('Start fetching apiary scores');
export const failFetchApiaryScores = createAction('Failed to fetch apiary scores');
export const completeFetchApiaryScores = createAction('Completed fetching apiary scores');

export function fetchApiaryScores(apiary, forageRange) {
    return (dispatch, getState) => {
        // dispatch initial action declaration
        dispatch(startFetchApiaryScores());

        if (!apiary || !forageRange) {
            const err = !apiary
                ? 'No apiary provided' : 'No forage range provided';
            window.console.warn(err);
            return dispatch(failFetchApiaryScores(err));
        }

        // check if data for that apiary already exists
        // return the scores and complete action if exists
        // perform this sooner, perhaps here or in the component
        if (apiary.scores[forageRange].data) {
            return dispatch(completeFetchApiaryScores());
        }

        const {
            main: {
                apiaries,
            },
        } = getState();

        return axios
            .post('/beekeepers/fetch/', {
                location: apiary.location,
                forage_range: forageRange,
                indicators: Object.values(INDICATORS),
            })
            .then(({ data }) => {
                const apiaryWithData = Object.assign(apiary,
                    {
                        scores: {
                            [forageRange]: data,
                        },
                    });
                const newList = apiaries.concat(apiaryWithData);
                dispatch(completeFetchApiaryScores());
                dispatch(setApiaryList(newList));
            })
            .catch((error) => {
                window.console.warn(error);
                // enclose error in a response object
                return dispatch(failFetchApiaryScores(error));
            });
    };
}
