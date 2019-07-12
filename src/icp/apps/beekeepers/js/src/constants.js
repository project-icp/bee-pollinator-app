export const FORAGE_RANGE_3KM = '3km';
export const FORAGE_RANGE_5KM = '5km';

export const FORAGE_RANGES = {
    [FORAGE_RANGE_3KM]: FORAGE_RANGE_3KM,
    [FORAGE_RANGE_5KM]: FORAGE_RANGE_5KM,
};
export const DEFAULT_SORT = 'default';

export const INDICATORS = {
    NESTING_QUALITY: 'nesting',
    INSECTICIDE: 'insecticide',
    FLORAL_SPRING: 'floral_spring',
    FLORAL_SUMMER: 'floral_summer',
    FLORAL_FALL: 'floral_fall',
};

export const INDICATOR_DETAILS = {
    nesting: {
        name: 'Nesting quality',
        scoreLabels: ['Nesting'],
        shortLabel: 'Nesting',
        scoreStops: [7, 33, 39, 46, 66],
    },
    insecticide: {
        name: 'Insecticide load',
        scoreLabels: ['Insecticide'],
        shortLabel: 'Insecticide',
        scoreStops: [0, 13, 26, 37, 208],
    },
    floral_spring: {
        name: 'Spring Floral quality',
        scoreLabels: ['Spring Floral'],
        shortLabel: 'Spr. Floral',
        scoreStops: [18, 40, 46, 53, 69],
    },
    floral_summer: {
        name: 'Summer Floral quality',
        scoreLabels: ['Summer Floral'],
        shortLabel: 'Sum. Floral',
        scoreStops: [21, 44, 46, 49, 56],
    },
    floral_fall: {
        name: 'Fall Floral quality',
        scoreLabels: ['Fall Floral'],
        shortLabel: 'Fall Floral',
        scoreStops: [15, 30, 33, 36, 44],
    },
};

export const SORT_OPTIONS = Object
    .entries(INDICATOR_DETAILS)
    .reduce((acc, [indicator, { name }]) => {
        acc[indicator] = name;
        return acc;
    }, { default: 'Default' });

export const MAP_CENTER = [40.0, -76.079];
export const MAP_ZOOM = 10;

export const CONTRIBUTION_LEVEL_LIGHT = 'LIGHT';
export const CONTRIBUTION_LEVEL_PRO = 'PRO';

export const SURVEY_TYPE_NOVEMBER = 'NOVEMBER';
export const SURVEY_TYPE_APRIL = 'APRIL';
export const SURVEY_TYPE_MONTHLY = 'MONTHLY';


export const MITE_MANAGEMENT_OPTIONS = [
    'THYMOL',
    'AMITRAZ',
    'FORMIC_ACID',
    'OXALIC_ACID',
    'APISTAN',
    'CHECKMITE',
    'QUEEN_MANIPULATION',
    'DRONE_REMOVE',
    'NONE',
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
    'BEAR_OR_NATURAL_DISASTER',
];

export const ACTIVITY_SINCE_LAST = [
    'REMOVED_HONEY',
    'REMOVED_BROOD',
    'FED_POLLEN_OR_PROTEIN',
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

export const VARROA_MANAGEMENT_DESCRIPTION = {
    title: '',
    body: 'Beekeepers manage for varroa in numerous ways. Chemical treatments include organic acids (oxalic and formic acids), thymol and other menthols, and synthetics. Mechanical strategies include removing drone brood and briefly caging the queen in the summer.',
};

export const VARROA_ALCOHOL_WASH_DESCRIPTION = {
    title: '',
    body: 'The alcohol wash is the gold standard in Varroa monitoring and is recommended due to precision and consistency. Premade cups designed for the alcohol wash work very well. Submerge nurse bees (1/2 cup or 300 bees) in alcohol, shake for 30 seconds, and allow to soak for 30 seconds to 1 minute. Next, strain the bees from the alcohol and count the mites. An important consideration when monitoring for mites is to do things as consistently as possible.',
};

export const VARROA_SUGAR_SHAKE_DESCRIPTION = {
    title: '',
    body: 'The sugar shake or sugar roll method is similar to the alcohol wash. Powdered sugar is used instead of alcohol and the bees are vigorously shaken for 2 minutes or more to dislodge mites. The mites are then separated through a screened lid and counted. This method is less accurate and more time consuming than the alcohol wash but is preferred by beekeepers who want to reduce bee deaths and who are not monitoring large numbers of colonies.',
};

export const VARROA_STICKYBOARD_DESCRIPTION = {
    title: '',
    body: 'Stickyboards are a less reliable form of regular Varroa monitoring. The number of mites that drop can vary greatly and the boards require specific equipment, regular visits to the colonies, and the time to count multiple boards over many days. Mite counts with using this method cannot be integrated into the pro level of participation at this time.',
};

export const DEEP_HIVE_BODIES_DESCRIPTION = {
    title: 'Deep hive bodies ',
    body: 'for 10 frame Langstroth measure 19 ⅞” in length, 16 ¼” wide and 9 ⅝” in height, the frames measures 19” in length and 9 ⅛” in height.',
};

export const MEDIUM_HIVE_BODIES_DESCRIPTION = {
    title: 'Medium hive bodies ',
    body: 'or Illinois super for 10 frame Langstroth measure 19 ⅞” in length, 16 ¼” wide and 6 ⅝” in height, the frames measures 19” in length and 6 ¼” in height.',
};

export const SHALLOW_HIVE_BODIES_DESCRIPTION = {
    title: 'Shallow hive bodies ',
    body: 'or honey super for 10 frame Langstroth measure 19 ⅞” in length, 16 ¼” wide and 5 11/16” in height, the frames measures 19” in length and 5 ⅝” in height.',
};

export const QUEEN_STOCK_DESCRIPTION = {
    title: '',
    body: 'Please note here if your queen came from a particular genetic line such as Russian, Italian, or has Varroa sensitive or mite resistant genetics.',
};

export const QUEENRIGHT_DESCRIPTION = {
    title: '',
    body: 'You can determine if a queen is present by locating her physically or checking for eggs. However, by late fall the queen stops laying eggs. We ask that beekeepers use their best judgement when making the assessments during these times.',
};

export const THYMOL_DESCRIPTION = {
    title: '',
    body: 'The active ingredient in Apilife and Apiguard is thymol.',
};

export const AMITRAZ_DESCRIPTION = {
    title: '',
    body: 'The active ingredient in Apivar is amitraz.',
};
