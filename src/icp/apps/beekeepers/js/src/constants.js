export const FORAGE_RANGE_3KM = '3km';
export const FORAGE_RANGE_5KM = '5km';

export const FORAGE_RANGES = [FORAGE_RANGE_3KM, FORAGE_RANGE_5KM];
export const DEFAULT_SORT = 'default';

export const INDICATORS = {
    NESTING_QUALITY: 'nesting',
    PESTICIDE: 'pesticide',
    FLORAL_SPRING: 'floral_spring',
    FLORAL_SUMMER: 'floral_summer',
    FLORAL_FALL: 'floral_fall',
};

export const INDICATOR_DETAILS = {
    nesting: {
        name: 'Nesting quality',
        description: 'Lorem ipsum of nesting quality.',
        scoreLabels: ['Nesting'],
        shortLabel: 'Nesting',
    },
    pesticide: {
        name: 'Pesticide quality',
        description: 'Lorem ipsum of pesticide quality.',
        scoreLabels: ['Pesticide'],
        shortLabel: 'Pesticide',
    },
    floral_spring: {
        name: 'Spring Floral quality',
        description: 'Lorem ipsum of spring floral quality.',
        scoreLabels: ['Spring Floral'],
        shortLabel: 'Spr. Floral',
    },
    floral_summer: {
        name: 'Summer Floral quality',
        description: 'Lorem ipsum of summer floral quality.',
        scoreLabels: ['Summer Floral'],
        shortLabel: 'Sum. Floral',
    },
    floral_fall: {
        name: 'Fall Floral quality',
        description: 'Lorem ipsum of fall floral quality.',
        scoreLabels: ['Fall Floral'],
        shortLabel: 'Fall Floral',
    },
};

export const SORT_OPTIONS = [DEFAULT_SORT].concat(Object.values(INDICATORS));

export const MAP_CENTER = [40.0, -76.079];
export const MAP_ZOOM = 10;

export const CONTRIBUTION_LEVEL_LIGHT = 'LIGHT';
export const CONTRIBUTION_LEVEL_PRO = 'PRO';

export const SURVEY_TYPE_NOVEMBER = 'NOVEMBER';
export const SURVEY_TYPE_APRIL = 'APRIL';
export const SURVEY_TYPE_MONTHLY = 'MONTHLY';


export const MITE_MANAGEMENT_OPTIONS = [
    'CHEMICAL_FORMIC_ACID_MAQS',
    'CHEMICAL_FORMIC_ACID_FORMIC_PRO',
    'CHEMICAL_OXALIC_ACID_VAPORIZATION',
    'CHEMICAL_OXALIC_ACID_DRIBBLE',
    'CHEMICAL_THYMOL_MENTHOL_APILIFE',
    'CHEMICAL_THYMOL_MENTHOL_APIGUARD',
    'CHEMICAL_SYNTHETIC_APIVAR',
    'CHEMICAL_SYNTHETIC_APISTAN',
    'CHEMICAL_SYNTHETIC_CHECKMITE_PLUS',
    'MECHANICAL_DRONE_BROOD_REMOVAL',
    'MECHANICAL_QUEEN_MANIPULATION',
];

export const SEASONS = [
    'SPRING',
    'SUMMER',
    'FALL',
    'WINTER',
];

export const VARROA_CHECK_METHODS = [
    'ALCOHOL_WASH',
    'SUGAR_SHAKE',
    'STICKY_BOARDS',
];

export const COLONY_LOSS_REASONS = [
    'VARROA_MITES',
    'INADEQUETE_FOOD_STORES',
    'POOR_QUEENS',
    'POOR_WEATHER_CONDITIONS',
    'COLONY_TOO_SMALL_IN_NOVEMBER',
    'PESTICIDE_EXPOSURE',
];

export const ACTIVITY_SINCE_LAST = [
    'REMOVED_HONEY',
    'REMOVED_BROOD',
    'FED_POLLEN_PROTEIN',
    'FED_SUGAR',
];
