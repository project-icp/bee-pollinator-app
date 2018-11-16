import React from 'react';
import { string, func } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';
import { INDICATORS } from '../constants';
import { fetchApiaryScores } from '../actions';

import CardButton from './CardButton';
import ScoresLabel from './ScoresLabel';

const ApiaryCard = ({ apiary, forageRange, dispatch }) => {
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

    if (!Object.keys(apiary.scores[forageRange]).length) {
        dispatch(fetchApiaryScores(apiary, forageRange));
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
                    TODO: Insert spinner
                </div>
            </li>
        );
    }
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
            </div>
        </li>
    );
};

ApiaryCard.propTypes = {
    apiary: Apiary.isRequired,
    forageRange: string.isRequired,
    dispatch: func.isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(ApiaryCard);
