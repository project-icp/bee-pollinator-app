import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeUserSurveyModal, login } from '../actions';

/* eslint-disable camelcase */
class UserSurveyModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // each form input corresponds to a state var
            contribution_level: '',
            phone: '',
            preferred_contact: '',
            year_began: '',
            organization: '',
            total_colonies: '',
            relocate: '',
            income: '',
            practice: '',
            varroa_management: '',
            varroa_management_trigger: '',
            purchased_queens: '',
            purchased_queens_sources: '',
            resistant_queens: '',
            resistant_queens_genetics: '',
            rear_queens: '',
            equipment: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.currentTarget.name]: event.currentTarget.value });
    }

    handleSubmit(event) {
        // Send form data to backend for validation and prevent modal from closing
        const {
            dispatch,
        } = this.props;
        dispatch(login(this.state));
        event.preventDefault();
    }

    render() {
        const {
            isUserSurveyModalOpen,
            dispatch,
        } = this.props;

        const {
            contribution_level,
            phone,
            preferred_contact,
            year_began,
            organization,
            total_colonies,
            relocate,
            income,
            practice,
            varroa_management,
            varroa_management_trigger,
            purchased_queens,
            purchased_queens_sources,
            resistant_queens,
            resistant_queens_genetics,
            rear_queens,
            equipment,
        } = this.state;

        return (
            <Popup
                open={isUserSurveyModalOpen}
                onClose={() => dispatch(closeUserSurveyModal())}
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
                        <form className="form">
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
                                    value={relocate}
                                    onChange={this.handleChange}
                                />
                            </div>
                            {/* TODO: fix the data capture for multi choice */}
                            <div className="form__group">
                                <label htmlFor="income">
                                    Do you obtain income from your bees?
                                    What do you receive income from?
                                    Check all that apply.
                                </label>
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income"
                                    value={income}
                                    onChange={this.handleChange}
                                />
                                RENT_COLONIES_FOR_POLLINATION
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income"
                                    value={income}
                                    onChange={this.handleChange}
                                />
                                SELL_HONEY
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income"
                                    value={income}
                                    onChange={this.handleChange}
                                />
                                SELL_NUCS_PACKAGES
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income"
                                    value={income}
                                    onChange={this.handleChange}
                                />
                                SELL_QUEENS
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="income"
                                    value={income}
                                    onChange={this.handleChange}
                                />
                                NO_INCOME
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
                                    value={varroa_management}
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
                                    From what state(s) did your purhcased bees originate?
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
                                    name="equipment"
                                    value={equipment}
                                    onChange={this.handleChange}
                                />
                                8_FRAME_LANGSTROTH
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="equipment"
                                    value={equipment}
                                    onChange={this.handleChange}
                                />
                                10_FRAME_LANGSTROTH
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="equipment"
                                    value={equipment}
                                    onChange={this.handleChange}
                                />
                                TOP_BAR
                                <br />
                                <input
                                    type="checkbox"
                                    className="form__control"
                                    name="equipment"
                                    value={equipment}
                                    onChange={this.handleChange}
                                />
                                OTHER
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
    return state.main;
}

UserSurveyModal.propTypes = {
    isUserSurveyModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(UserSurveyModal);
