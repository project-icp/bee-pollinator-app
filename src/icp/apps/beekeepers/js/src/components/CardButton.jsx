import React from 'react';
import { bool, func, string } from 'prop-types';

const CardButton = ({
    icon,
    filled,
    tooltip,
    onClick,
    text,
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
            {text || <i className={`icon-${icon}${fillOrOutline}`} />}
        </button>
    );
};

CardButton.propTypes = {
    icon: string,
    filled: bool,
    tooltip: string.isRequired,
    onClick: func,
    text: string,
};

CardButton.defaultProps = {
    filled: null,
    onClick: () => {},
    icon: null,
    text: null,
};


const CardButtonWithIcon = props => (
    <CardButton
        {...props}
    />
);

CardButtonWithIcon.propTypes = {
    ...CardButton.propTypes,
    icon: string.isRequired,
};

const CardButtonWithText = props => (
    <CardButton
        {...props}
    />
);

CardButtonWithText.propTypes = {
    ...CardButton.propTypes,
    text: string.isRequired,
};

export { CardButtonWithText, CardButtonWithIcon };
