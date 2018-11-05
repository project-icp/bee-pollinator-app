export function toDashedString(value) {
    return value.toLowerCase().replace('_', '-');
}

export function toSpacedString(value) {
    return value.replace('_', '\xa0'); // \xa0 === &nbsp;
}
