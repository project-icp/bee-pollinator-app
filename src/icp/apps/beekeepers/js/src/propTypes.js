import {
    bool,
    number,
    shape,
    string,
} from 'prop-types';

import { RASTERS } from './constants';

export const LatLng = shape({
    lat: number.isRequired,
    lng: number.isRequired,
});

export const Score = shape({
    data: number,
    error: string,
});

export const Scores = shape(Object.keys(RASTERS).reduce(
    (map, r) => Object.assign(map, { [RASTERS[r]]: Score.isRequired }),
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
