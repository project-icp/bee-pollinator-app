import React from 'react';

import { arrayOf } from 'prop-types';
import { Apiary } from '../propTypes';

import SurveyCard from './SurveyCard';

const SurveyView = ({ apiaries }) => {
    const surveyCards = apiaries.map(a => <SurveyCard apiary={a} />);

    return (
        <div className="survey">
            <div className="survey__header">
                Survey
            </div>
            <div className="survey__body">
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
                <div className="survey__body--section">
                    Response needed
                    {surveyCards}
                </div>
                <div className="survey__body--section">
                    Up to date
                </div>
                <div className="survey__body--section">
                    This is not in the study
                </div>
            </div>
        </div>
    );
};

SurveyView.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
};

export default SurveyView;
