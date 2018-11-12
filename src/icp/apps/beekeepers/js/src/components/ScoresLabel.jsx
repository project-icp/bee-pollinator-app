import React from 'react';
import { arrayOf, string } from 'prop-types';

import { Score } from '../propTypes';
import { toDashedString, toSpacedString } from '../utils';

const ScoresLabel = ({ indicator, scores }) => (
    <div className={`indicator indicator--${toDashedString(indicator)}`}>
        <div className="indicator__number">
            {scores.map(({ data, error }) => (error ? '!' : data)).join('/')}
        </div>
        <div className="indicator__name">{toSpacedString(indicator)}</div>
    </div>
);

ScoresLabel.propTypes = {
    indicator: string.isRequired,
    scores: arrayOf(Score).isRequired,
};

export default ScoresLabel;
