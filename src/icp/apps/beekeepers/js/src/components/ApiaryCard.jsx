import React, { Component } from 'react';
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

class ApiaryCard extends Component {
    constructor(props) {
        super(props);

        this.onStar = this.dispatchAction(setApiaryStar).bind(this);
        this.onSurvey = this.dispatchAction(setApiarySurvey).bind(this);
        this.onDelete = this.dispatchAction(deleteApiary).bind(this);
    }

    dispatchAction(action) {
        return () => {
            const { apiary, dispatch } = this.props;

            dispatch(action(apiary));
        };
    }

    render() {
        const { apiary, forageRange, dispatch } = this.props;

        const {
            marker,
            name,
            starred,
            surveyed,
            scores,
            fetching,
        } = apiary;

        const values = scores[forageRange];

        const markerClass = getMarkerClass(apiary);

        let scoreCard;
        if (!Object.keys(scores[forageRange]).length && !fetching) {
            scoreCard = (
                <>
                    <div className="card__top">
                        <div className="card__identification">
                            <div className={`marker ${markerClass}`}>{marker}</div>
                            <div className="card__name">Error fetching apiary data</div>
                        </div>
                        <div className="card__buttons">
                            <CardButton
                                icon="trash"
                                filled
                                tooltip="Delete apiary"
                                onClick={this.onDelete}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchApiaryScores([apiary], forageRange))}
                    >
                        Try again?
                    </button>
                </>
            );
        } else if (!Object.keys(scores[forageRange]).length) {
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
                                onClick={this.onStar}
                            />
                            <CardButton
                                icon="clipboard"
                                filled={surveyed}
                                tooltip="Include apiary in surveys"
                                onClick={this.onSurvey}
                            />
                            <CardButton
                                icon="trash"
                                filled
                                tooltip="Delete apiary"
                                onClick={this.onDelete}
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
    }
}

ApiaryCard.propTypes = {
    apiary: Apiary.isRequired,
    forageRange: string.isRequired,
    dispatch: func.isRequired,
};

export default connect()(ApiaryCard);
