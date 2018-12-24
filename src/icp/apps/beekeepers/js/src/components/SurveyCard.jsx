import React from 'react';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';

import { listMonthYearsSinceCreation } from '../utils';

const SurveyCard = ({ apiary }) => {
    const {
        name,
        // surveyed,
        // monthyear,
    } = apiary;

    const monthYears = listMonthYearsSinceCreation(apiary);

    const surveyedMonthYears = monthYears.map(m => (
        <a href="/">{m}</a>
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
