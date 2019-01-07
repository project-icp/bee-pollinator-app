import React, { Component } from 'react';
import { number } from 'prop-types';

import { arrayToSemicolonDelimitedString, getOrCreateSurveyRequest } from '../utils';

/* eslint-disable camelcase */
class AprilSurveyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // each form input corresponds to a state var
            num_colonies: '',
            colony_loss_reason_OTHER: '',
            colony_loss_reason_VARROA_MITES: false,
            colony_loss_reason_INADEQUETE_FOOD_STORES: false,
            colony_loss_reason_POOR_QUEENS: false,
            colony_loss_reason_POOR_WEATHER_CONDITIONS: false,
            colony_loss_reason_COLONY_TOO_SMALL: false,
            colony_loss_reason_PESTICIDE_EXPOSURE: false,
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
            }).then(({ data }) => {
                const keys = data.colony_loss_reason.split(';')
                    .map(s => `colony_loss_reason_${s}`);
                const newState = keys.reduce((acc, key) => {
                    acc[key] = true;

                    return acc;
                }, {
                    completedSurvey: data,
                    num_colonies: data.survey.num_colonies,
                });
                this.setState(newState);
            }).catch(error => this.setState({ error }));
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
        /* eslint-disable react/destructuring-assignment */
        // Send form data to backend for validation/save and prevent form from closing modal
        event.preventDefault();
        const {
            apiaryId,
        } = this.props;

        const {
            num_colonies,
        } = this.state;

        const multipleChoiceKeys = ['colony_loss_reason'];
        const multipleChoiceState = {};
        multipleChoiceKeys.forEach((key) => {
            const keys = Object
                .entries(this.state)
                .filter(option => option[1] && option[0].startsWith(key))
                .map(o => o[0].split(`${key}_`)[1])
                .filter(k => k !== 'OTHER');

            if (`${key}_OTHER`.length) {
                const otherKey = `${key}_OTHER`;
                keys.push(`OTHER-${this.state[otherKey]}`);
            }
            multipleChoiceState[key] = arrayToSemicolonDelimitedString(keys);
        });
        /* eslint-enable react/destructuring-assignment */

        const survey = {
            num_colonies,
            apiary: apiaryId,
            month_year: '042019',
            survey_type: 'APRIL',
        };

        const form = Object.assign({}, this.state, multipleChoiceState, { survey });

        getOrCreateSurveyRequest({ apiaryId, form })
            .then(({ data }) => {
                this.setState({
                    completedSurvey: data,
                    error: 'Success!',
                });
            })
            .catch(error => this.setState({ error: error.response.statusText }));
    }

    render() {
        const {
            num_colonies,
            colony_loss_reason_OTHER,
            colony_loss_reason_VARROA_MITES,
            colony_loss_reason_INADEQUETE_FOOD_STORES,
            colony_loss_reason_POOR_QUEENS,
            colony_loss_reason_POOR_WEATHER_CONDITIONS,
            colony_loss_reason_COLONY_TOO_SMALL,
            colony_loss_reason_PESTICIDE_EXPOSURE,
            completedSurvey,
            error,
        } = this.state;

        const userMessage = error.length ? (
            <div className="form__group--error">
                {error}
            </div>
        ) : null;

        const submitButton = completedSurvey ? null
            : (
                <button
                    type="submit"
                    value="Submit"
                    className="button--long"
                >
                    Submit
                </button>
            );

        const title = completedSurvey
            ? 'Survey results'
            : 'Fill out this survey about your apiary';

        const surveyForm = (
            <>
                <div className="title">{title}</div>
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
                            disabled={!!completedSurvey}
                            required
                        />
                        <label htmlFor="colony_loss_reason">
                            What do you think the most likely cause of colony loss was?
                            Check all that apply.
                        </label>
                        <label htmlFor="colony_loss_reason_VARROA_MITES">Varroa mites</label>
                        <input
                            type="checkbox"
                            className="form__control"
                            id="colony_loss_reason_VARROA_MITES"
                            name="colony_loss_reason_VARROA_MITES"
                            checked={colony_loss_reason_VARROA_MITES}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="colony_loss_reason_INADEQUETE_FOOD_STORES">Inadequate food stores</label>
                        <input
                            type="checkbox"
                            className="form__control"
                            id="colony_loss_reason_INADEQUETE_FOOD_STORES"
                            name="colony_loss_reason_INADEQUETE_FOOD_STORES"
                            checked={colony_loss_reason_INADEQUETE_FOOD_STORES}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="colony_loss_reason_POOR_QUEENS">Poor queens</label>
                        <input
                            type="checkbox"
                            className="form__control"
                            id="colony_loss_reason_POOR_QUEENS"
                            name="colony_loss_reason_POOR_QUEENS"
                            checked={colony_loss_reason_POOR_QUEENS}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="colony_loss_reason_POOR_WEATHER_CONDITIONS">Poor weather conditions</label>
                        <input
                            type="checkbox"
                            className="form__control"
                            id="colony_loss_reason_POOR_WEATHER_CONDITIONS"
                            name="colony_loss_reason_POOR_WEATHER_CONDITIONS"
                            checked={colony_loss_reason_POOR_WEATHER_CONDITIONS}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="colony_loss_reason_COLONY_TOO_SMALL">Colony too small in November</label>
                        <input
                            type="checkbox"
                            className="form__control"
                            id="colony_loss_reason_COLONY_TOO_SMALL"
                            name="colony_loss_reason_COLONY_TOO_SMALL"
                            checked={colony_loss_reason_COLONY_TOO_SMALL}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="colony_loss_reason_PESTICIDE_EXPOSURE">Pesticide exposure</label>
                        <input
                            type="checkbox"
                            className="form__control"
                            id="colony_loss_reason_PESTICIDE_EXPOSURE"
                            name="colony_loss_reason_PESTICIDE_EXPOSURE"
                            checked={colony_loss_reason_PESTICIDE_EXPOSURE}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="colony_loss_reason_OTHER">OTHER</label>
                        <input
                            type="text"
                            className="form__control"
                            id="colony_loss_reason_OTHER"
                            name="colony_loss_reason_OTHER"
                            value={colony_loss_reason_OTHER}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                    </div>
                    {submitButton}
                </form>
            </>
        );

        // request to survey endpoint should happen when the popup opens (not before, as is now)
        // potential solution? move popup to parent, close handling to parent too
        return (
            <div className="authModal">
                <div className="authModal__header">
                    <div>April survey</div>
                </div>
                <div className="authModal__content">
                    {userMessage}
                    {surveyForm}
                </div>
                <div className="authModal__footer" />
            </div>
        );
    }
}

/* eslint-enable camelcase */

AprilSurveyForm.propTypes = {
    apiaryId: number.isRequired,
    surveyId: number,
};

AprilSurveyForm.defaultProps = {
    surveyId: null,
};

export default AprilSurveyForm;
