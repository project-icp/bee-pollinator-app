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
