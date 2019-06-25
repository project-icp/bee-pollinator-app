import React from 'react';
import { func, string, arrayOf } from 'prop-types';

const DropdownSelector = ({ title, options, onOptionClick }) => {
    const selectOptions = options.map(([option, label]) => (
        <option value={option} key={option}>
            {label}
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
    options: arrayOf(arrayOf(string)).isRequired,
    onOptionClick: func.isRequired,
};

export default DropdownSelector;
