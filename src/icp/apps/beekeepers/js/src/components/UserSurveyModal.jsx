import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { createUserSurvey } from '../actions';
import { arrayToSemicolonDelimitedString } from '../utils';

/* eslint-disable camelcase */
class UserSurveyModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            income_none: '',
            practice: 'CONVENTIONAL',
            varroa_management: false,
            varroa_management_trigger: '',
            purchased_queens: false,
            purchased_queens_sources: '',
            resistant_queens: false,
            resistant_queens_genetics: '',
            rear_queens: false,
            equipment: '',
            equipment_8_frame: '',
            equipment_10_frame: '',
            equipment_top_bar: '',
            equipment_other: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.currentTarget;
        const { value } = target;
        let finalValue = value;
        if (target.type === 'checkbox') {
            if (value === 'on') {
                finalValue = target.checked;
            } else {
                finalValue = target.checked ? value : '';
            }
        }
        this.setState({ [target.name]: finalValue });
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
            income_none,
            equipment_8_frame,
            equipment_10_frame,
            equipment_top_bar,
            equipment_other,
        } = this.state;

        const income = arrayToSemicolonDelimitedString(
            [income_none, income_rent, income_sell_honey, income_sell_nucs, income_sell_queens],
        );
        const prepended_equipment_other = equipment_other.length ? `OTHER-${equipment_other}` : '';
        const equipment = arrayToSemicolonDelimitedString(
            [equipment_8_frame, equipment_10_frame, equipment_top_bar, prepended_equipment_other],
        );
        const form = Object.assign({}, this.state);
        form.income = income;
        form.equipment = equipment;
        dispatch(createUserSurvey(form));
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
            income_none,
            practice,
            varroa_management,
            varroa_management_trigger,
            purchased_queens,
            purchased_queens_sources,
            resistant_queens,
            resistant_queens_genetics,
            rear_queens,
            equipment_8_frame,
            equipment_10_frame,
            equipment_top_bar,
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
                modal
            >
                <div className="authModal">
                    <div className="authModal__header">
                        <div>User survey</div>
                    </div>
                    <div className="authModal__content">
                        <div className="title">Fill our your user survey</div>
                        <form className="form" onSubmit={this.handleSubmit}>
                            {errorWarning}
                            <div className="form__group">
                                <label htmlFor="contribution_level">
                                    What level will you contribute at?
                                </label>
                                <select
                                    type="text"
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
                                    name="phone"
                                    value={phone}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="preferred_contact">Do you prefer email or phone?</label>
                                <select
                                    type="text"
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
                                    type="text"
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
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="relocate"
                                    checked={relocate}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="income">
                                    Do you obtain income from your bees?
                                    What do you receive income from?
                                    Check all that apply.
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income_rent"
                                    checked={income_rent}
                                    onChange={this.handleChange}
                                    value="RENT_COLONIES_FOR_POLLINATION"
                                />
                                Rent colonies for pollination
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income_sell_honey"
                                    checked={income_sell_honey}
                                    onChange={this.handleChange}
                                    value="SELL_HONEY"
                                />
                                Sell honey
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income_sell_nucs"
                                    checked={income_sell_nucs}
                                    onChange={this.handleChange}
                                    value="SELL_NUCS_PACKAGES"
                                />
                                Sell nucs packages
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income_sell_queens"
                                    checked={income_sell_queens}
                                    onChange={this.handleChange}
                                    value="SELL_QUEENS"
                                />
                                Sell queens
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income_none"
                                    checked={income_none}
                                    onChange={this.handleChange}
                                    value="NO_INCOME"
                                />
                                No income
                            </div>
                            <div className="form__group">
                                <label htmlFor="practice">
                                    What best describes your beekeeping practice?
                                </label>
                                <select
                                    type="text"
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
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="varroa_management"
                                    checked={varroa_management}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="varroa_management_trigger">
                                    How do you decide when to manage for Varroa?
                                </label>
                                <input
                                    type="text"
                                    className="form__control"
                                    name="varroa_management_trigger"
                                    value={varroa_management_trigger}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="purchased_queens">
                                    Do you buy queens, nucs or packages?
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="purchased_queens"
                                    value={purchased_queens}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="purchased_queens_sources">
                                    From what state(s) did your purchased bees originate?
                                </label>
                                <input
                                    type="text"
                                    className="form__control"
                                    name="purchased_queens_sources"
                                    value={purchased_queens_sources}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="resistant_queens">
                                Do you use Varroa-resistant queens?
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="resistant_queens"
                                    value={resistant_queens}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="resistant_queens_genetics">
                                    Describe their genetics.
                                </label>
                                <input
                                    type="text"
                                    className="form__control"
                                    name="resistant_queens_genetics"
                                    value={resistant_queens_genetics}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="rear_queens">
                                    Do you rear queens?
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="rear_queens"
                                    value={rear_queens}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="equipment">
                                    What kind of equipment do you use? Check all that apply.
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="equipment_8_frame"
                                    checked={equipment_8_frame}
                                    onChange={this.handleChange}
                                    value="8_FRAME_LANGSTROTH"
                                />
                                8 frame langstroth
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="equipment_10_frame"
                                    checked={equipment_10_frame}
                                    onChange={this.handleChange}
                                    value="10_FRAME_LANGSTROTH"
                                />
                                10 frame langstroth
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="equipment_top_bar"
                                    checked={equipment_top_bar}
                                    onChange={this.handleChange}
                                    value="TOP_BAR"
                                />
                                Top bar
                                <br />
                                <input
                                    type="text"
                                    className="form__control"
                                    name="equipment_other"
                                    value={equipment_other}
                                    onChange={this.handleChange}
                                />
                                Other
                                <br />
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
