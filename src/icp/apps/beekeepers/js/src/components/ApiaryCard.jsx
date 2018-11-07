import React from 'react';

import { Apiary } from '../propTypes';
import { RASTERS } from '../constants';

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
                        raster={RASTERS.NESTING_QUALITY}
                        scores={[threeKm[RASTERS.NESTING_QUALITY]]}
                    />
                    <ScoresLabel
                        raster={RASTERS.PESTICIDE}
                        scores={[threeKm[RASTERS.PESTICIDE]]}
                    />
                    <ScoresLabel
                        raster="forage"
                        scores={[
                            threeKm[RASTERS.FORAGE_SPRING],
                            threeKm[RASTERS.FORAGE_SUMMER],
                            threeKm[RASTERS.FORAGE_FALL],
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
