import React from 'react';
import { func, string } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';
import { INDICATORS } from '../constants';
import {
    setApiaryStar,
    setApiarySurvey,
    deleteApiary,
    fetchApiaryScores,
} from '../actions';
import { getMarkerClass } from '../utils';

import CardButton from './CardButton';
import ScoresLabel from './ScoresLabel';

const ApiaryCard = ({ apiary, forageRange, dispatch }) => {
    const {
        marker,
        name,
        starred,
        surveyed,
        scores,
    } = apiary;

    const values = scores[forageRange];

    const markerClass = getMarkerClass(apiary);

    const onStar = () => dispatch(setApiaryStar(apiary));
    const onSurvey = () => dispatch(setApiarySurvey(apiary));
    const onDelete = () => dispatch(deleteApiary(apiary));

    let scoreCard;
    if (!Object.keys(apiary.scores[forageRange]).length && !apiary.fetching) {
        scoreCard = (
            <>
                Error fetching apiary data
                <button
                    type="button"
                    onClick={() => dispatch(fetchApiaryScores([apiary], forageRange))}
                >
                    Try again?
                </button>
            </>
        );
    } else if (!Object.keys(apiary.scores[forageRange]).length) {
        scoreCard = <div className="spinner" />;
    } else {
        const scoreLabels = Object.values(INDICATORS).map(i => (
            <ScoresLabel key={i} indicator={i} scores={[values[i]]} />
        ));
        scoreCard = (
            <>
                <div className="card__top">
                    <div className="card__identification">
                        <div className={`marker ${markerClass}`}>{marker}</div>
                        <div className="card__name">{name}</div>
                    </div>
                    <div className="card__buttons">
                        <CardButton
                            icon="star"
                            filled={starred}
                            tooltip="Mark apiary as important"
                            onClick={onStar}
                        />
                        <CardButton
                            icon="clipboard"
                            filled={surveyed}
                            tooltip="Include apiary in surveys"
                            onClick={onSurvey}
                        />
                        <CardButton
                            icon="trash"
                            filled
                            tooltip="Delete apiary"
                            onClick={onDelete}
                        />
                    </div>
                </div>
                <div className="card__bottom">
                    <div className="indicator-container">
                        {scoreLabels}
                    </div>
                </div>
            </>
        );
    }

    return (
        <li className="card">
            {scoreCard}
        </li>
    );
};

ApiaryCard.propTypes = {
    apiary: Apiary.isRequired,
    forageRange: string.isRequired,
    dispatch: func.isRequired,
};

export default connect()(ApiaryCard);
