import React from 'react';
import Popup from 'reactjs-popup';

import { Survey } from '../propTypes';
import { monthNames } from '../utils';
import {
    SURVEY_TYPE_NOVEMBER,
    SURVEY_TYPE_APRIL,
    SURVEY_TYPE_MONTHLY,
} from '../constants';

import AprilSurveyForm from './AprilSurveyForm';

const SurveyCardListing = ({
    survey: {
        id,
        apiary,
        month_year,
        survey_type,
        completed,
    },
}) => {
    let formComponent;
    switch (survey_type) {
        case SURVEY_TYPE_APRIL:
            formComponent = (
                <AprilSurveyForm month_year={month_year} apiaryId={apiary} surveyId={id} />
            );
            break;
        case SURVEY_TYPE_NOVEMBER:
            formComponent = <div />; // replace with nov form component
            break;
        case SURVEY_TYPE_MONTHLY:
            formComponent = <div />; // replace with monthly form component
            break;
        default:
            throw new Error(`Unknown survey type: ${survey_type}`);
    }
    return (
        <div className="listing">
            <div className={`listing__icon${completed ? '--completed' : ''}`}>
                {completed ? '✓' : '◯'}
            </div>
            <Popup
                trigger={(
                    <button type="button" className="listing__monthYear">
                        {monthNames[month_year.slice(0, 2)]}
                        {' '}
                        {month_year.slice(-4)}
                        {' '}
                        (
                        {survey_type}
                        )
                    </button>
                )}
                modal
            >
                {formComponent}
            </Popup>
        </div>
    );
};

SurveyCardListing.propTypes = {
    survey: Survey.isRequired,
};

export default SurveyCardListing;
