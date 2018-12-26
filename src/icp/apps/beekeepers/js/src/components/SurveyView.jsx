import React from 'react';

import { arrayOf } from 'prop-types';
import { Apiary } from '../propTypes';

import SurveyCard from './SurveyCard';
import { listMonthYearsSinceCreation, monthToText } from '../utils';

const SurveyView = ({ apiaries }) => {
    const surveyedApiaries = apiaries.filter(a => a.surveyed);

    const surveyCards = { complete: [], incomplete: [] };

    surveyedApiaries.forEach((a) => {
        const monthYearsSinceCreation = listMonthYearsSinceCreation(a);
        const apiarySurveyDates = a.surveys.map((s) => {
            const monthName = monthToText(Number(s.month_year.substring(0, 2)) - 1);
            const year = s.month_year.substring(2, 6);
            return `${monthName}-${year}`;
        });
        const surveyCard = <SurveyCard apiary={a} key={a.name} />;
        if (monthYearsSinceCreation.every(date => apiarySurveyDates.find(d => d === date))) {
            surveyCards.complete.push(surveyCard);
        } else {
            surveyCards.incomplete.push(surveyCard);
        }
    });

    const noSurveyCards = apiaries.map(a => (
        !a.surveyed ? <SurveyCard apiary={a} key={a.name} /> : null
    ));

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
                    {surveyCards.incomplete}
                </div>
                <div className="survey__body--section">
                    Up to date
                    {surveyCards.complete}
                </div>
                <div className="survey__body--section">
                    This is not in the study
                    {noSurveyCards}
                </div>
            </div>
        </div>
    );
};

SurveyView.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
};

export default SurveyView;
