import React from 'react';
import { connect } from 'react-redux';
import { arrayOf, func } from 'prop-types';
import Popup from 'reactjs-popup';

import { Apiary, Survey } from '../propTypes';
import { setApiarySurvey } from '../actions';

import ApiarySurveyListing from './ApiarySurveyListing';
import SurveyCardListing from './SurveyCardListing';

const SurveyCard = ({ apiary, dispatch, surveys }) => {
    const {
        name,
        surveyed,
    } = apiary;

    let cardBody;
    let cardFooter = null;
    const onSurvey = () => dispatch(setApiarySurvey(apiary));

    if (!surveyed) {
        cardBody = (
            <>
                <div className="listing" key={name}>
                    This apiary is not in the study.
                </div>
                <button
                    type="button"
                    onClick={onSurvey}
                    className="surveyCard__add-button"
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
                apiary={apiary}
                survey={survey}
            />
        ));

        const cardDetailTrigger = (
            <button
                type="button"
                className="button"
            >
                View full history
            </button>
        );
        const cardDetails = surveys.length <= 4 ? null : (
            <Popup
                modal
                className="modal nice"
                trigger={cardDetailTrigger}
            >
                <ApiarySurveyListing apiary={apiary} surveys={surveys} />
            </Popup>
        );

        cardFooter = (
            <div className="surveyCard__footer">
                {cardDetails}
                <Popup
                    trigger={(<button type="button" className="dropdown__button">...</button>)}
                    position="right top"
                    closeOnDocumentClick={false}
                    on="hover"
                    arrow={false}
                >
                    <div className="menu">
                        <div className="menu-item">
                            <button
                                type="button"
                                className="dropdown__button"
                                onClick={onSurvey}
                            >
                                Remove from study
                            </button>
                        </div>
                    </div>
                </Popup>
            </div>
        );
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
