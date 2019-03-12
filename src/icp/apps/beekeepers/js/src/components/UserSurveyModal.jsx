import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { createUserSurvey } from '../actions';
import { arrayToSemicolonDelimitedString } from '../utils';

import Tooltip from './Tooltip';
import {
    CONTRIBUTION_LEVEL_LIGHT_DESCRIPTION,
    RELOCATE_COLONIES_DESCRIPTION,
    CONTRIBUTION_LEVEL_PRO_DESCRIPTION,
    VARROA_MANAGEMENT_DESCRIPTION,
} from '../constants';

class UserSurveyModal extends Component {
    constructor(props) {
        super(props);
        this.initialState = {
            // each form input corresponds to a state var
            contribution_level: 'PRO',
            phone: '',
            preferred_contact: 'EMAIL',
            year_began: '',
            organization: '',
            total_colonies: 'BETWEEN_1_AND_3',
            relocate: false,
            income: '',
            income_rent: '',
            income_sell_honey: '',
            income_sell_nucs: '',
            income_sell_queens: '',
            practice: 'CONVENTIONAL',
            varroa_management: false,
            varroa_management_trigger: '',
            varroa_management_trigger_mite_counts: '',
            varroa_management_trigger_mite_symptoms: '',
            varroa_management_trigger_time_of_year: '',
            varroa_management_trigger_other: '',
            purchased_queens: false,
            purchased_queens_sources: '',
            resistant_queens: false,
            resistant_queens_genetics: '',
            rear_queens: false,
            equipment: '',
            equipment_8_frame: '',
            equipment_10_frame: '',
            equipment_top_bar: '',
            equipment_warre_hive: '',
            equipment_other: '',
        };
        // If a `field` has the `value`, then all the fields in `reset` are set
        // to their value from initialState
        this.resetKeys = [
            {
                field: 'varroa_management',
                value: false,
                reset: [
                    'varroa_management_trigger',
                    'varroa_management_trigger_mite_counts',
                    'varroa_management_trigger_mite_symptoms',
                    'varroa_management_trigger_time_of_year',
                    'varroa_management_trigger_other',
                ],
            },
            {
                field: 'purchased_queens',
                value: false,
                reset: [
                    'purchased_queens_sources',
                ],
            },
            {
                field: 'resistant_queens',
                value: false,
                reset: [
                    'resistant_queens_genetics',
                ],
            },
        ];
        this.state = this.initialState;
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
        // Send form data to backend for validation and prevent modal from closing
        event.preventDefault();
        const {
            dispatch,
        } = this.props;

        const {
            income_rent,
            income_sell_honey,
            income_sell_nucs,
            income_sell_queens,
            varroa_management_trigger_mite_counts,
            varroa_management_trigger_mite_symptoms,
            varroa_management_trigger_time_of_year,
            varroa_management_trigger_other,
            equipment_8_frame,
            equipment_10_frame,
            equipment_top_bar,
            equipment_warre_hive,
            equipment_other,
        } = this.state;

        const income = arrayToSemicolonDelimitedString(
            [income_rent, income_sell_honey, income_sell_nucs, income_sell_queens],
        );

        const prepend_varroa_management_trigger_other = varroa_management_trigger_other.length ? `OTHER-${varroa_management_trigger_other}` : '';
        const varroa_management_trigger = arrayToSemicolonDelimitedString(
            [
                varroa_management_trigger_mite_counts,
                varroa_management_trigger_mite_symptoms,
                varroa_management_trigger_time_of_year,
                prepend_varroa_management_trigger_other,
            ],
        );

        const prepended_equipment_other = equipment_other.length ? `OTHER-${equipment_other}` : '';
        const equipment = arrayToSemicolonDelimitedString(
            [
                equipment_8_frame,
                equipment_10_frame,
                equipment_top_bar,
                equipment_warre_hive,
                prepended_equipment_other,
            ],
        );
        const form = Object.assign({}, this.state, {
            income,
            varroa_management_trigger,
            equipment,
        });
        dispatch(createUserSurvey(form));

        this.setState(this.initialState);
    }

