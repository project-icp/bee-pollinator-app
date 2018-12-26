import React from 'react';
import { connect } from 'react-redux';
import { bool, func } from 'prop-types';
import { Apiary } from '../propTypes';

import { listMonthYearsSinceCreation } from '../utils';
import { setApiarySurvey } from '../actions';

const SurveyCard = ({ apiary, dispatch, completed }) => {
    const {
        name,
        surveyed,
    } = apiary;

    let cardBody;
    let cardFooter = null;

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
        const lastFourMonthYears = monthYears.slice(0, 4);
        if (completed) {
            cardBody = lastFourMonthYears.map(m => (
                <div className="listing">
                    <div className="listing__icon--completed">✓</div>
                    <a className="listing__monthYear" href="/">{m}</a>
                </div>
            ));
        } else {
            cardBody = lastFourMonthYears.map(m => (
                <div className="listing">
                    <div className="listing__icon">◯</div>
                    <a className="listing__monthYear" href="/">{m}</a>
                    <a className="listing__start" href="/">Start survey</a>
                </div>
            ));
        }

        if (monthYears.length > 4) {
            cardFooter = (
                <div className="surveyCard__footer">
                    <button type="button" className="button" onClick="">View full history</button>
                    <div>...</div>
                </div>
            );
        } else {
            cardFooter = (
                <div className="surveyCard__footer">
                    <div />
                    <div>...</div>
                </div>
            );
        }
    }

    return (
        <div className="surveyCard">
            <div className="surveyCard__content">
                <div className="surveyCard__title">{name}</div>
                <div className="surveyCard__body">
                    {cardBody}
                </div>
            </div>
            {cardFooter}
        </div>
    );
};

SurveyCard.propTypes = {
    apiary: Apiary.isRequired,
    dispatch: func.isRequired,
    completed: bool,
};

SurveyCard.defaultProps = {
    completed: true,
};

export default connect()(SurveyCard);
