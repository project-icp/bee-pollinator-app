import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import { fetchUserApiaries } from '../actions';
import { SURVEY_TYPE_APRIL, COLONY_LOSS_REASONS } from '../constants';
import { arrayToSemicolonDelimitedString, getOrCreateSurveyRequest } from '../utils';
import { Survey } from '../propTypes';

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
            colony_loss_reason_COLONY_TOO_SMALL_IN_NOVEMBER: false,
            colony_loss_reason_PESTICIDE_EXPOSURE: false,
            completedSurvey: '',
            error: '',
        };
        this.multipleChoiceKeys = ['colony_loss_reason'];
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.makeMultipleChoiceInputs = this.makeMultipleChoiceInputs.bind(this);
    }

    componentDidMount() {
        const {
            survey: {
                apiary,
                id,
                completed,
            },
        } = this.props;
        if (completed) {
            getOrCreateSurveyRequest({
                apiary,
                id,
            }).then(({ data }) => {
                let newState = {
                    completedSurvey: data,
                    num_colonies: data.survey.num_colonies,
                };
                this.multipleChoiceKeys.forEach((key) => {
                    if (data[key]) {
                        const keys = data[key].split(';')
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
        } = this.state;

        const multipleChoiceState = {};
        this.multipleChoiceKeys.forEach((key) => {
            // Assemble semi-colon delimited mega-string for each multiple choice field
            const keyOptions = Object
                .entries(this.state)
                .filter(option => option[1] && option[0].startsWith(key))
                .map(option => option[0].split(`${key}_`)[1]);
            if (keyOptions.length) {
                const values = keyOptions.filter(k => !k.includes('OTHER'));
                // text inputs require custom parsing to look like "OTHER-user input here"
                const textInputPrefixes = keyOptions.filter(k => k.includes('OTHER'));
                const textInputValues = textInputPrefixes.map(k => `${k}-${this.state[`${key}_${k}`]}`);
                const allValues = values.concat(textInputValues);

                multipleChoiceState[key] = arrayToSemicolonDelimitedString(allValues);
            }
        });
        /* eslint-enable react/destructuring-assignment */

        const survey = {
            num_colonies,
            apiary,
            month_year,
            survey_type: SURVEY_TYPE_APRIL,
        };

        const form = Object.assign({}, this.state, multipleChoiceState, { survey });

        getOrCreateSurveyRequest({ apiary, form })
            .then(() => {
                dispatch(fetchUserApiaries());
                close();
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
                <Fragment key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input
                        type="checkbox"
                        className="form__control"
                        id={key}
                        name={key}
                        checked={this.state[key]}
                        onChange={this.handleChange}
                        disabled={!!completedSurvey}
                    />
                </Fragment>
            );
        });
    }
    /* eslint-enable react/destructuring-assignment */

    render() {
        const {
            num_colonies,
            colony_loss_reason_OTHER,
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

        const colonyLossReasonCheckboxInputs = this.makeMultipleChoiceInputs('colony_loss_reason', COLONY_LOSS_REASONS);

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
                    </div>
                    {submitButton}
                </form>
            </>
        );

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

function mapStateToProps(state) {
    return state.main;
}

AprilSurveyForm.propTypes = {
    survey: Survey.isRequired,
    dispatch: func.isRequired,
    close: func.isRequired,
};

export default connect(mapStateToProps)(AprilSurveyForm);
