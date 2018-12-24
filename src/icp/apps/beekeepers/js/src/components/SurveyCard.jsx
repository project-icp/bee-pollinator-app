import React from 'react';
import { connect } from 'react-redux';
import { bool, func } from 'prop-types';
import { Apiary } from '../propTypes';

import { listMonthYearsSinceCreation } from '../utils';
import { setApiarySurvey } from '../actions';

const SurveyCard = ({ apiary, dispatch, surveyed }) => {
    const {
        name,
        // surveyed,
        // monthyear,
    } = apiary;

    let cardBody;

    if (!surveyed) {
        const onSurvey = () => dispatch(setApiarySurvey(apiary));
        cardBody = (
            <>
                <div className="listing">
                    This apiary is not in the study.
                </div>
                <button
                    type="button"
                    className="button--long"
                    onClick={onSurvey}
                >
                    Add to study
                </button>
            </>
        );
    } else {
        const monthYears = listMonthYearsSinceCreation(apiary);
        const icon = 'star';
        cardBody = monthYears.map(m => (
            <div className="listing">
                <i className={`icon-${icon}-fill listing__icon`} />
                <a className="listing__monthYear" href="/">{m}</a>
                <a className="listing__start" href="/">Start survey</a>
            </div>
        ));
    }

    // TODO: Sort surveys into 3 buckets

    // TODO: view full history

    // TODO: ...

    // TODO: or pinch off the map into a separate card ?

    return (
        <li className="surveyCard">
            <div className="surveyCard__map">
                TODO map
            </div>
            <div className="surveyCard__content">
                <div className="surveyCard__title">{name}</div>
                <div className="surveyCard__body">
                    {cardBody}
                </div>
            </div>
        </li>
    );
};

SurveyCard.propTypes = {
    apiary: Apiary.isRequired,
    dispatch: func.isRequired,
    surveyed: bool,
};

SurveyCard.defaultProps = {
    surveyed: true,
};

export default connect()(SurveyCard);
