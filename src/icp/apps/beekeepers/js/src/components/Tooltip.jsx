import React from 'react';
import Popup from 'reactjs-popup';

import { arrayOf, string } from 'prop-types';

const Tooltip = ({ description }) => {
    const sections = description.map(d => <div className="tooltip__text" key={d}>{d}</div>);
    return (
        <Popup
            trigger={<span className="info">ℹ</span>}
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
    description: arrayOf(string).isRequired,
};

export default Tooltip;
