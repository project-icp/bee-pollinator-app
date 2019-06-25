import React from 'react';
import { bool, func, string } from 'prop-types';

const CardButton = ({
    icon,
    filled,
    tooltip,
    onClick,
}) => {
    const fillOrOutline = (() => {
        if (filled === true) return '-fill';
        if (filled === false) return '-outline';
        return '';
    })();

    return (
        <button
            type="button"
            className="card__button"
            title={tooltip}
            onClick={onClick}
        >
            <i className={`icon-${icon}${fillOrOutline}`} />
        </button>
    );
};

CardButton.propTypes = {
    icon: string.isRequired,
    filled: bool,
    tooltip: string.isRequired,
    onClick: func,
};

CardButton.defaultProps = {
    filled: null,
    onClick: () => {},
};

export default CardButton;
