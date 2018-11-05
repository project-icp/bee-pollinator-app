import React from 'react';
import { arrayOf, string } from 'prop-types';

import { Score } from '../propTypes';
import { toDashedString, toSpacedString } from '../utils';

const ScoresLabel = ({ raster, scores }) => (
    <div className={`indicator indicator--${toDashedString(raster)}`}>
        <div className="indicator__number">
            {scores.map(({ data, error }) => (error ? '!' : data)).join('/')}
        </div>
        <div className="indicator__name">{toSpacedString(raster)}</div>
    </div>
);

ScoresLabel.propTypes = {
    raster: string.isRequired,
    scores: arrayOf(Score).isRequired,
};

export default ScoresLabel;
