import React from 'react';
import { func, string, arrayOf } from 'prop-types';

const DropdownSelector = ({ title, options, onOptionClick }) => {
    const selectOptions = options.map(option => (
        <option value={option} key={option}>{option}</option>
    ));

    return (
        <form>
            <label htmlFor="dropdown-select">
                {title}
                <select
                    onChange={onOptionClick}
                    className="controls__select"
                    id="dropdown-select"
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
