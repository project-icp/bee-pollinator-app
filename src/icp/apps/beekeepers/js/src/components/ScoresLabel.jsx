import React from 'react';
import { arrayOf, string } from 'prop-types';

import { Score } from '../propTypes';
import { toDashedString, toSpacedString } from '../utils';

const ScoresLabel = ({ indicator, scores }) => {
    const formattedScores = scores.map(({ data, error }) => (error ? NaN : Math.round(data))).join('/');
    const score = formattedScores[0] ? formattedScores : '!';
    return (
        <div className={`indicator indicator--${toDashedString(indicator)}`}>
            <div className="indicator__number">
                {score}
            </div>
            <div className="indicator__name">{toSpacedString(indicator)}</div>
        </div>
    );
};

ScoresLabel.propTypes = {
    indicator: string.isRequired,
    scores: arrayOf(Score).isRequired,
};

export default ScoresLabel;
