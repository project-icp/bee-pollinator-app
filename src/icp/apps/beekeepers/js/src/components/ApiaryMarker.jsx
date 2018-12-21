import React from 'react';

import { Apiary } from '../propTypes';
import { getMarkerClass } from '../utils';

const ApiaryMarker = ({ apiary }) => {
    const markerClass = getMarkerClass(apiary);

    return (
        <div className={`marker map-marker ${markerClass}`}>
            {apiary.marker}
        </div>
    );
};

ApiaryMarker.propTypes = {
    apiary: Apiary.isRequired,
};

export default ApiaryMarker;
