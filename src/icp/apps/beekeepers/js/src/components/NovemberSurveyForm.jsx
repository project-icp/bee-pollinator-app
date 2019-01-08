import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { number, string, func } from 'prop-types';

import { fetchUserApiaries } from '../actions';
import { SURVEY_TYPE_NOVEMBER } from '../constants';
import { arrayToSemicolonDelimitedString, getOrCreateSurveyRequest } from '../utils';

const miteManagementCheckboxOptions = [
    'CHEMICAL_FORMIC_ACID_MAQS',
    'CHEMICAL_FORMIC_ACID_FORMIC_PRO',
    'CHEMICAL_OXALIC_ACID_VAPORIZATION',
    'CHEMICAL_OXALIC_ACID_DRIBBLE',
    'CHEMICAL_THYMOL_MENTHOL_APILIFE',
    'CHEMICAL_THYMOL_MENTHOL_APIGUARD',
    'CHEMICAL_SYNTHETIC_APIVAR',
    'CHEMICAL_SYNTHETIC_APISTAN',
    'CHEMICAL_SYNTHETIC_CHECKMITE_PLUS',
    'MECHANICAL_DRONE_BROOD_REMOVAL',
    'MECHANICAL_QUEEN_MANIPULATION',
];

class NovemberSurveyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            varroa_check_method_OTHER: false,
            varroa_check_method_ALCOHOL_WASH: false,
            varroa_check_method_SUGAR_SHAKE: false,
            varroa_check_method_STICKY_BOARDS: false,
            varroa_manage_frequency: 'NEVER',
            mite_management_OTHER: '',
            mite_management_CHEMICAL_ORGANIC_OTHER: '',
            mite_management_MECHANICAL_OTHER: '',
            completedSurvey: '',
            error: '',
        };
        this.multipleChoiceKeys = [
            'supplemental_sugar',
            'supplemental_protein',
            'mite_management',
        ];
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
                let newState = {
                    completedSurvey: data,
                    num_colonies: data.survey.num_colonies,
                };
                this.multipleChoiceKeys.forEach((key) => {
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
            month_year,
            dispatch,
        } = this.props;

        const {
            num_colonies,
        } = this.state;

        const multipleChoiceState = {};
        this.multipleChoiceKeys.forEach((key) => {
            // Assemble semi-colon delimited mega-string for each multiple choice field
            const keys = Object
                .entries(this.state)
                .filter(option => option[1] && option[0].startsWith(key))
                .map(o => o[0].split(`${key}_`)[1]);
            if (keys.length) {
                const keysNotOther = keys.filter(k => !k.includes('OTHER'));
                const keysOther = keys.filter(k => k.includes('OTHER'));
                const prependedKeysOther = keysOther.map(k => `${k}-${this.state[`${key}_${k}`]}`);
                const allKeys = keysNotOther.concat(prependedKeysOther);

                multipleChoiceState[key] = arrayToSemicolonDelimitedString(allKeys);
            }
        });
        /* eslint-enable react/destructuring-assignment */

        // TODO: Replace month_year with prop from parent
        const survey = {
            num_colonies,
            apiary: apiaryId,
            month_year,
            survey_type: SURVEY_TYPE_NOVEMBER,
        };

        const form = Object.assign({}, this.state, multipleChoiceState, { survey });

        getOrCreateSurveyRequest({ apiaryId, form })
            .then(({ data }) => {
                this.setState({
                    completedSurvey: data,
                    error: '',
                });
                dispatch(fetchUserApiaries());
            })
            .catch(error => this.setState({ error: error.response.statusText }));
    }

    render() {
        const {
            num_colonies,
            // harvested_honey,
            // supplemental_sugar_SPRING,
            // supplemental_sugar_SUMMER,
            // supplemental_sugar_FALL,
            // supplemental_sugar_WINTER,
            // supplemental_protein_SPRING,
            // supplemental_protein_SUMMER,
            // supplemental_protein_FALL,
            // supplemental_protein_WINTER,
            // small_hive_beetles,
            // varroa_check_frequency,
            // varroa_check_method_OTHER,
            // varroa_check_method_ALCOHOL_WASH,
            // varroa_check_method_SUGAR_SHAKE,
            // varroa_check_method_STICKY_BOARDS,
            // varroa_manage_frequency,
            mite_management_OTHER,
            mite_management_CHEMICAL_ORGANIC_OTHER,
            mite_management_MECHANICAL_OTHER,
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

        /* eslint-disable react/destructuring-assignment */
        const miteManagementCheckboxInputs = miteManagementCheckboxOptions.map((option) => {
            const key = `mite_management_${option}`;
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
        /* eslint-enable react/destructuring-assignment */

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
                        <label htmlFor="mite_management">
                            What methods of mite management do you use?
                            Check all that apply.
                        </label>

                        {miteManagementCheckboxInputs}
                        <label htmlFor="mite_management_CHEMICAL_ORGANIC_OTHER">
                            Other organic chemical
                        </label>
                        <input
                            type="text"
                            className="form__control"
                            id="mite_management_CHEMICAL_ORGANIC_OTHER"
                            name="mite_management_CHEMICAL_ORGANIC_OTHER"
                            value={mite_management_CHEMICAL_ORGANIC_OTHER}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="mite_management_MECHANICAL_OTHER">Other mechanical</label>
                        <input
                            type="text"
                            className="form__control"
                            id="mite_management_MECHANICAL_OTHER"
                            name="mite_management_MECHANICAL_OTHER"
                            value={mite_management_MECHANICAL_OTHER}
                            onChange={this.handleChange}
                            disabled={!!completedSurvey}
                        />
                        <label htmlFor="mite_management_OTHER">Other</label>
                        <input
                            type="text"
                            className="form__control"
                            id="mite_management_OTHER"
                            name="mite_management_OTHER"
                            value={mite_management_OTHER}
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
                    <div>November survey</div>
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
    apiaryId: number.isRequired,
    surveyId: number,
    month_year: string.isRequired,
    dispatch: func.isRequired,
};

NovemberSurveyForm.defaultProps = {
    surveyId: null,
};

export default connect(mapStateToProps)(NovemberSurveyForm);
