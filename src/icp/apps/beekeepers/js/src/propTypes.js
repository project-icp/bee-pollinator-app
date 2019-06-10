import {
    bool,
    number,
    shape,
    string,
} from 'prop-types';

import { INDICATORS, FORAGE_RANGE_3KM, FORAGE_RANGE_5KM } from './constants';

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
    lat: number.isRequired,
    lng: number.isRequired,
    scores: shape({
        [FORAGE_RANGE_3KM]: Scores,
        [FORAGE_RANGE_5KM]: Scores,
    }).isRequired,
    fetching: bool.isRequired,
    selected: bool.isRequired,
    starred: bool.isRequired,
    surveyed: bool.isRequired,
});

export const UserSurvey = shape({
    user: number.isRequired,
    contribution_level: string.isRequired,
    phone: string,
    preferred_contact: string,
    year_began: number,
    organization: string,
    total_colonies: string,
    relocate: bool.isRequired,
    income: string,
    practice: string,
    varroa_management: bool.isRequired,
    varroa_management_trigger: string,
    purchased_queens: bool.isRequired,
    purchased_queens_sources: string,
    resistant_queens: bool.isRequired,
    resistant_queens_genetics: string,
    rear_queens: bool.isRequired,
    equipment: string,
});

export const Survey = shape({
    id: number,
    month_year: string.isRequired,
    num_colonies: number,
    created_at: string,
    survey_type: string.isRequired,
    apiary: number.isRequired,
    completed: bool.isRequired,
});

export const MonthlySurveyColony = shape({
    id: number,
    inspection_date: string,
    colony_name: string,
    colony_alive: bool,
    colony_loss_reason: string,
    num_bodies_supers_deep: number,
    num_bodies_supers_medium: number,
    num_bodies_supers_shallow: number,
    activity_since_last: string,
    queenright: bool,
    same_queen: string,
    queen_stock: string,
    queen_source: string,
    varroa_count_performed: bool,
    varroa_count_technique: string,
    varroa_count_result: number,
    varroa_treatment: string,
    hive_scale_id: string,
});
