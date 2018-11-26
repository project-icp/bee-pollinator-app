import React from 'react';
import { string } from 'prop-types';

import { Apiary } from '../propTypes';
import { INDICATORS } from '../constants';

import CardButton from './CardButton';
import ScoresLabel from './ScoresLabel';

const ApiaryCard = ({ apiary, forageRange }) => {
    const {
        marker,
        name,
        selected,
        starred,
        surveyed,
        scores,
    } = apiary;

    const values = scores[forageRange];

    const markerMod = (() => {
        if (surveyed) {
            return 'marker--starred-survey';
        }

        if (starred) {
            return 'marker--starred';
        }

        if (selected) {
            return 'marker--selected';
        }

        return '';
    })();

    const scoresBody = !Object.keys(apiary.scores[forageRange]).length
        ? 'TODO: Insert spinner'
        : (
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
                        values[INDICATORS.FORAGE_SPRING],
                        values[INDICATORS.FORAGE_SUMMER],
                        values[INDICATORS.FORAGE_FALL],
                    ]}
                />
            </div>
        );

    return (
        <li className="card">
            <div className="card__top">
                <div className="card__identification">
                    <div className={`marker ${markerMod}`}>{marker}</div>
                    <div className="card__name">{name}</div>
                </div>
                <div className="card__buttons">
                    <CardButton icon="star" filled={starred} />
                    <CardButton icon="clipboard" filled={surveyed} />
                    <CardButton icon="trash" filled />
                </div>
            </div>
            <div className="card__bottom">
                {scoresBody}
            </div>
        </li>
    );
};

ApiaryCard.propTypes = {
    apiary: Apiary.isRequired,
    forageRange: string.isRequired,
};

export default ApiaryCard;
