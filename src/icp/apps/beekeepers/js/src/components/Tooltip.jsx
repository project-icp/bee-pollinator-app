import React from 'react';
import Popup from 'reactjs-popup';

import { arrayOf, shape, string } from 'prop-types';

const Tooltip = ({ description }) => {
    const sections = description.map(({ title, body }) => (
        <div className="tooltip__text" key={body}>
            <strong>{title}</strong>
            <span>{body}</span>
        </div>
    ));
    return (
        <Popup
            trigger={<i className="icon-info-circle" />}
            position="top center"
            className="tooltip"
            on="hover"
        >
            <>
                {sections}
            </>
        </Popup>
    );
};

Tooltip.propTypes = {
    description: arrayOf(shape({
        title: string.isRequired,
        body: string.isRequired,
    })).isRequired,
};

export default Tooltip;
