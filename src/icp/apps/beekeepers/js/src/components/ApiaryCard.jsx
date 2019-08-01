import React, { Component } from 'react';
import { func, string } from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';

import { Apiary } from '../propTypes';
import { INDICATORS } from '../constants';
import {
    setApiaryStar,
    setApiarySurvey,
    deleteApiary,
    updateApiary,
    fetchApiaryScores,
} from '../actions';
import { getMarkerClass } from '../utils';

import CardButton from './CardButton';
import ScoresLabel from './ScoresLabel';

class ApiaryCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isEditing: false,
            apiaryName: props.apiary.name,
        };

        this.onStar = this.dispatchAction(setApiaryStar).bind(this);
        this.onSurvey = this.dispatchAction(setApiarySurvey).bind(this);
        this.onDelete = this.dispatchAction(deleteApiary).bind(this);
        this.onApiaryNameChange = this.onApiaryNameChange.bind(this);
        this.onApiaryNameSave = this.onApiaryNameSave.bind(this);
        this.getCardNameBlock = this.getCardNameBlock.bind(this);
        this.enableHovering = this.enableHovering.bind(this);
        this.disableHovering = this.disableHovering.bind(this);
        this.enableEditing = this.enableEditing.bind(this);
        this.enableEditingOnEnter = this.enableEditingOnEnter.bind(this);
        this.saveApiaryNameOnEnter = this.saveApiaryNameOnEnter.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { apiary: { name } } = this.props;
        const { apiary: { name: prevName } } = prevProps;

        if (prevName !== name) {
            // Update internal state if the prop has changed.
            // This is generally discouraged, see https://github.com/yannickcr/eslint-plugin-react/blob/7dce90a4f570847b33eaefddb8d9bb7d6eca9dc5/docs/rules/no-did-update-set-state.md
            // but without this the default name isn't updated with the
            // reverse geocoded address which kicks in a little later.

            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ apiaryName: name });
        }
    }

    onApiaryNameChange(e) {
        this.setState({ apiaryName: e.target.value });
    }

    onApiaryNameSave() {
        const { apiary, dispatch } = this.props;
        const { apiaryName } = this.state;

        if (apiary.name !== apiaryName) {
            const apiaryWithNewName = update(apiary, {
                name: { $set: apiaryName },
            });

            dispatch(updateApiary(apiaryWithNewName));
        }

        this.setState({ isEditing: false });
    }

    getCardNameBlock() {
        const { isEditing, isHovering } = this.state;

        let className = 'card__name';
        let onKeyPress = () => {};
        let onChange = () => {};
        let onClick = () => {};
        let onFocus = () => {};
        let cardButton = null;
        let readOnly = true;

        if (isEditing) {
            className = 'card__name card__name-editing';
            onChange = this.onApiaryNameChange;
            onKeyPress = this.saveApiaryNameOnEnter;
            onFocus = () => {};
            readOnly = false;
            cardButton = (
                <CardButton
                    icon="check"
                    tooltip="Save apiary name"
                    onClick={this.onApiaryNameSave}
                />
            );
        } else if (isHovering) {
            className = 'card__name card__name-hovering';
            onClick = this.enableEditing;
            onKeyPress = this.enableEditingOnEnter;
            cardButton = (
                <CardButton
                    icon="pencil"
                    tooltip="Edit apiary name"
                    onClick={this.enableEditing}
                />
            );
        } else {
            onKeyPress = this.enableEditingOnEnter;
            onFocus = this.enableHovering;
        }

        return {
            className,
            onKeyPress,
            onChange,
            onClick,
            onFocus,
            cardButton,
            readOnly,
        };
    }

    dispatchAction(action) {
        return () => {
            const { apiary, dispatch } = this.props;

            dispatch(action(apiary));
        };
    }

    enableHovering() {
        this.setState({ isHovering: true });
    }

    disableHovering() {
        this.setState({ isHovering: false });
    }

    enableEditing() {
        this.setState({ isEditing: true });
    }

    enableEditingOnEnter(e) {
        const { isEditing } = this.state;

        if (!isEditing && e.key === 'Enter') {
            this.setState({ isEditing: true });
        }
    }

    saveApiaryNameOnEnter(e) {
        const { isEditing } = this.state;

        if (isEditing && e.key === 'Enter') {
            this.onApiaryNameSave();
        }
    }

    render() {
        const { apiary, forageRange, dispatch } = this.props;
        const { apiaryName } = this.state;

        const {
            marker,
            starred,
            surveyed,
            scores,
            fetching,
        } = apiary;

        const values = scores && scores[forageRange];

        const markerClass = getMarkerClass(apiary);

        if ((!values || !Object.keys(values).length) && !fetching) {
            // Fetch is complete and no scores retrieved
            // Report error

            return (
                <li className="card">
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
                </li>
            );
        }

        if (fetching) {
            return (
                <li className="card">
                    <div className="spinner" />
                </li>
            );
        }

        const scoreLabels = Object.values(INDICATORS).map(i => (
            <ScoresLabel key={i} indicator={i} scores={[values[i]]} />
        ));

        const cardName = this.getCardNameBlock();

        return (
            <li className="card">
                <div className="card__top">
                    <div
                        className="card__identification"
                        onMouseEnter={this.enableHovering}
                        onMouseLeave={this.disableHovering}
                    >
                        <div className={`marker ${markerClass}`}>{marker}</div>
                        <input
                            className={cardName.className}
                            onKeyPress={cardName.onKeyPress}
                            onChange={cardName.onChange}
                            onClick={cardName.onClick}
                            onFocus={cardName.onFocus}
                            readOnly={cardName.readOnly}
                            value={apiaryName}
                        />
                        {cardName.cardButton}
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
