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
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Response needed</h2>
                    {incompleteSurveyCards.length
                        ? incompleteSurveyCards
                        : <div className="empty-message">None. Nothing to tend to at the moment.</div>
                    }
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Up to date</h2>
                    {completedSurveyCards.length
                        ? completedSurveyCards
                        : <div className="empty-message">None. Help the bees and fill out some surveys!</div>
                    }
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Not in the study</h2>
                    {unsurveyedCards.length
                        ? unsurveyedCards
                        : <div className="empty-message">None. Nice work!</div>
                    }
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
