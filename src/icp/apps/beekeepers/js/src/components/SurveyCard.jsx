import React from 'react';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';

const SurveyCard = ({ apiary }) => {
    const {
        name,
        // surveyed,
        // monthyear,
    } = apiary;
    
    const surveyedMonthYears = apiary.surveys.map(s => (
        <a href="/">{s.month_year}</a>
    ));

    return (
        <li className="surveyCard">
            <div className="surveyCard__map">
                TODO map
            </div>
            <div className="surveyCard__content">
                <div className="surveyCard__title">{name}</div>
                <div className="surveyCard__body">
                    {surveyedMonthYears}
                </div>
            </div>
        </li>
    );
};

SurveyCard.propTypes = {
    apiary: Apiary.isRequired,
};

export default connect()(SurveyCard);
