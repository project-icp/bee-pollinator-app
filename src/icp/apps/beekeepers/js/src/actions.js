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
        dispatch(startFetchApiaryScores());

        if (!apiary || !forageRange) {
            const err = !apiary
                ? 'No apiary provided' : 'No forage range provided';
            window.console.warn(err);
            return dispatch(failFetchApiaryScores(err));
        }

        // check if data for that apiary already exists
        // return the scores and complete the action loop if it exists
        // TODO?: perform this sooner, perhaps here or in the component
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
                const updatedApiary = Object.assign({}, apiary);
                updatedApiary.scores[forageRange] = data;

                // TODO: Authenticated user should save apiaryWithData to
                // the database and update the redux store of apiaries
                // from a GET/list call

                // For unauthenticated user relying purely on redux/
                // localStorage, manually update the apiary listing with data
                const removedApiaryList = apiaries.filter(a => (
                    a.location !== apiary.location
                ));
                const newList = removedApiaryList.concat(updatedApiary);

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