    render() {
        const {
            authError,
            isUserSurveyModalOpen,
        } = this.props;

        const {
            contribution_level,
            phone,
            preferred_contact,
            year_began,
            organization,
            total_colonies,
            relocate,
            income_rent,
            income_sell_honey,
            income_sell_nucs,
            income_sell_queens,
            practice,
            varroa_management,
            varroa_management_trigger_mite_counts,
            varroa_management_trigger_mite_symptoms,
            varroa_management_trigger_time_of_year,
            varroa_management_trigger_other,
            purchased_queens,
            purchased_queens_sources,
            resistant_queens,
            resistant_queens_genetics,
            rear_queens,
            equipment_8_frame,
            equipment_10_frame,
            equipment_top_bar,
            equipment_warre_hive,
            equipment_other,
        } = this.state;

        const errorWarning = authError ? (
            <div className="form__group--error">
                {authError}
            </div>
        ) : null;

        return (
            <Popup
                open={isUserSurveyModalOpen}
                closeOnEscape={false}
                closeOnDocumentClick={false}
                className="modal userModal"
                modal
            >
                <div className="authModal">
                    <div className="authModal__header">
                        <div>User survey</div>
                    </div>
                    <div className="authModal__content">
                        <div className="title">Beescape Team Registration</div>
                        Please provide us with some basic information about your honey bees.
                        <form className="form" onSubmit={this.handleSubmit}>
                            {errorWarning}
                            <div className="form__group">
                                <label htmlFor="contribution_level">
                                    What level will you contribute at?
                                    <Tooltip
                                        description={[
                                            CONTRIBUTION_LEVEL_LIGHT_DESCRIPTION,
                                            CONTRIBUTION_LEVEL_PRO_DESCRIPTION,
                                        ]}
                                    />
                                </label>
                                <select
                                    id="contribution_level"
                                    name="contribution_level"
                                    value={contribution_level}
                                    onChange={this.handleChange}
                                    className="form__control"
                                >
                                    <option value="PRO">Pro</option>
                                    <option value="LIGHT">Light</option>
                                </select>
                            </div>
                            <div className="form__group">
                                <label htmlFor="phone">Phone number</label>
                                <input
                                    type="text"
                                    className="form__control"
                                    id="phone"
                                    name="phone"
                                    value={phone}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="preferred_contact">Do you prefer email or phone?</label>
                                <select
                                    id="preferred_contact"
                                    name="preferred_contact"
                                    value={preferred_contact}
                                    onChange={this.handleChange}
                                    className="form__control"
                                >
                                    <option value="EMAIL">Email</option>
                                    <option value="PHONE">Phone</option>
                                </select>
                            </div>
                            <div className="form__group">
                                <label htmlFor="year_began">
                                    What year did you start keeping bees?
                                </label>
                                <input
                                    type="number"
                                    className="form__control"
                                    id="year_began"
                                    name="year_began"
                                    value={year_began}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="organization">
                                    Are you part of a Beekeeper&rsquo;s Organization or Club?
                                    Which one?
                                </label>
                                <input
                                    type="text"
                                    className="form__control"
                                    id="organization"
                                    name="organization"
                                    value={organization}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="total_colonies">
                                    How many total colonies do you manage?
                                </label>
                                <select
                                    id="total_colonies"
                                    name="total_colonies"
                                    value={total_colonies}
                                    onChange={this.handleChange}
                                    className="form__control"
                                >
                                    <option value="BETWEEN_1_AND_3">1-3</option>
                                    <option value="BETWEEN_4_AND_7">4-7</option>
                                    <option value="BETWEEN_8_AND_25">8-25</option>
                                    <option value="BETWEEN_26_AND_59">26-59</option>
                                    <option value="BETWEEN_60_AND_99">60-99</option>
                                    <option value="BETWEEN_100_AND_499">100-499</option>
                                    <option value="BETWEEN_500_AND_2000">500-2000</option>
                                    <option value="MORE_THAN_2000">More than 2000</option>
                                </select>
                            </div>
                            <div className="form__group">
                                <label htmlFor="relocate">
                                    Do you relocate your colonies throughout the year?
                                    <Tooltip description={[RELOCATE_COLONIES_DESCRIPTION]} />
                                </label>
                                <select
                                    className="form__control"
                                    id="relocate"
                                    name="relocate"
                                    value={relocate}
                                    onChange={this.handleChange}
                                >
                                    <option key="true" value="true">Yes</option>
                                    <option key="false" value="false">No</option>
                                </select>
                            </div>
                            <div className="form__group">
                                <label htmlFor="income">
                                    Do you receive income from any of the following?
                                    Check all that apply.
                                </label>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="income_rent"
                                        name="income_rent"
                                        checked={income_rent}
                                        onChange={this.handleChange}
                                        value="RENT_COLONIES_FOR_POLLINATION"
                                    />
                                    <label htmlFor="income_rent">Rent colonies for pollination</label>
                                </div>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="income_sell_honey"
                                        name="income_sell_honey"
                                        checked={income_sell_honey}
                                        onChange={this.handleChange}
                                        value="SELL_HONEY"
                                    />
                                    <label htmlFor="income_sell_honey">Sell honey</label>
                                </div>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="income_sell_nucs"
                                        name="income_sell_nucs"
                                        checked={income_sell_nucs}
                                        onChange={this.handleChange}
                                        value="SELL_NUCS_PACKAGES"
                                    />
                                    <label htmlFor="income_sell_nucs">Sell nucs package</label>
                                </div>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="income_sell_queens"
                                        name="income_sell_queens"
                                        checked={income_sell_queens}
                                        onChange={this.handleChange}
                                        value="SELL_QUEENS"
                                    />
                                    <label htmlFor="income_sell_queens">Sell queens</label>
                                </div>
                            </div>
                            <div className="form__group">
                                <label htmlFor="practice">
                                    What best describes your beekeeping practice?
                                </label>
                                <select
                                    id="practice"
                                    name="practice"
                                    value={practice}
                                    onChange={this.handleChange}
                                    className="form__control"
                                >
                                    <option value="CONVENTIONAL">Conventional</option>
                                    <option value="ORGANIC">Organic</option>
                                    <option value="NATURAL">Natural</option>
                                </select>
                            </div>
                            <div className="form__group">
                                <label htmlFor="varroa_management">
                                    Do you manage for Varroa?
                                    <Tooltip description={[VARROA_MANAGEMENT_DESCRIPTION]} />
                                </label>
                                <select
                                    className="form__control"
                                    id="varroa_management"
                                    name="varroa_management"
                                    value={varroa_management}
                                    onChange={this.handleChange}
                                >
                                    <option key="true" value="true">Yes</option>
                                    <option key="false" value="false">No</option>
                                </select>
                            </div>
                            {varroa_management && (
                                <div className="form__group">
                                    <label htmlFor="varroa_management_trigger">
                                        How do you decide when to manage for Varroa?
                                    </label>
                                    <div className="form__checkbox">
                                        <input
                                            type="checkbox"
                                            className="form__control"
                                            id="varroa_management_trigger_mite_counts"
                                            name="varroa_management_trigger_mite_counts"
                                            checked={varroa_management_trigger_mite_counts}
                                            onChange={this.handleChange}
                                            value="MITE_COUNTS"
                                        />
                                        <label htmlFor="varroa_management_trigger_mite_counts">Mite Counts</label>
                                    </div>
                                    <div className="form__checkbox">
                                        <input
                                            type="checkbox"
                                            className="form__control"
                                            id="varroa_management_trigger_mite_symptoms"
                                            name="varroa_management_trigger_mite_symptoms"
                                            checked={varroa_management_trigger_mite_symptoms}
                                            onChange={this.handleChange}
                                            value="MITE_SYMPTOMS"
                                        />
                                        <label htmlFor="varroa_management_trigger_mite_symptoms">Mite Symptoms</label>
                                    </div>
                                    <div className="form__checkbox">
                                        <input
                                            type="checkbox"
                                            className="form__control"
                                            id="varroa_management_trigger_time_of_year"
                                            name="varroa_management_trigger_time_of_year"
                                            checked={varroa_management_trigger_time_of_year}
                                            onChange={this.handleChange}
                                            value="TIME_OF_YEAR"
                                        />
                                        <label htmlFor="varroa_management_trigger_time_of_year">Time of Year</label>
                                    </div>
                                    <label htmlFor="varroa_management_trigger_other">Other</label>
                                    <input
                                        type="text"
                                        className="form__control"
                                        id="varroa_management_trigger_other"
                                        name="varroa_management_trigger_other"
                                        value={varroa_management_trigger_other}
                                        onChange={this.handleChange}
                                    />
                                </div>
                            )}
                            <div className="form__group">
                                <label htmlFor="purchased_queens">
                                    Do you regularly buy queens, nucs or packages?
                                </label>
                                <select
                                    className="form__control"
                                    id="purchased_queens"
                                    name="purchased_queens"
                                    value={purchased_queens}
                                    onChange={this.handleChange}
                                >
                                    <option key="true" value="true">Yes</option>
                                    <option key="false" value="false">No</option>
                                </select>
                            </div>
                            {purchased_queens && (
                                <div className="form__group">
                                    <label htmlFor="purchased_queens_sources">
                                        From what state(s) did your purchased bees originate?
                                    </label>
                                    <input
                                        type="text"
                                        className="form__control"
                                        id="purchased_queens_sources"
                                        name="purchased_queens_sources"
                                        value={purchased_queens_sources}
                                        onChange={this.handleChange}
                                    />
                                </div>
                            )}
                            <div className="form__group">
                                <label htmlFor="resistant_queens">
                                    Do you use Varroa-resistant queens?
                                </label>
                                <select
                                    className="form__control"
                                    id="resistant_queens"
                                    name="resistant_queens"
                                    value={resistant_queens}
                                    onChange={this.handleChange}
                                >
                                    <option key="true" value="true">Yes</option>
                                    <option key="false" value="false">No</option>
                                </select>
                            </div>
                            {resistant_queens && (
                                <div className="form__group">
                                    <label htmlFor="resistant_queens_genetics">
                                        What is the stock or genetic background of your queens?
                                    </label>
                                    <input
                                        type="text"
                                        className="form__control"
                                        id="resistant_queens_genetics"
                                        name="resistant_queens_genetics"
                                        value={resistant_queens_genetics}
                                        onChange={this.handleChange}
                                    />
                                </div>
                            )}
                            <div className="form__group">
                                <label htmlFor="rear_queens">
                                    Do you rear queens?
                                </label>
                                <select
                                    className="form__control"
                                    id="rear_queens"
                                    name="rear_queens"
                                    value={rear_queens}
                                    onChange={this.handleChange}
                                >
                                    <option key="true" value="true">Yes</option>
                                    <option key="false" value="false">No</option>
                                </select>
                            </div>
                            <div className="form__group">
                                <label htmlFor="equipment">
                                    What kind of equipment do you use? Check all that apply.
                                </label>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="equipment_8_frame"
                                        name="equipment_8_frame"
                                        checked={equipment_8_frame}
                                        onChange={this.handleChange}
                                        value="8_FRAME_LANGSTROTH"
                                    />
                                    <label htmlFor="equipment_8_frame">8 frame Langstroth</label>
                                </div>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="equipment_10_frame"
                                        name="equipment_10_frame"
                                        checked={equipment_10_frame}
                                        onChange={this.handleChange}
                                        value="10_FRAME_LANGSTROTH"
                                    />
                                    <label htmlFor="equipment_10_frame">10 frame Langstroth</label>
                                </div>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="equipment_top_bar"
                                        name="equipment_top_bar"
                                        checked={equipment_top_bar}
                                        onChange={this.handleChange}
                                        value="TOP_BAR"
                                    />
                                    <label htmlFor="equipment_top_bar">Top bar</label>
                                </div>
                                <div className="form__checkbox">
                                    <input
                                        type="checkbox"
                                        className="form__control"
                                        id="equipment_warre_hive"
                                        name="equipment_warre_hive"
                                        checked={equipment_warre_hive}
                                        onChange={this.handleChange}
                                        value="WARRE_HIVE"
                                    />
                                    <label htmlFor="equipment_warre_hive">Warre hive</label>
                                </div>
                                <label htmlFor="equipment_other">Other</label>
                                <input
                                    type="text"
                                    className="form__control"
                                    id="equipment_other"
                                    name="equipment_other"
                                    value={equipment_other}
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


function mapStateToProps(state) {
    return {
        isUserSurveyModalOpen: state.main.isUserSurveyModalOpen,
        dispatch: state.main.dispatch,
        authError: state.auth.authError,
    };
}

UserSurveyModal.propTypes = {
    isUserSurveyModalOpen: bool.isRequired,
    dispatch: func.isRequired,
    authError: string.isRequired,
};

export default connect(mapStateToProps)(UserSurveyModal);
