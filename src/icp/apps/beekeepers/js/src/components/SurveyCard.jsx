import React from 'react';
import { connect } from 'react-redux';
import { arrayOf, func } from 'prop-types';

import { Apiary, Survey } from '../propTypes';
import { setApiarySurvey } from '../actions';

import SurveyCardListing from './SurveyCardListing';

const SurveyCard = ({ apiary, dispatch, surveys }) => {
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
        const shownSurveys = surveys.slice(0, 4);

        cardBody = shownSurveys.map(survey => (
            <SurveyCardListing
                key={name + survey.month_year + survey.survey_type}
                survey={survey}
            />
        ));

        if (surveys.length > 4) {
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
    surveys: arrayOf(Survey).isRequired,
};

export default connect()(SurveyCard);
