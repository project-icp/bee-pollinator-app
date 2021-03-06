import React from 'react';
import { arrayOf } from 'prop-types';

import { Apiary } from '../propTypes';
import {
    getNovemberSurveys,
    getAprilSurveys,
    sortSurveysByMonthYearDescending,
} from '../utils';
import SurveyCard from './SurveyCard';

const SurveyView = ({ apiaries }) => {
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
        const surveys = [...getNovemberSurveys(apiary), ...getAprilSurveys(apiary)]
            .sort(sortSurveysByMonthYearDescending);
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
                    <h2 className="survey__title">Apiaries with surveys that need to be completed:</h2>
                    {incompleteSurveyCards.length
                        ? incompleteSurveyCards
                        : <div className="empty-message">None. There are no remaining surveys to complete.</div>
                    }
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Apiaries with all surveys completed:</h2>
                    {completedSurveyCards.length
                        ? completedSurveyCards
                        : <div className="empty-message">None of your apiaries are up-to-date on their surveys. Please help the bees and complete any outstanding surveys.</div>
                    }
                </div>
                <div className="survey__body--section">
                    <h2 className="survey__title">Apiaries not in the study:</h2>
                    {unsurveyedCards.length
                        ? unsurveyedCards
                        : <div className="empty-message">None. All of your apiares are in the study!</div>
                    }
                </div>
            </div>
        </div>
    );
};

SurveyView.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
};

export default SurveyView;
