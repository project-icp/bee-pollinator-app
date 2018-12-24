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
    const icon = 'star';
    const surveyedMonthYears = monthYears.map(m => (
        <div className="listing">
            <i className={`icon-${icon}-fill listing__icon`} />
            <a className="listing__monthYear" href="/">{m}</a>
            <a className="listing__start" href="/">Start survey</a>
        </div>
    ));


    // TODO: Create correct monthyear link styles

    // TODO: Sort surveys into 3 buckets

    // TODO: or pinch off the map into a separate card ?

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
