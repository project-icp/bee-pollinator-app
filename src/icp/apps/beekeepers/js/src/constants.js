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

export const SORT_OPTIONS = [DEFAULT_SORT].concat(Object.values(INDICATORS));

export const MAP_CENTER = [40.0, -76.079];
export const MAP_ZOOM = 10;
