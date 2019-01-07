import React from 'react';

import { arrayOf, bool } from 'prop-types';
import { Apiary } from '../propTypes';

import Popup from 'reactjs-popup';

import { Apiary } from '../propTypes';
import SurveyCard from './SurveyCard';
import {
    getNovemberSurveys,
    getAprilSurveys,
    getMonthlySurveys,
    sortSurveysByMonthYearDescending,
} from '../utils';
import AprilSurveyForm from './AprilSurveyForm';

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
            <Popup
                trigger={<button type="button" className="button"> Open Modal </button>}
                modal
            >
                <AprilSurveyForm apiaryId={1} />
            </Popup>
            <div className="survey__body">
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
                <div className="survey__body--section">
                    Response needed
                    {incompleteSurveyCards}
                </div>
                <div className="survey__body--section">
                    Up to date
                    {completedSurveyCards}
                </div>
                <div className="survey__body--section">
                    This is not in the study
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
