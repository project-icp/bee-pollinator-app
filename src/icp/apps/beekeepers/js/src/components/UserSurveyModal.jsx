import React, { Component } from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeUserSurveyModal, login } from '../actions';

class UserSurveyModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // each form input corresponds to a state var
            username: '',
            password: '',
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
            username,
            password,
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
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={this.handleChange}
                                    className="form__control"
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    className="form__control"
                                    name="password"
                                    value={password}
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
    return state.main;
}

UserSurveyModal.propTypes = {
    isUserSurveyModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(UserSurveyModal);
