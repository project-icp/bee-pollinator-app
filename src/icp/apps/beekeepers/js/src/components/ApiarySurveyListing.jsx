import React from 'react';
import { arrayOf } from 'prop-types';

import { Apiary, Survey } from '../propTypes';
import SurveyCardListing from './SurveyCardListing';

const ApiarySurveyListing = ({ apiary, surveys }) => {
    const { name } = apiary;
    const listings = surveys.map(survey => (
        <SurveyCardListing
            key={name + survey.month_year + survey.survey_type}
            apiary={apiary}
            survey={survey}
        />
    ));

    return (
        <div className="historyModal">
            <h2 className="title">{name}</h2>
            {listings}
        </div>
    );
};

ApiarySurveyListing.propTypes = {
    apiary: Apiary.isRequired,
    surveys: arrayOf(Survey).isRequired,
};

export default ApiarySurveyListing;
