import React, { Component } from 'react';
import { func } from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import {
    Tab,
    Tabs,
    TabList,
    TabPanel,
} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { fetchUserApiaries, flashSuccessModal } from '../actions';
import { SURVEY_TYPE_MONTHLY } from '../constants';
import { Survey } from '../propTypes';
import {
    arrayToSemicolonDelimitedString,
    getOrCreateSurveyRequest,
    toMonthNameYear,
} from '../utils';

import MonthlySurveyColonyForm from './MonthlySurveyColonyForm';

class MonthlySurveyForm extends Component {
    constructor(props) {
        super(props);
        this.initialMonthly = {
            id: null,
            inspection_date: '',
            colony_name: '',
            colony_alive: false,
            colony_loss_reason: '',
            num_bodies_supers_deep: 0,
            num_bodies_supers_medium: 0,
            num_bodies_supers_shallow: 0,
            activity_since_last: '',
            queenright: false,
            same_queen: 'YES',
            queen_stock: '',
            queen_source: 'NON_LOCAL_COMMERCIAL',
            varroa_count_performed: false,
            varroa_count_technique: '',
            varroa_count_result: 0,
            varroa_treatment: '',
            colony_loss_reason_VARROA_MITES: false,
            colony_loss_reason_INADEQUETE_FOOD_STORES: false,
            colony_loss_reason_POOR_QUEENS: false,
            colony_loss_reason_POOR_WEATHER_CONDITIONS: false,
            colony_loss_reason_COLONY_TOO_SMALL_IN_NOVEMBER: false,
            colony_loss_reason_PESTICIDE_EXPOSURE: false,
            colony_loss_reason_OTHER: '',
            activity_since_last_REMOVED_HONEY: false,
            activity_since_last_REMOVED_BROOD: false,
            activity_since_last_FED_POLLEN_OR_PROTEIN: false,
            activity_since_last_FED_SUGAR: false,
            varroa_count_technique_ALCOHOL_WASH: false,
            varroa_count_technique_SUGAR_SHAKE: false,
            varroa_count_technique_STICKY_BOARDS: false,
            varroa_count_technique_OTHER: '',
            varroa_treatment_CHEMICAL_FORMIC_ACID_MAQS: false,
            varroa_treatment_CHEMICAL_FORMIC_ACID_FORMIC_PRO: false,
            varroa_treatment_CHEMICAL_OXALIC_ACID_VAPORIZATION: false,
            varroa_treatment_CHEMICAL_OXALIC_ACID_DRIBBLE: false,
            varroa_treatment_CHEMICAL_THYMOL_MENTHOL_APILIFE: false,
            varroa_treatment_CHEMICAL_THYMOL_MENTHOL_APIGUARD: false,
            varroa_treatment_CHEMICAL_SYNTHETIC_APIVAR: false,
            varroa_treatment_CHEMICAL_SYNTHETIC_APISTAN: false,
            varroa_treatment_CHEMICAL_SYNTHETIC_CHECKMITE_PLUS: false,
            varroa_treatment_MECHANICAL_DRONE_BROOD_REMOVAL: false,
            varroa_treatment_MECHANICAL_QUEEN_MANIPULATION: false,
            varroa_treatment_CHEMICAL_ORGANIC_OTHER: '',
            varroa_treatment_MECHANICAL_OTHER: '',
            varroa_treatment_OTHER: '',
        };

        this.state = {
            num_colonies: props.survey.num_colonies || '',
            monthlies: [
                this.initialMonthly,
                this.initialMonthly,
                this.initialMonthly,
            ],
            error: '',
            selectedTabIndex: 0,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubsurveyChange = this.handleSubsurveyChange.bind(this);
        this.onTabSelect = this.onTabSelect.bind(this);
        this.multipleChoiceKeys = [
            'colony_loss_reason',
            'activity_since_last',
            'varroa_count_technique',
            'varroa_treatment',
        ];
        // If a `field` has the `value`, then all the fields in `reset` are set
        // to their value from initialMonthly
        this.resetKeys = [
            {
                field: 'colony_alive',
                value: true,
                reset: [
                    'colony_loss_reason',
                    'colony_loss_reason_VARROA_MITES',
                    'colony_loss_reason_INADEQUETE_FOOD_STORES',
                    'colony_loss_reason_POOR_QUEENS',
                    'colony_loss_reason_POOR_WEATHER_CONDITIONS',
                    'colony_loss_reason_COLONY_TOO_SMALL_IN_NOVEMBER',
                    'colony_loss_reason_PESTICIDE_EXPOSURE',
                    'colony_loss_reason_OTHER',
                ],
            },
            {
                field: 'varroa_count_performed',
                value: false,
                reset: [
                    'varroa_count_technique',
                    'varroa_count_technique_ALCOHOL_WASH',
                    'varroa_count_technique_SUGAR_SHAKE',
                    'varroa_count_technique_STICKY_BOARDS',
                    'varroa_count_technique_OTHER',
                    'varroa_count_result',
                ],
            },
        ];
    }

    componentDidMount() {
        const { monthlies: prevMonthlies } = this.state;
        const { survey: { id, apiary } } = this.props;

        if (id) {
            getOrCreateSurveyRequest({ apiary, id })
                .then(({ data }) => {
                    const monthlies = data.monthlies.map((serverData, idx) => {
                        let clientData = prevMonthlies[idx];

                        this.multipleChoiceKeys.forEach((mcKey) => {
                            if (mcKey in serverData) {
                                const keys = serverData[mcKey]
                                    .split(';')
                                    .map(k => `${mcKey}_${k}`);

                                clientData = keys.reduce((acc, k) => {
                                    const otherIndex = k.indexOf('OTHER-');
                                    if (otherIndex > -1) {
                                        const otherKey = k.substring(0, otherIndex + 5);
                                        const otherValue = k.substring(otherIndex + 6);

                                        acc[otherKey] = otherValue;
                                    } else {
                                        acc[k] = true;
                                    }

                                    return acc;
                                }, clientData);
                            }
                        });

                        return Object.assign({}, clientData, serverData);
                    });

                    this.setState({
                        num_colonies: data.num_colonies,
                        monthlies,
                    });
                })
                .catch(error => this.setState({ error }));
        }
    }

    onTabSelect(selectedTabIndex) {
        this.setState({ selectedTabIndex });
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

    handleSubsurveyChange(idx) {
        return ({
            currentTarget: {
                value,
                type,
                checked,
                name,
            },
        }) => {
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

            // Convert numbers
            if (type === 'number') {
                finalValue = Number(value);
            }

            const { monthlies } = this.state;

            let changeset = {
                [name]: {
                    $set: finalValue,
                },
            };

            // Reset dependent keys if needed
            const resetKey = this.resetKeys.find(({ field }) => field === name);
            if (resetKey && resetKey.value === finalValue) {
                changeset = resetKey.reset.reduce(
                    (acc, f) => Object.assign(acc, {
                        [f]: {
                            $set: this.initialMonthly[f],
                        },
                    }),
                    changeset,
                );
            }

            this.setState({
                monthlies: update(monthlies, {
                    [idx]: changeset,
                }),
            });
        };
    }

    handleSubmit(event) {
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
            monthlies: prevMonthlies,
            num_colonies,
        } = this.state;

        const monthlies = prevMonthlies.map((monthly) => {
            // Skip if colony name was not specified
            if (!monthly.colony_name) {
                return null;
            }

            const multipleChoiceData = {};

            this.multipleChoiceKeys.forEach((mcKey) => {
                const keyOptions = Object.entries(monthly)
                    .filter(([k, v]) => v && k.startsWith(mcKey))
                    // eslint-disable-next-line no-unused-vars
                    .map(([k, _]) => k.split(`${mcKey}_`)[1]);

                if (keyOptions.length) {
                    const values = keyOptions.filter(k => !k.includes('OTHER'));
                    // text inputs require custom parsing to look like "OTHER-user input here"
                    const textInputPrefixes = keyOptions.filter(k => k.includes('OTHER'));
                    const textInputValues = textInputPrefixes.map(k => `${k}-${monthly[`${mcKey}_${k}`]}`);
                    const allValues = values.concat(textInputValues);

                    multipleChoiceData[mcKey] = arrayToSemicolonDelimitedString(allValues);
                }
            });

            return Object.assign({}, monthly, multipleChoiceData);
        }).filter(m => m !== null);

        if (monthlies.length === 0) {
            this.setState({ error: 'Please fill out at least one colony' });
            return;
        }

        const form = {
            num_colonies,
            apiary,
            month_year,
            survey_type: SURVEY_TYPE_MONTHLY,
            monthlies,
        };

        getOrCreateSurveyRequest({ apiary, form })
            .then(() => {
                dispatch(fetchUserApiaries());
                close();
                dispatch(flashSuccessModal());
            })
            .catch(error => this.setState({ error: error.response.statusText }));
    }

    render() {
        const {
            num_colonies,
            monthlies,
            error,
            selectedTabIndex,
        } = this.state;

        const { survey: { month_year, completed } } = this.props;

        const userMessage = error.length ? (
            <div className="form__group--error">
                {error}
            </div>
        ) : null;

        const submitButtons = completed ? null : (
            <div className="confirmation form__group">
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
                <button
                    type="submit"
                    value="Submit"
                    className="button--long"
                >
                    Submit
                </button>
            </div>
        );

        const tabs = monthlies.map((_, idx) => (
            // It's okay to disable this rule because the ordering is never changed
            // eslint-disable-next-line react/no-array-index-key
            <Tab key={idx}>
                {`Colony ${idx + 1}`}
            </Tab>
        ));

        const tabPanels = monthlies.map((data, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <TabPanel key={idx}>
                <MonthlySurveyColonyForm
                    onChange={this.handleSubsurveyChange(idx)}
                    data={data}
                    idx={idx}
                />
            </TabPanel>
        ));

        const surveyForm = (
            <>
                <div className="title">
                    Monthly Survey for
                    {' '}
                    {toMonthNameYear(month_year)}
                </div>
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
                            disabled={completed}
                            required
                        />
                    </div>
                    <div className="tab-description">
                        Please enter details for up to three colonies. Every named
                        colony will be saved.
                    </div>
                    <Tabs
                        forceRenderTabPanel
                        selectedIndex={selectedTabIndex}
                        onSelect={this.onTabSelect}
                    >
                        <TabList>
                            {tabs}
                        </TabList>
                        {tabPanels}
                    </Tabs>
                    {submitButtons}
                </form>
            </>
        );

        return (
            <div className="authModal">
                <div className="authModal__header">
                    <div>Monthly Survey</div>
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

MonthlySurveyForm.propTypes = {
    survey: Survey.isRequired,
    dispatch: func.isRequired,
    close: func.isRequired,
};

export default connect(mapStateToProps)(MonthlySurveyForm);
