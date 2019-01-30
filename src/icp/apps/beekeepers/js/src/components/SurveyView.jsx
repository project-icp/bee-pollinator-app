import React from 'react';
import { arrayOf, bool } from 'prop-types';

import { Apiary } from '../propTypes';
import {
    getNovemberSurveys,
    getAprilSurveys,
    getMonthlySurveys,
    sortSurveysByMonthYearDescending,
} from '../utils';
import SurveyCard from './SurveyCard';

const SurveyView = ({ apiaries, isProUser }) => {
    const surveyedApiaries = [];
    const unsurveyedApiaries = [];

    apiaries.forEach((a) => {
        if (a.surveyed) {
            surveyedApiaries.push(a);
        } else {
            unsurveyedApiaries.push(a);
        }
    });

    const unsurveyedCards = unsurveyedApiaries.map(a => (
        <SurveyCard apiary={a} key={a.marker} surveys={[]} />
    ));

    const completedSurveyCards = [];
    const incompleteSurveyCards = [];

    surveyedApiaries.forEach((apiary) => {
        const monthlySurveys = isProUser
            ? getMonthlySurveys(apiary)
            : [];
        const surveys = monthlySurveys.concat(
            getNovemberSurveys(apiary),
            getAprilSurveys(apiary),
        ).sort(sortSurveysByMonthYearDescending);

        const surveyCard = (
            <SurveyCard
                apiary={apiary}
                key={apiary.marker}
                surveys={surveys}
            />
        );

        if (surveys.every(s => s.completed)) {
            completedSurveyCards.push(surveyCard);
        } else {
            incompleteSurveyCards.push(surveyCard);
        }
    });

    return (
        <div className="survey">
            <div className="survey__header">
                Survey
            </div>
            <div className="survey__body">
                <div>
                    Here, you will find links to the available surveys for your selected apiaries.
                    If the link is in red, it is a reminder to add information. If the link is in
                    green, it means the information has already been added. You can add more
                    apiaries at any time. Please note that you need to complete the survey after
                    you initiate it - it is not possible to partially save your work.
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Response needed</h2>
                    {incompleteSurveyCards}
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Up to date</h2>
                    {completedSurveyCards}
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">This is not in the study</h2>
                    {unsurveyedCards}
                </div>
            </div>
        </div>
    );
};

SurveyView.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
    isProUser: bool.isRequired,
};

export default SurveyView;
