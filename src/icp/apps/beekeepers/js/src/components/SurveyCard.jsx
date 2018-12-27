import React from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';
import { Apiary } from '../propTypes';

import { listMonthYearsSinceCreation, monthToText } from '../utils';
import { setApiarySurvey } from '../actions';

const SurveyCard = ({ apiary, dispatch }) => {
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
                <div className="listing" key={name}>
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
        const apiarySurveyDates = apiary.surveys.map((s) => {
            const monthName = monthToText(Number(s.month_year.substring(0, 2)) - 1);
            const year = s.month_year.substring(2, 6);
            return `${monthName}-${year}`;
        });
        cardBody = lastFourMonthYears.map((m) => {
            const i = apiarySurveyDates.findIndex(date => date === m);
            if (i >= 0) {
                return (
                    <div className="listing" key={name + m}>
                        <div className="listing__icon--completed">✓</div>
                        <a className="listing__monthYear" href="/">{m}</a>
                    </div>
                );
            }
            return (
                <div className="listing" key={name + m}>
                    <div className="listing__icon">◯</div>
                    <a className="listing__monthYear" href="/">{m}</a>
                    <a className="listing__start" href="/">Start survey</a>
                </div>
            );
        });

        if (monthYears.length > 4) {
            cardFooter = (
                <div className="surveyCard__footer">
                    <button type="button" className="button">View full history</button>
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
        <div className="surveyCard" key={name}>
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
};

export default connect()(SurveyCard);
