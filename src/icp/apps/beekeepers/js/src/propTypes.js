import {
    bool,
    number,
    shape,
    string,
} from 'prop-types';

import { INDICATORS } from './constants';

export const LatLng = shape({
    lat: number.isRequired,
    lng: number.isRequired,
});

export const Score = shape({
    data: number,
    error: string,
});

export const Scores = shape(Object.keys(INDICATORS).reduce(
    (map, r) => Object.assign(map, { [INDICATORS[r]]: Score.isRequired }),
    {},
));

export const Apiary = shape({
    name: string.isRequired,
    marker: string.isRequired,
    location: LatLng.isRequired,
    scores: shape({
        threeKm: Scores,
        fiveKm: Scores,
    }).isRequired,
    fetching: bool.isRequired,
    selected: bool.isRequired,
    starred: bool.isRequired,
    surveyed: bool.isRequired,
});
