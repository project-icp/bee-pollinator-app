import React from 'react';

import { Apiary } from '../propTypes';
import { INDICATORS } from '../constants';

import CardButton from './CardButton';
import ScoresLabel from './ScoresLabel';

const ApiaryCard = ({ apiary }) => {
    const {
        marker,
        name,
        selected,
        starred,
        surveyed,
        scores: { threeKm },
    } = apiary;

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
                        scores={[threeKm[INDICATORS.NESTING_QUALITY]]}
                    />
                    <ScoresLabel
                        raster={INDICATORS.PESTICIDE}
                        scores={[threeKm[INDICATORS.PESTICIDE]]}
                    />
                    <ScoresLabel
                        raster="forage"
                        scores={[
                            threeKm[INDICATORS.FORAGE_SPRING],
                            threeKm[INDICATORS.FORAGE_SUMMER],
                            threeKm[INDICATORS.FORAGE_FALL],
                        ]}
                    />
                </div>
            </div>
        </li>
    );
};

ApiaryCard.propTypes = {
    apiary: Apiary.isRequired,
};

export default ApiaryCard;
