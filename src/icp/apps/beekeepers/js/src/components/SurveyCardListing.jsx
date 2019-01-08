import React from 'react';

import { Survey } from '../propTypes';
import { monthNames } from '../utils';

const SurveyCardListing = ({ survey: { month_year, survey_type, completed } }) => (
    <div className="listing">
        <div className={`listing__icon${completed ? '--completed' : ''}`}>
            {completed ? '✓' : '◯'}
        </div>
        <a className="listing__monthYear" href="/">
            {monthNames[month_year.slice(0, 2)]}
            {' '}
            {month_year.slice(-4)}
            {' '}
            (
            {survey_type}
            )
        </a>
    </div>
);

SurveyCardListing.propTypes = {
    survey: Survey.isRequired,
};

export default SurveyCardListing;
