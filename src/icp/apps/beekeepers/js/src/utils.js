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

export const monthNames = ['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function monthToText(month) {
    // Counts months from 0-11
    return monthNames[month];
}

export function listMonthYearsSinceCreation(apiary) {
    // Count months from 0-11, where January is 0
    const createdYear = Number(apiary.created_at.substring(0, 4));
    const createdMonth = Number(apiary.created_at.substring(5, 7)) - 1;

    // The Date API counts months from 0
    const timeNow = new Date();
    const monthNow = timeNow.getMonth();
    const yearNow = timeNow.getFullYear();

    let months = 0;
    months = (yearNow - createdYear) * 12;
    months -= createdMonth;
    months += monthNow;
    const monthDiff = months <= 0 ? 0 : months;

    let monthCounter = monthNow;
    let yearCounter = yearNow;
    const monthYears = [];
    let i = 0;
    for (i = 0; i < monthDiff + 1; i += 1) {
        monthYears.push(`${monthToText(monthCounter)}-${String(yearCounter)}`);
        monthCounter -= 1;
        if (monthCounter < 1) {
            yearCounter -= 1;
            monthCounter = 11;
        }
    }

    return monthYears;
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
