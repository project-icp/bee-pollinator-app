import React from 'react';

import { arrayOf } from 'prop-types';
import { Apiary } from '../propTypes';


const SurveyView = ({ apiaries }) => (
    <div className="survey">
        <div className="survey__header">
            Survey
        </div>
        <div className="survey__body">
            <div>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                {apiaries[0].name}
            </div>
            <div className="survey__body--section">
                Response needed
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

SurveyView.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
};

export default SurveyView;
