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
        scoreCard = (
            <>
                <div className="card__top">
                    <div className="card__identification">
                        <div className={`marker ${markerClass}`}>{marker}</div>
                        <div className="card__name">{name}</div>
                    </div>
                    <div className="card__buttons">
                        <CardButton icon="star" filled={starred} onClick={onStar} />
                        <CardButton icon="clipboard" filled={surveyed} onClick={onSurvey} />
                        <CardButton icon="trash" filled onClick={onDelete} />
                    </div>
                </div>
                <div className="card__bottom">
                    <div className="indicator-container">
                        <ScoresLabel
                            indicator={INDICATORS.NESTING_QUALITY}
                            scores={[values[INDICATORS.NESTING_QUALITY]]}
                        />
                        <ScoresLabel
                            indicator={INDICATORS.PESTICIDE}
                            scores={[values[INDICATORS.PESTICIDE]]}
                        />
                        <ScoresLabel
                            indicator="forage"
                            scores={[
                                values[INDICATORS.FLORAL_SPRING],
                                values[INDICATORS.FLORAL_SUMMER],
                                values[INDICATORS.FLORAL_FALL],
                            ]}
                        />
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
