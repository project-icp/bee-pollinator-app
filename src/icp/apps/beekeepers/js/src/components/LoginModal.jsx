import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import {
    closeLoginModal,
    openSignUpModal,
    login,
    clearAuthError,
    openEmailFormModal,
} from '../actions';


class LoginModal extends Component {
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
            authError,
            isLoginModalOpen,
            dispatch,
        } = this.props;

        const {
            username,
            password,
        } = this.state;

        const errorWarning = authError ? (
            <div className="form__group--error">
                {authError}
            </div>
        ) : null;

        return (
            <Popup
                open={isLoginModalOpen}
                onClose={() => {
                    dispatch(clearAuthError());
                    dispatch(closeLoginModal());
                }}
                modal
            >
                {close => (
                    <div className="authModal">
                        <div className="authModal__header">
                            <div>Log in</div>
                            <button type="button" className="button" onClick={close}>
                                &times;
                            </button>
                        </div>
                        <div className="authModal__content">
                            <div className="title">Log in to your account</div>
                            <form className="form" onSubmit={this.handleSubmit}>
                                {errorWarning}
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
                                    Log in
                                </button>
                            </form>
                        </div>
                        <div className="authModal__footer">
                            <span>
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => {
                                        close();
                                        dispatch(openEmailFormModal());
                                    }}
                                >
                                    Forgot password
                                </button>
                                &#9900;
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => {
                                        close();
                                        dispatch(openEmailFormModal());
                                    }}
                                >
                                    Resend activation link
                                </button>
                                &#9900;
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => {
                                        close();
                                        dispatch(openSignUpModal());
                                    }}
                                >
                                    I need to sign up
                                </button>
                            </span>
                        </div>
                    </div>
                )}
            </Popup>
        );
    }
}

function mapStateToProps(state) {
    return {
        isLoginModalOpen: state.main.isLoginModalOpen,
        dispatch: state.main.dispatch,
        authError: state.auth.authError,
    };
}

LoginModal.propTypes = {
    isLoginModalOpen: bool.isRequired,
    dispatch: func.isRequired,
    authError: string.isRequired,
};

export default connect(mapStateToProps)(LoginModal);
