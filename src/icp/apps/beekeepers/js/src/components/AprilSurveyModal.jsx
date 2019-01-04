import React, { Component } from 'react';
import { number } from 'prop-types';
import Popup from 'reactjs-popup';

import { getOrCreateSurveyRequest } from '../actions';
import { arrayToSemicolonDelimitedString } from '../utils';

/* eslint-disable camelcase */
class AprilSurveyModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // each form input corresponds to a state var
            num_colonies: '',
            colony_loss_reason_other: '',
            colony_loss_reason_varroa: '',
            colony_loss_reason_starvation: '',
            colony_loss_reason_queens: '',
            colony_loss_reason_weather: '',
            colony_loss_reason_population: '',
            colony_loss_reason_pesticide: '',
            completedSurvey: '',
            error: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const {
            apiaryId,
            surveyId,
        } = this.props;
        if (surveyId) {
            getOrCreateSurveyRequest({
                apiaryId,
                surveyId,
            }).then(({ data }) => this.setState({ completedSurvey: data }))
                .catch(error => this.setState({ error }));
        }
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
            apiaryId,
        } = this.props;

        const {
            num_colonies,
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
        const survey = {
            num_colonies,
            apiary: apiaryId,
            month_year: '042019',
            survey_type: 'APRIL',
        };

        const form = Object.assign({}, this.state, {
            colony_loss_reason,
            survey,
        });

        // TODO close modal on complete else show error on
        getOrCreateSurveyRequest({ apiaryId, form })
            .then(({ data }) => window.console.log(data))
            .catch(error => window.console.log(error));
    }

    render() {
        const {
            num_colonies,
            colony_loss_reason_other,
            colony_loss_reason_varroa,
            colony_loss_reason_starvation,
            colony_loss_reason_queens,
            colony_loss_reason_weather,
            colony_loss_reason_population,
            colony_loss_reason_pesticide,
            completedSurvey,
            error,
        } = this.state;

        const errorWarning = error.length ? (
            <div className="form__group--error">
                {error}
            </div>
        ) : null;

        const submitButton = completedSurvey
            ? (
                <button
                    type="submit"
                    value="Submit"
                    className="button--long"
                    disabled
                >
                    Submit
                </button>
            )
            : (
                <button
                    type="submit"
                    value="Submit"
                    className="button--long"
                >
                    Submit
                </button>
            );

        const surveyForm = (
            <>
                <div className="title">Fill out this survey about your apiary</div>
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className="form__group">
                        <label htmlFor="num_colonies">
                            How many colonies are in this apiary?
                        </label>
                        <input
                            type="number"
                            className="form__control"
                            id="num_colonies"
                            name="num_colonies"
                            onChange={this.handleChange}
                            value={num_colonies}
                            required
                        />
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
                    {submitButton}
                </form>
            </>
        );

        return (
            <Popup
                trigger={<button type="button" className="button"> Open Modal </button>}
                modal
            >
                {close => (
                    <div className="authModal">
                        {errorWarning}
                        <div className="authModal__header">
                            <div>April survey</div>
                            <button type="button" className="button" onClick={close}>
                                &times;
                            </button>
                        </div>
                        <div className="authModal__content">
                            {surveyForm}
                        </div>
                        <div className="authModal__footer" />
                    </div>
                )}
            </Popup>
        );
    }
}

/* eslint-enable camelcase */

AprilSurveyModal.propTypes = {
    apiaryId: number.isRequired,
    surveyId: number,
};

AprilSurveyModal.defaultProps = {
    surveyId: null,
};

export default AprilSurveyModal;
