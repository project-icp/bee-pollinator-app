import {
    bool,
    number,
    shape,
    string,
} from 'prop-types';

import { INDICATORS, FORAGE_RANGE_3KM, FORAGE_RANGE_5KM } from './constants';

export const LatLng = shape({
    lat: number.isRequired,
    lng: number.isRequired,
});

export const Score = shape({
    data: number,
    error: string,
});

export const Scores = shape(Object.keys(INDICATORS).reduce(
    (map, r) => Object.assign(map, { [INDICATORS[r]]: Score }),
    {},
));

export const Apiary = shape({
    name: string.isRequired,
    marker: string.isRequired,
    location: LatLng.isRequired,
    scores: shape({
        [FORAGE_RANGE_3KM]: Scores,
        [FORAGE_RANGE_5KM]: Scores,
    }).isRequired,
    fetching: bool.isRequired,
    selected: bool.isRequired,
    starred: bool.isRequired,
    surveyed: bool.isRequired,
});
