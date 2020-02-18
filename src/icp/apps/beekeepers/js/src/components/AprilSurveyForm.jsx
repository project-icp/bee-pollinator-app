import React, { Component } from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import { fetchUserApiaries, flashSuccessModal } from '../actions';
import { SURVEY_TYPE_APRIL, SPRING_COLONY_LOSS_REASONS } from '../constants';
import {
    arrayToSemicolonDelimitedString,
    getOrCreateSurveyRequest,
    toMonthNameYear,
} from '../utils';
import { Apiary, Survey } from '../propTypes';

class AprilSurveyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // each form input corresponds to a state var
            num_colonies: '',
            num_new_colonies: '0',
            colony_loss_reason_OTHER: '',
            colony_loss_reason_VARROA_MITES: false,
            colony_loss_reason_INADEQUETE_FOOD_STORES: false,
            colony_loss_reason_POOR_QUEENS: false,
            colony_loss_reason_POOR_WEATHER_CONDITIONS: false,
            colony_loss_reason_COLONY_TOO_SMALL_IN_NOVEMBER: false,
            colony_loss_reason_PESTICIDE_EXPOSURE: false,
            colony_loss_reason_BEAR_OR_NATURAL_DISASTER: false,
            notes: '',
            completedSurvey: '',
            error: '',
            missingNovemberSurvey: false,
            novemberSurvey: {},
        };
        this.multipleChoiceKeys = ['colony_loss_reason'];
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.makeMultipleChoiceInputs = this.makeMultipleChoiceInputs.bind(this);
    }

    componentDidMount() {
        const {
            apiary: { surveys },
            survey: {
                apiary,
                id,
                completed,
                month_year,
            },
        } = this.props;
        const previous_year = parseInt(month_year.slice(-4), 10) - 1;
        const novemberSurvey = surveys.find(pastSurvey => pastSurvey.month_year === `11${previous_year}`);
        if (!novemberSurvey) {
            this.setState({
                error: `Please complete the November survey for ${previous_year} first.`,
                missingNovemberSurvey: true,
            });
        } else {
            this.setState({ novemberSurvey });
        }
        if (completed) {
            getOrCreateSurveyRequest({
                apiary,
                id,
            }).then(({ data }) => {
                let { num_new_colonies } = data.april;
                if (num_new_colonies === null) {
                    num_new_colonies = 0;
                }
                let newState = {
                    completedSurvey: data,
                    num_colonies: data.num_colonies - num_new_colonies,
                    notes: data.april.notes,
                    num_new_colonies,
                };
                this.multipleChoiceKeys.forEach((key) => {
                    if (data.april[key]) {
                        const keys = data.april[key].split(';')
                            .map(s => `${key}_${s}`);
                        newState = keys.reduce((acc, k) => {
                            acc[k] = true;
                            // Other text input requires special handling
                            // to parse key name and capture value
                            if (k.includes('_OTHER-')) {
                                const otherKey = k.split('-')[0];
                                const otherValue = k.split('_OTHER-')[1];
                                acc[otherKey] = otherValue;
                            }
                            return acc;
                        }, newState);
                    }
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
            survey: {
                apiary,
                month_year,
            },
            dispatch,
            close,
        } = this.props;

        const {
            num_colonies,
            num_new_colonies,
            notes,
        } = this.state;

        const multipleChoiceState = {};
        this.multipleChoiceKeys.forEach((mcKey) => {
            // Assemble semi-colon delimited mega-string for each multiple choice field
            const keyOptions = Object.entries(this.state)
                .filter(([k, v]) => v && k.startsWith(mcKey))
                // eslint-disable-next-line no-unused-vars
                .map(([k, _]) => k.split(`${mcKey}_`)[1]);

            if (keyOptions.length) {
                const values = keyOptions.filter(k => !k.includes('OTHER'));
                // text inputs require custom parsing to look like "OTHER-user input here"
                const textInputPrefixes = keyOptions.filter(k => k.includes('OTHER'));
                const textInputValues = textInputPrefixes.map(k => `${k}-${this.state[`${mcKey}_${k}`]}`);
                const allValues = values.concat(textInputValues);

                multipleChoiceState[mcKey] = arrayToSemicolonDelimitedString(allValues);
            }
        });
        /* eslint-enable react/destructuring-assignment */

        const form = {
            num_colonies: parseInt(num_colonies, 10) + parseInt(num_new_colonies, 10),
            apiary,
            month_year,
            survey_type: SURVEY_TYPE_APRIL,
            april: { ...multipleChoiceState, notes, num_new_colonies },
        };

        getOrCreateSurveyRequest({ apiary, form })
            .then(() => {
                dispatch(fetchUserApiaries());
                close();
                dispatch(flashSuccessModal());
            })
            .catch(error => this.setState({ error: error.response.statusText }));
    }

    /* eslint-disable react/destructuring-assignment */
    makeMultipleChoiceInputs(groupName, options) {
        const { completedSurvey } = this.state;

        return options.map((option) => {
            const key = `${groupName}_${option}`;
            const label = option.split('_').join(' ').toLowerCase();
            return (
                <div
                    key={key}
                    className="form__checkbox"
                >
                    <input
                        type="checkbox"
                        className="form__control"
                        id={key}
                        name={key}
                        checked={this.state[key]}
                        onChange={this.handleChange}
                        disabled={!!completedSurvey}
                    />
                    <label htmlFor={key}>{label}</label>
                </div>
            );
        });
    }
    /* eslint-enable react/destructuring-assignment */

    render() {
        const {
            num_colonies,
            num_new_colonies,
            colony_loss_reason_OTHER,
            notes,
            completedSurvey,
            error,
            missingNovemberSurvey,
            novemberSurvey,
        } = this.state;

        const {
            apiary: { name },
            survey: { month_year },
        } = this.props;

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
            ? `Survey results for ${toMonthNameYear(month_year)}`
            : `Survey for ${toMonthNameYear(month_year)}`;

        const confirmationButton = completedSurvey
            ? null
            : (
                <div className="form__group">
                    <label htmlFor="confirmation">
                        Have you provided all the information available for these
                        colonies and are ready to submit the survey? Surveys cannot
                        be edited after submission.
                    </label>
                    <input
                        type="checkbox"
                        className="form__control"
                        id="confirmed"
                        name="confirmed"
                        required
                    />
                    <label htmlFor="confirmation">
                        Yes
                    </label>
                </div>
            );

        const colonyLossReasonCheckboxInputs = this.makeMultipleChoiceInputs('colony_loss_reason', SPRING_COLONY_LOSS_REASONS);

        const surveyForm = missingNovemberSurvey ? null : (
            <>
                <div className="title">{title}</div>
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className="form__group">
                        <label htmlFor="num_colonies">
                            {`You had ${novemberSurvey.num_colonies} colonies in November. How many of those currently remain? Required.`}
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
                            min={0}
                            max={novemberSurvey.num_colonies}
                        />
                        <label htmlFor="num_new_colonies">
                            How many
                            <strong> new </strong>
                            colonies did you add to this apiary over the winter? Required.
                        </label>
                        <input
                            type="number"
                            className="form__control"
                            id="num_new_colonies"
                            name="num_new_colonies"
                            onChange={this.handleChange}
                            value={num_new_colonies}
                            disabled={!!completedSurvey}
                            required
                            min={0}
                        />
                        <label htmlFor="colony_loss_reason">
                            What do you think was the most likely cause of colony loss?
                            Check all that apply. Required.
                        </label>
                        {colonyLossReasonCheckboxInputs}
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
                        <div className="form__group">
                            <label htmlFor="notes">
                                Notes
                            </label>
                            <textarea
                                className="form__control textarea"
                                name="notes"
                                rows={2}
                                value={notes || ''}
                                onChange={this.handleChange}
                                disabled={!!completedSurvey}
                            />
                        </div>
                        {confirmationButton}
                    </div>
                    {submitButton}
                </form>
            </>
        );

        return (
            <div className="authModal">
                <div className="authModal__header">
                    <div>{name}</div>
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

function mapStateToProps(state) {
    return state.main;
}

AprilSurveyForm.propTypes = {
    apiary: Apiary.isRequired,
    survey: Survey.isRequired,
    dispatch: func.isRequired,
    close: func.isRequired,
};

export default connect(mapStateToProps)(AprilSurveyForm);
