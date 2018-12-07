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

export function parseFormToObject(submitEvent) {
    let form = {};
    let i;
    for (i = 0; i < submitEvent.currentTarget.elements.length; i += 1) {
        const inputValue = submitEvent.currentTarget.elements[i].value;
        const inputName = submitEvent.currentTarget.elements[i].name;
        const newElement = { [inputName]: inputValue };
        form = Object.assign(newElement, form);
    }
    return form;
}
