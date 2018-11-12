export const FORAGE_RANGE_3KM = '3km';
export const FORAGE_RANGE_5KM = '5km';

export const FORAGE_RANGES = [FORAGE_RANGE_3KM, FORAGE_RANGE_5KM];
export const DEFAULT_SORT = 'default';

export const INDICATORS = {
    NESTING_QUALITY: 'nesting_quality',
    PESTICIDE: 'pesticide',
    FORAGE_SPRING: 'forage_spring',
    FORAGE_SUMMER: 'forage_summer',
    FORAGE_FALL: 'forage_fall',
};

export const SORT_OPTIONS = [DEFAULT_SORT].concat(Object.values(INDICATORS));

export const MAP_CENTER = [37.899, -97.079];
export const MAP_ZOOM = 10;
