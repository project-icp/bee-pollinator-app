import React from 'react';
import Popup from 'reactjs-popup';

import { Apiary, Survey } from '../propTypes';
import { toMonthNameYear } from '../utils';
import {
    SURVEY_TYPE_NOVEMBER,
    SURVEY_TYPE_APRIL,
    SURVEY_TYPE_MONTHLY,
} from '../constants';

import AprilSurveyForm from './AprilSurveyForm';
import NovemberSurveyForm from './NovemberSurveyForm';
import MonthlySurveyForm from './MonthlySurveyForm';

const SurveyCardListing = ({
    apiary,
    survey,
    survey: {
        month_year,
        survey_type,
        completed,
    },
}) => {
    let formComponent;
    switch (survey_type) {
        case SURVEY_TYPE_APRIL:
            formComponent = (close => (
                <AprilSurveyForm apiary={apiary} survey={survey} close={close} />
            ));
            break;
        case SURVEY_TYPE_NOVEMBER:
            formComponent = (close => (
                <NovemberSurveyForm apiary={apiary} survey={survey} close={close} />
            ));
            break;
        case SURVEY_TYPE_MONTHLY:
            formComponent = (close => (
                <MonthlySurveyForm apiary={apiary} survey={survey} close={close} />
            ));
            break;
        default:
            throw new Error(`Unknown survey type: ${survey_type}`);
    }
    return (
        <div className="listing">
            <div className={`listing__icon${completed ? '--completed' : ''}`}>
                {completed ? <i className="icon-check" /> : <i className="icon-circle" />}
            </div>
            <Popup
                trigger={(
                    <button type="button" className="listing__monthYear">
                        {toMonthNameYear(month_year)}
                        {' '}
                        <span className="survey__type">
                            {survey_type}
                        </span>
                    </button>
                )}
                className="modal surveyModal"
                modal
            >
                {formComponent}
            </Popup>
        </div>
    );
};

SurveyCardListing.propTypes = {
    apiary: Apiary.isRequired,
    survey: Survey.isRequired,
};

export default SurveyCardListing;
