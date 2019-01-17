import {
    SURVEY_TYPE_NOVEMBER,
    SURVEY_TYPE_APRIL,
    SURVEY_TYPE_MONTHLY,
} from './constants';
import csrfRequest from './csrfRequest';


export function toDashedString(value) {
    return value.toLowerCase().replace('_', '-');
}

export function toSpacedString(value) {
    return value.replace('_', '\xa0'); // \xa0 === &nbsp;
}

export function toTitleCase(value) {
    return value
        .split(/(\s+)/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

export function isSameLocation(a, b) {
    return a.lat === b.lat && a.lng === b.lng;
}

function isLastInSequence(s) {
    let isLast = true;

    [...s].forEach((c) => {
        if (c !== 'Z') {
            isLast = false;
        }
    });

    return isLast;
}

function getNextLetter(c) {
    const cc = c.charCodeAt(0);

    if (cc < 90) {
        return String.fromCharCode(cc + 1);
    }

    return 'A';
}

// Adapted from https://stackoverflow.com/a/34483399/6995854
export function getNextInSequence(s) {
    if (isLastInSequence(s)) {
        return 'A'.repeat(s.length + 1);
    }

    const prefix = s.slice(0, -1);
    const penultimate = prefix.slice(-1);
    const final = s.slice(-1);

    if (final === 'Z') {
        return prefix.slice(0, -1)
            + getNextLetter(penultimate)
            + getNextLetter(final);
    }

    return prefix + getNextLetter(final);
}

export function getMarkerClass({ selected, starred, surveyed }) {
    if (surveyed) {
        return 'marker--starred-survey';
    }

    if (starred) {
        return 'marker--starred';
    }

    if (selected) {
        return 'marker--selected';
    }

    return '';
}

export const monthNames = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    10: 'October',
    11: 'November',
    12: 'December',
};

/**
 * Given a month_year string in "MMYYYY" format, returns a string with the
 * full month name and the year. E.g. "042018" => "April 2018"
 *
 * @param {MMYYY} month_year
 */
export function toMonthNameYear(month_year) {
    const month = monthNames[month_year.slice(0, 2)];
    const year = month_year.slice(-4);

    return `${month} ${year}`;
}

export function sortByValue(a, b) {
    const valA = a[1].toUpperCase();
    const valB = b[1].toUpperCase();

    if (valA < valB) {
        return -1;
    }

    if (valA > valB) {
        return 1;
    }

    return 0;
}

export function arrayToSemicolonDelimitedString(arrayOfStrings) {
    return arrayOfStrings.filter(s => s.length > 0).join(';');
}

// Converts JSON data to Form Data since some back-end endpoints require that
export function toFormData(json) {
    const formData = new FormData();
    Object.entries(json).forEach(([key, value]) => formData.append(key, value));
    return formData;
}

/**
 * Given a list of surveys, returns a function that takes a month_year and
 * returns true the survey if found, otherwise null.
 *
 * @param {arrayOf(Survey)} surveys
 */
function makeSurveyMatcher(surveys) {
    return (month_year) => {
        const survey = surveys.find(s => s.month_year === month_year);
        if (survey) {
            survey.completed = true;
            return survey;
        }

        return null;
    };
}

/**
 * Given an Apiary, returns a list of November Survey objects since 2018,
 * like this:
 *
 * [{ month_year: '112018', survey_type: SURVEY_TYPE_NOVEMBER, completed: true },
 *  { month_year: '112019', survey_type: SURVEY_TYPE_NOVEMBER, completed: false }]
 *
 * @param {Apiary} apiary
 */
export function getNovemberSurveys({ id: apiary, surveys }) {
    const survey_type = SURVEY_TYPE_NOVEMBER;
    const startYear = 2018;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    // End at this year if after November (0-indexed 10), else last year
    const endYear = currentMonth >= 10 ? currentYear : currentYear - 1;
    const matchSurvey = makeSurveyMatcher(
        surveys.filter(s => s.survey_type === survey_type),
    );
    const novSurveys = [];

    for (let i = startYear; i <= endYear; i += 1) {
        const month_year = `11${i}`;
        const survey = matchSurvey(month_year) || {
            apiary,
            month_year,
            survey_type,
            completed: false,
        };

        novSurveys.push(survey);
    }

    return novSurveys;
}

/**
 * Given an Apiary, returns a list of April Survey objects since 2019,
 * like this:
 *
 * [{ month_year: '042019', survey_type: SURVEY_TYPE_APRIL, completed: true },
 *  { month_year: '042020', survey_type: SURVEY_TYPE_APRIL, completed: false }]
 *
 * @param {Apiary} apiary
 */
export function getAprilSurveys({ id: apiary, surveys }) {
    const survey_type = SURVEY_TYPE_APRIL;
    const startYear = 2019;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    // End at this year if after April (0-indexed 3), else last year
    const endYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const matchSurvey = makeSurveyMatcher(
        surveys.filter(s => s.survey_type === survey_type),
    );
    const aprSurveys = [];

    for (let i = startYear; i <= endYear; i += 1) {
        const month_year = `04${i}`;
        const survey = matchSurvey(month_year) || {
            apiary,
            month_year,
            survey_type,
            completed: false,
        };

        aprSurveys.push(survey);
    }

    return aprSurveys;
}

/**
 * Given an Apiary, returns a list of Monthly Survey objects since the date
 * of apiary creation, like this:
 *
 * [{ month_year: '012019', survey_type: SURVEY_TYPE_MONTHLY, completed: true },
 *  { month_year: '022019', survey_type: SURVEY_TYPE_MONTHLY, completed: false },
 *  { month_year: '032019', survey_type: SURVEY_TYPE_MONTHLY, completed: false }]
 *
 * @param {Apiary} apiary
 */
export function getMonthlySurveys({ id: apiary, created_at: createdAt, surveys }) {
    const survey_type = SURVEY_TYPE_MONTHLY;
    const currentDate = new Date();

    const startYear = Number(createdAt.substring(0, 4));
    const endYear = currentDate.getFullYear();

    const createdMonth = Number(createdAt.substring(5, 7));
    const currentMonth = currentDate.getMonth() + 1; // Add one to make 1-indexed

    const matchSurvey = makeSurveyMatcher(
        surveys.filter(s => s.survey_type === survey_type),
    );
    const mthSurveys = [];

    for (let y = startYear; y <= endYear; y += 1) {
        const startMonth = y === startYear ? createdMonth : 1;
        const endMonth = y === endYear ? currentMonth : 12;

        for (let m = startMonth; m <= endMonth; m += 1) {
            // Don't list current month until the 15th
            if (!(
                y === endYear
                && m === endMonth
                && currentDate.getDate() < 15
            )) {
                const twoDigitMonth = `0${m}`.slice(-2);
                const month_year = `${twoDigitMonth}${y}`;
                const survey = matchSurvey(month_year) || {
                    apiary,
                    month_year,
                    survey_type,
                    completed: false,
                };

                mthSurveys.push(survey);
            }
        }
    }

    return mthSurveys;
}

export function sortSurveysByMonthYearDescending(a, b) {
    const monthA = a.month_year.slice(0, 2);
    const yearA = a.month_year.slice(-4);

    const monthB = b.month_year.slice(0, 2);
    const yearB = b.month_year.slice(-4);

    if (yearA === yearB) {
        return Number(monthB) - Number(monthA);
    }

    return Number(yearB) - Number(yearA);
}

/**
 * Given an Apiary ID and, optionally, a Survey ID or form, returns a post or get request
 *
 * @param {number} apiary
 * @param {number} id
 * @param {object} form
 *      {
 *          survey: {Survey},
 *          ...form fields,
 *      }
 */
export function getOrCreateSurveyRequest({ apiary, id, form }) {
    const request = id
        ? csrfRequest.get(`/beekeepers/apiary/${apiary}/survey/${id}/`)
        : csrfRequest.post(`/beekeepers/apiary/${apiary}/survey/`, form);

    return request;
}
