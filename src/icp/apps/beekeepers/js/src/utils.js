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
