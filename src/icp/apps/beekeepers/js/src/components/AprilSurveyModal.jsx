import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { createSurvey } from '../actions';
import { arrayToSemicolonDelimitedString } from '../utils';

/* eslint-disable camelcase */
class AprilSurveyModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // each form input corresponds to a state var
            colony_loss_reason_other: '',
            colony_loss_reason_varroa: '',
            colony_loss_reason_starvation: '',
            colony_loss_reason_queens: '',
            colony_loss_reason_weather: '',
            colony_loss_reason_population: '',
            colony_loss_reason_pesticide: '',

        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange({
        currentTarget: {
            value, type, checked, name,
        },
    }) {
        let finalValue = value;
        if (type === 'checkbox') {
            if (value === 'on') {
                finalValue = checked;
            } else {
                finalValue = checked ? value : '';
            }
        }
        this.setState({ [name]: finalValue });
    }

    handleSubmit(event) {
        // Send form data to backend for validation and prevent modal from closing
        event.preventDefault();
        const {
            dispatch,
        } = this.props;

        const {
            colony_loss_reason_other,
            colony_loss_reason_varroa,
            colony_loss_reason_starvation,
            colony_loss_reason_queens,
            colony_loss_reason_weather,
            colony_loss_reason_population,
            colony_loss_reason_pesticide,
        } = this.state;

        const prepended_colony_loss_reason_other = colony_loss_reason_other.length
            ? `OTHER-${colony_loss_reason_other}`
            : '';
        const colony_loss_reason = arrayToSemicolonDelimitedString(
            [
                colony_loss_reason_varroa,
                colony_loss_reason_starvation,
                colony_loss_reason_queens,
                colony_loss_reason_weather,
                colony_loss_reason_population,
                colony_loss_reason_pesticide,
                prepended_colony_loss_reason_other,
            ],
        );
        const form = Object.assign({}, this.state, {
            colony_loss_reason,
        });
        dispatch(createSurvey(form));
    }

    render() {
        const {
            authError,
            isAprilSurveyModalOpen,
        } = this.props;

        const {
            colony_loss_reason_other,
            colony_loss_reason_varroa,
            colony_loss_reason_starvation,
            colony_loss_reason_queens,
            colony_loss_reason_weather,
            colony_loss_reason_population,
            colony_loss_reason_pesticide,
        } = this.state;

        const errorWarning = authError ? (
            <div className="form__group--error">
                {authError}
            </div>
        ) : null;

        return (
            <Popup
                open={isAprilSurveyModalOpen}
                closeOnEscape={false}
                closeOnDocumentClick={false}
                modal
            >
                <div className="authModal">
                    <div className="authModal__header">
                        <div>User survey</div>
                    </div>
                    <div className="authModal__content">
                        <div className="title">Fill out your user survey</div>
                        <form className="form" onSubmit={this.handleSubmit}>
                            {errorWarning}
                            <div className="form__group">
                                <label htmlFor="colony_loss_reason">
                                    What do you think the most likely cause of colony loss was?
                                    Check all that apply.
                                </label>
                                <label htmlFor="colony_loss_reason_varroa">Varroa mites</label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    id="colony_loss_reason_varroa"
                                    name="colony_loss_reason_varroa"
                                    checked={colony_loss_reason_varroa}
                                    onChange={this.handleChange}
                                    value="VARROA_MITES"
                                />
                                <label htmlFor="colony_loss_reason_starvation">Inadequate food stores</label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    id="colony_loss_reason_starvation"
                                    name="colony_loss_reason_starvation"
                                    checked={colony_loss_reason_starvation}
                                    onChange={this.handleChange}
                                    value="INADEQUATE_FOOD_STORES"
                                />
                                <label htmlFor="colony_loss_reason_queens">Poor queens</label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    id="colony_loss_reason_queens"
                                    name="colony_loss_reason_queens"
                                    checked={colony_loss_reason_queens}
                                    onChange={this.handleChange}
                                    value="POOR_QUEENS"
                                />
                                <label htmlFor="colony_loss_reason_weather">Poor weather conditions</label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    id="colony_loss_reason_weather"
                                    name="colony_loss_reason_weather"
                                    checked={colony_loss_reason_weather}
                                    onChange={this.handleChange}
                                    value="POOR_WEATHER_CONDITIONS"
                                />
                                <label htmlFor="colony_loss_reason_population">Colony too small in November</label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    id="colony_loss_reason_population"
                                    name="colony_loss_reason_population"
                                    checked={colony_loss_reason_population}
                                    onChange={this.handleChange}
                                    value="COLONY_TOO_SMALL"
                                />
                                <label htmlFor="colony_loss_reason_pesticide">Pesticide exposure</label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    id="colony_loss_reason_pesticide"
                                    name="colony_loss_reason_pesticide"
                                    checked={colony_loss_reason_pesticide}
                                    onChange={this.handleChange}
                                    value="PESTICIDE_EXPOSURE"
                                />
                                <label htmlFor="colony_loss_reason_other">Other</label>
                                <input
                                    type="text"
                                    className="form__control"
                                    id="colony_loss_reason_other"
                                    name="colony_loss_reason_other"
                                    value={colony_loss_reason_other}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <button
                                type="submit"
                                value="Submit"
                                className="button--long"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                    <div className="authModal__footer" />
                </div>
            </Popup>
        );
    }
}

/* eslint-enable camelcase */

function mapStateToProps(state) {
    return {
        isAprilSurveyModalOpen: state.main.isAprilSurveyModalOpen,
        dispatch: state.main.dispatch,
        authError: state.auth.authError,
    };
}

AprilSurveyModal.propTypes = {
    isAprilSurveyModalOpen: bool.isRequired,
    dispatch: func.isRequired,
    authError: string.isRequired,
};

export default connect(mapStateToProps)(AprilSurveyModal);
