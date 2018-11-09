import React from 'react';
import { func, string, arrayOf } from 'prop-types';
import { toSpacedString, toTitleCase } from '../utils';

const DropdownSelector = ({ title, options, onOptionClick }) => {
    const selectOptions = options.map((option) => {
        const label = toTitleCase(toSpacedString(option));
        return (
            <option value={option} key={option}>
                {label}
            </option>
        );
    });

    return (
        <form className="dropdown">
            <label className="dropdown__label" htmlFor="dropdown-select">
                {title}
                <select
                    className="dropdown__selector"
                    onChange={onOptionClick}
                    name="dropdown-select"
                >
                    {selectOptions}
                </select>
            </label>
        </form>
    );
};

DropdownSelector.propTypes = {
    title: string.isRequired,
    options: arrayOf(string).isRequired,
    onOptionClick: func.isRequired,
};

export default DropdownSelector;
