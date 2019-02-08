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
        scoreStops: [7, 33, 39, 46, 66],
    },
    pesticide: {
        name: 'Pesticide quality',
        description: 'Lorem ipsum of pesticide quality.',
        scoreLabels: ['Pesticide'],
        shortLabel: 'Pesticide',
        scoreStops: [0, 13, 26, 37, 208],
    },
    floral_spring: {
        name: 'Spring Floral quality',
        description: 'Lorem ipsum of spring floral quality.',
        scoreLabels: ['Spring Floral'],
        shortLabel: 'Spr. Floral',
        scoreStops: [18, 40, 46, 53, 69],
    },
    floral_summer: {
        name: 'Summer Floral quality',
        description: 'Lorem ipsum of summer floral quality.',
        scoreLabels: ['Summer Floral'],
        shortLabel: 'Sum. Floral',
        scoreStops: [21, 44, 46, 49, 56],
    },
    floral_fall: {
        name: 'Fall Floral quality',
        description: 'Lorem ipsum of fall floral quality.',
        scoreLabels: ['Fall Floral'],
        shortLabel: 'Fall Floral',
        scoreStops: [15, 30, 33, 36, 44],
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

export const CONTRIBUTION_LEVEL_LIGHT_DESCRIPTION = {
    title: 'Light: ',
    body: 'You will be asked to fill out a survey about your bees in November and April.',
};

export const CONTRIBUTION_LEVEL_PRO_DESCRIPTION = {
    title: 'Pro: ',
    body: 'You will be asked to fill out a monthly survey, providing information for one to three colonies per apiary. This information includes colony size, Varroa counts, and colony management. You can access the surveys later, so you can also see how your colonies perform over time.',
};

export const RELOCATE_COLONIES_DESCRIPTION = {
    title: '',
    body: 'At this point, we are only gathering data on colonies that remain in one location throughout the year.',
};
