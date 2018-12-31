import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeSignUpModal, openLoginModal, signUp } from '../actions';
import { toFormData } from '../utils';


class SignUpModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password1: '',
            password2: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange({ currentTarget: { name, value } }) {
        this.setState({ [name]: value });
    }

    handleSubmit(event) {
        const { dispatch } = this.props;
        dispatch(signUp(toFormData(this.state)));
        event.preventDefault();
    }

    render() {
        const { isSignUpModalOpen, dispatch, authError } = this.props;
        const {
            email,
            username,
            password1,
            password2,
        } = this.state;

        const errorWarning = authError ? (
            <div className="form__group--error">
                {authError}
            </div>
        ) : null;

        return (
            <Popup open={isSignUpModalOpen} onClose={() => dispatch(closeSignUpModal())} modal>
                {close => (
                    <div className="authModal">
                        <div className="authModal__header">
                            <div>Participate in study</div>
                            <button type="button" className="button" onClick={close}>
                                &times;
                            </button>
                        </div>
                        <div className="authModal__content">
                            <div className="title">Sign up for the study</div>
                            <form className="form" onSubmit={this.handleSubmit}>
                                {errorWarning}
                                <div className="form__group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={this.handleChange}
                                        className="form__control"
                                        required
                                    />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={username}
                                        onChange={this.handleChange}
                                        className="form__control"
                                        required
                                    />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="password1">Password</label>
                                    <input
                                        type="password"
                                        className="form__control"
                                        name="password1"
                                        value={password1}
                                        onChange={this.handleChange}
                                        required
                                    />
                                </div>
                                <div className="form__group">
                                    <label htmlFor="password2">Repeat Password</label>
                                    <input
                                        type="password"
                                        className="form__control"
                                        name="password2"
                                        value={password2}
                                        onChange={this.handleChange}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    value="Submit"
                                    className="button--long"
                                >
                                    Sign Up
                                </button>
                            </form>
                        </div>
                        <div className="authModal__footer">
                            <span>
                                Already a participant?
                                <button
                                    type="button"
                                    className="button"
                                    onClick={() => {
                                        close();
                                        dispatch(openLoginModal());
                                    }}
                                >
                                    Log in
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
        isSignUpModalOpen: state.main.isSignUpModalOpen,
        dispatch: state.main.dispatch,
        authError: state.auth.authError,
    };
}

SignUpModal.propTypes = {
    isSignUpModalOpen: bool.isRequired,
    dispatch: func.isRequired,
    authError: string.isRequired,
};

export default connect(mapStateToProps)(SignUpModal);
