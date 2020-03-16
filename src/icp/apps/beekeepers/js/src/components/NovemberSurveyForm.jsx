import React, { Component } from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import { fetchUserApiaries, flashSuccessModal } from '../actions';
import {
    SURVEY_TYPE_NOVEMBER,
    MITE_MANAGEMENT_OPTIONS,
    SEASONS,
    VARROA_CHECK_METHODS,
    VARROA_ALCOHOL_WASH_DESCRIPTION,
    VARROA_STICKYBOARD_DESCRIPTION,
    VARROA_SUGAR_SHAKE_DESCRIPTION,
    THYMOL_DESCRIPTION,
    AMITRAZ_DESCRIPTION,
} from '../constants';
import {
    arrayToSemicolonDelimitedString,
    getSurveyRequest,
    createSurveyRequest,
    updateSurveyRequest,
    toMonthNameYear,
} from '../utils';
import { Apiary, Survey } from '../propTypes';
import Tooltip from './Tooltip';


class NovemberSurveyForm extends Component {
    constructor(props) {
        super(props);
        this.initialState = {
            // each form input corresponds to a state var
            num_colonies: '',
            harvested_honey: 'DID_NOT_HARVEST',
            supplemental_sugar_SPRING: false,
            supplemental_sugar_SUMMER: false,
            supplemental_sugar_FALL: false,
            supplemental_sugar_WINTER: false,
            supplemental_protein_SPRING: false,
            supplemental_protein_SUMMER: false,
            supplemental_protein_FALL: false,
            supplemental_protein_WINTER: false,
            small_hive_beetles: false,
            varroa_check_frequency: 'NEVER',
            varroa_check_method_OTHER: '',
            varroa_check_method_ALCOHOL_WASH: false,
            varroa_check_method_SUGAR_SHAKE: false,
            varroa_check_method_STICKY_BOARDS: false,
            varroa_manage_frequency: 'NEVER',
            mite_management_OTHER: '',
            mite_management_FORMIC_ACID: false,
            mite_management_OXALIC_ACID: false,
            mite_management_THYMOL: false,
            mite_management_NONE: false,
            mite_management_AMITRAZ: false,
            mite_management_APISTAN: false,
            mite_management_CHECKMITE: false,
            mite_management_DRONE_REMOVE: false,
            mite_management_QUEEN_MANIPULATION: false,
            all_colonies_treated: true,
            notes: '',
            completedSurvey: '',
            error: '',
        };
        this.state = this.initialState;
        this.multipleChoiceKeys = [
            'supplemental_sugar',
            'supplemental_protein',
            'varroa_check_method',
            'mite_management',
        ];
        // If a `field` has the `value`, then all the fields in `reset` are set
        // to their value from initialState
        this.resetKeys = [
            {
                field: 'varroa_check_frequency',
                value: 'NEVER',
                reset: [
                    'varroa_check_method_ALCOHOL_WASH',
                    'varroa_check_method_STICKY_BOARDS',
                    'varroa_check_method_SUGAR_SHAKE',
                    'varroa_check_method_OTHER',
                    'varroa_manage_frequency',
                ],
            },
        ];
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.makeSeasonalInputs = this.makeSeasonalInputs.bind(this);
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
            getSurveyRequest({
                apiary,
                id,
            }).then(({ data }) => {
                let newState = {
                    completedSurvey: data,
                    num_colonies: data.num_colonies,
                    harvested_honey: data.november.harvested_honey,
                    small_hive_beetles: data.november.small_hive_beetles,
                    varroa_check_frequency: data.november.varroa_check_frequency,
                    varroa_manage_frequency: data.november.varroa_manage_frequency,
                    all_colonies_treated: data.november.all_colonies_treated,
                    notes: data.november.notes,
                };
                this.multipleChoiceKeys.forEach((key) => {
                    if (data.november[key]) {
                        const keys = data.november[key].split(';')
                            .map(s => `${key}_${s}`);
                        newState = keys.reduce((acc, k) => {
                            // Other text input requires special handling
                            // to parse key name and capture value
                            if (k.includes('_OTHER-')) {
                                const otherKey = k.split('-')[0];
                                const otherValue = k.split('_OTHER-')[1];
                                acc[otherKey] = otherValue;
                            } else {
                                acc[k] = true;
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

        // Convert boolean strings to bools
        if (finalValue === 'true') {
            finalValue = true;
        }
        if (finalValue === 'false') {
            finalValue = false;
        }

        let changeset = { [name]: finalValue };
        // Reset dependent keys if needed
        const resetKey = this.resetKeys.find(({ field }) => field === name);
        if (resetKey && resetKey.value === finalValue) {
            changeset = resetKey.reset.reduce(
                (acc, f) => Object.assign(acc, {
                    [f]: this.initialState[f],
                }),
                changeset,
            );
        }
        this.setState(changeset);
    }


    handleSubmit(event) {
        /* eslint-disable react/destructuring-assignment */
        // Send form data to backend for validation/save and prevent form from closing modal
        event.preventDefault();
        const {
            survey: {
                apiary,
                month_year,
                id,
            },
        } = this.props;

        const {
            num_colonies,
            completedSurvey,
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

        const november = Object.assign({}, this.state, multipleChoiceState);

        const form = {
            num_colonies,
            apiary,
            month_year,
            survey_type: SURVEY_TYPE_NOVEMBER,
            november,
        };

        if (completedSurvey) {
            updateSurveyRequest({ apiary, id, form })
                .then(() => this.handleSuccess())
                .catch(error => this.setState({ error: error.response.statusText }));
        } else {
            createSurveyRequest({ apiary, form })
                .then(() => this.handleSuccess())
                .catch(error => this.setState({ error: error.response.statusText }));
        }
    }

    handleSuccess() {
        const { dispatch, close } = this.props;
        dispatch(fetchUserApiaries());
        close();
        dispatch(flashSuccessModal());
    }

    /* eslint-disable react/destructuring-assignment */
    makeMultipleChoiceInputs(groupName, options, tooltipDescriptions) {
        return options.map((option, index) => {
            const key = `${groupName}_${option}`;
            const label = option.split('_').join(' ').toLowerCase();
            const tooltip = tooltipDescriptions && tooltipDescriptions[index]
                ? <Tooltip description={[tooltipDescriptions[index]]} />
                : null;
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
                    />
                    <label htmlFor={key}>
                        {label}
                        {tooltip}
                    </label>
                </div>
            );
        });
    }

    makeSeasonalInputs(groupName) {
        return SEASONS.map((option) => {
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
            harvested_honey,
            small_hive_beetles,
            varroa_check_frequency,
            varroa_check_method_OTHER,
            varroa_manage_frequency,
            mite_management_OTHER,
            all_colonies_treated,
            notes,
            completedSurvey,
            error,
        } = this.state;

        const {
            apiary: { name },
            survey: { month_year },
            close,
        } = this.props;

        const userMessage = error.length ? (
            <div className="form__group--error">
                {error}
            </div>
        ) : null;

        const submitButton = (
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

        const confirmationButton = (
            <div className="form__group">
                <label htmlFor="confirmation">
                    Have you provided all the information available for these
                    colonies and are ready to submit the survey?
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

        const miteManagementCheckboxInputs = this.makeMultipleChoiceInputs(
            'mite_management',
            MITE_MANAGEMENT_OPTIONS,
            [THYMOL_DESCRIPTION, AMITRAZ_DESCRIPTION],
        );

        const supplementalSugarInputs = this.makeSeasonalInputs('supplemental_sugar');

        const supplementalProteinInputs = this.makeSeasonalInputs('supplemental_protein');

        const varroaCheckMethodCheckboxInputs = this.makeMultipleChoiceInputs(
            'varroa_check_method',
            VARROA_CHECK_METHODS,
            [
                VARROA_ALCOHOL_WASH_DESCRIPTION,
                VARROA_SUGAR_SHAKE_DESCRIPTION,
                VARROA_STICKYBOARD_DESCRIPTION,
            ],
        );

        const varroaConditionalInputs = varroa_check_frequency !== 'NEVER'
            ? (
            <>
                <div className="form__group">
                    <label htmlFor="varroa_check_method">
                        What method(s) do you use to check for Varroa?
                        Check all that apply.
                    </label>
                    {varroaCheckMethodCheckboxInputs}
                    <div className="form__secondary">
                        <label htmlFor="varroa_check_method_OTHER">Other varroa check method</label>
                        <input
                            type="text"
                            className="form__control"
                            id="varroa_check_method_OTHER"
                            name="varroa_check_method_OTHER"
                            value={varroa_check_method_OTHER}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="form__group">
                    <label htmlFor="varroa_manage_frequency">
                        How you manage for Varroa? If so, how often?
                    </label>
                    <select
                        id="varroa_manage_frequency"
                        name="varroa_manage_frequency"
                        value={varroa_manage_frequency}
                        onChange={this.handleChange}
                        className="form__control"
                    >
                        <option value="NEVER">I did not</option>
                        <option value="ONCE">Once a year</option>
                        <option value="TWICE">Twice a year</option>
                        <option value="THRICE">Three times a year</option>
                        <option value="MORE_THAN_THREE">More than three times a year</option>
                    </select>
                </div>
            </>
            ) : null;

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
                            required
                            min={0}
                        />
                        <div className="form__group">
                            <label htmlFor="harvested_honey">
                                Approximately how much honey did you collect for each colony
                                this year?
                            </label>
                            <select
                                id="harvested_honey"
                                name="harvested_honey"
                                value={harvested_honey}
                                onChange={this.handleChange}
                                className="form__control"
                            >
                                <option value="DID_NOT_HARVEST">Did not harvest</option>
                                <option value="LESS_THAN_10">Less than 10 lbs</option>
                                <option value="BETWEEN_10_AND_25">Between 10 and 25 lbs</option>
                                <option value="BETWEEN_25_AND_50">Between 25 and 50 lbs</option>
                                <option value="MORE_THAN_50">More than 50</option>
                            </select>
                        </div>
                        <div className="form__group">
                            <label htmlFor="supplemental_sugar">
                                Did you feed supplemental sugar?
                                If so, what times of year did you feed sugar?
                                Check all that apply.
                            </label>
                            {supplementalSugarInputs}
                        </div>
                        <div className="form__group">
                            <label htmlFor="supplemental_protein">
                                Did you feed supplemental pollen or protein?
                                If so, what times of year did you feed pollen or protein?
                                Check all that apply.
                            </label>
                            {supplementalProteinInputs}
                        </div>
                        <div className="form__group">
                            <label htmlFor="small_hive_beetles">
                                Have you observed small hive beetles in your hives?
                            </label>
                            <select
                                className="form__control"
                                id="small_hive_beetles"
                                name="small_hive_beetles"
                                value={small_hive_beetles}
                                onChange={this.handleChange}
                            >
                                <option key="true" value="true">Yes</option>
                                <option key="false" value="false">No</option>
                            </select>
                        </div>
                        <div className="form__group">
                            <label htmlFor="varroa_check_frequency">
                                How often do you check for Varroa?
                            </label>
                            <select
                                id="varroa_check_frequency"
                                name="varroa_check_frequency"
                                value={varroa_check_frequency}
                                onChange={this.handleChange}
                                className="form__control"
                            >
                                <option value="NEVER">I did not</option>
                                <option value="ONCE">Once a year</option>
                                <option value="TWICE">Twice a year</option>
                                <option value="THRICE">Three times a year</option>
                                <option value="MORE_THAN_THREE">More than three times a year</option>
                            </select>
                        </div>
                        {varroaConditionalInputs}
                        <div className="form__group">
                            <label htmlFor="mite_management">
                                What methods of mite management do you use?
                                Check all that apply.
                            </label>
                            {miteManagementCheckboxInputs}
                            <div className="form__secondary">
                                <label htmlFor="mite_management_OTHER">Other</label>
                                <input
                                    type="text"
                                    className="form__control"
                                    id="mite_management_OTHER"
                                    name="mite_management_OTHER"
                                    value={mite_management_OTHER}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="form__group">
                            <label htmlFor="all_colonies_treated">
                                Did you treat all of the colonies in the apiary?
                            </label>
                            <select
                                className="form__control"
                                id="all_colonies_treated"
                                name="all_colonies_treated"
                                value={all_colonies_treated}
                                onChange={this.handleChange}
                            >
                                <option key="true" value="true">Yes</option>
                                <option key="false" value="false">No</option>
                            </select>
                        </div>
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
                    <button type="button" className="button" onClick={close} aria-label="Close dialog">
                        &times;
                    </button>
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

NovemberSurveyForm.propTypes = {
    apiary: Apiary.isRequired,
    survey: Survey.isRequired,
    dispatch: func.isRequired,
    close: func.isRequired,
};

export default connect(mapStateToProps)(NovemberSurveyForm);
