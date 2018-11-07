import React from 'react';
import { connect } from 'react-redux';
import { string } from 'prop-types';

import { Apiary } from '../propTypes';
import { INDICATORS, FORAGE_RANGES } from '../constants';

import CardButton from './CardButton';
import ScoresLabel from './ScoresLabel';

const ApiaryCard = ({ apiary, forageRange }) => {
    const range = FORAGE_RANGES[forageRange];

    const {
        marker,
        name,
        selected,
        starred,
        surveyed,
        scores,
    } = apiary;

    const values = scores[range];

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
                        raster={INDICATORS.NESTING_QUALITY}
                        scores={[values[INDICATORS.NESTING_QUALITY]]}
                    />
                    <ScoresLabel
                        raster={INDICATORS.PESTICIDE}
                        scores={[values[INDICATORS.PESTICIDE]]}
                    />
                    <ScoresLabel
                        raster="forage"
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
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(ApiaryCard);
