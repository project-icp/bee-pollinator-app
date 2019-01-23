import React from 'react';
import { arrayOf, string } from 'prop-types';
import Popup from 'reactjs-popup';

import { Score } from '../propTypes';
import { toDashedString } from '../utils';
import { INDICATOR_DETAILS } from '../constants';


function generateScore(data, error) {
    // Handle nodata values by representing as a 'double-dash'
    if (data < 0) {
        return '--';
    }

    return error ? 'Err' : Math.round(data * 100);
}

const ScoresLabel = ({ indicator, scores }) => {
    const formattedScores = scores.map(({ data, error }) => generateScore(data, error)).join('/');
    const score = formattedScores[0] ? formattedScores : '!';
    const indicatorDetails = INDICATOR_DETAILS[indicator];
    return (
        <Popup
            trigger={(
                <div className={`indicator indicator--${toDashedString(indicator)}`}>
                    <div className="indicator__number">
                        {score}
                    </div>
                    <div className="indicator__name">{indicatorDetails.shortLabel}</div>
                </div>
            )}
            position="top center"
            on="hover"
        >
            <div className="indicator__popup">
                <div className="name">{indicatorDetails.name}</div>
                <div className="description">{indicatorDetails.description}</div>
            </div>
        </Popup>

    );
};

ScoresLabel.propTypes = {
    indicator: string.isRequired,
    scores: arrayOf(Score).isRequired,
};

export default ScoresLabel;
