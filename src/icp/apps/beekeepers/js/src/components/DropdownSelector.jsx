import React from 'react';
import { func, string, arrayOf } from 'prop-types';
import { toSpacedString } from '../utils';

const DropdownSelector = ({ title, options, onOptionClick }) => {
    const selectOptions = options.map(option => (
        <option
            value={option}
            key={option}
            className="dropdown__option"
        >
            {toSpacedString(option)}
        </option>
    ));

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
