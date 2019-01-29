import React from 'react';
import { bool, func, string } from 'prop-types';

const CardButton = ({
    icon,
    filled,
    tooltip,
    onClick,
}) => {
    const fillOrOutline = filled ? 'fill' : 'outline';

    return (
        <button
            type="button"
            className="card__button"
            title={tooltip}
            onClick={onClick}
        >
            <i className={`icon-${icon}-${fillOrOutline}`} />
        </button>
    );
};

CardButton.propTypes = {
    icon: string.isRequired,
    filled: bool.isRequired,
    tooltip: string.isRequired,
    onClick: func,
};

CardButton.defaultProps = {
    onClick: () => {},
};

export default CardButton;
