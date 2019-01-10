import React, { Component } from 'react';
import { bool, func, string } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import {
    closeEmailFormModal,
    openLoginModal,
    resendActivationLink,
} from '../actions';


class EmailFormModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange({ currentTarget: { name, value } }) {
        this.setState({ [name]: value });
    }

    render() {
        const {
            isEmailFormModalOpen,
            dispatch,
            authError,
            message,
        } = this.props;
        const {
            email,
        } = this.state;

        const errorWarning = authError ? (
            <div className="form__group--error">
                {authError}
            </div>
        ) : null;

        const userMessage = message ? (
            <div className="form__group--error">
                {message}
            </div>
        ) : null;

        return (
            <Popup
                open={isEmailFormModalOpen}
                onClose={() => dispatch(closeEmailFormModal())}
                modal
            >
                {close => (
                    <div className="authModal">
                        <div className="authModal__header">
                            <div>Participate in study</div>
                            <button type="button" className="button" onClick={close}>
                                &times;
                            </button>
                        </div>
                        <div className="authModal__content">
                            <div className="title">Enter your email</div>
                            <form className="form">
                                {userMessage}
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
                                <button
                                    type="button"
                                    className="button--long"
                                    onClick={() => dispatch(resendActivationLink(this.state))}
                                >
                                    Resend activation link
                                </button>
                                <button
                                    type="button"
                                    className="button--long"
                                >
                                    Forgot password
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
        isEmailFormModalOpen: state.main.isEmailFormModalOpen,
        dispatch: state.main.dispatch,
        message: state.auth.message,
        authError: state.auth.authError,
    };
}

EmailFormModal.propTypes = {
    isEmailFormModalOpen: bool.isRequired,
    dispatch: func.isRequired,
    message: string.isRequired,
    authError: string.isRequired,
};

export default connect(mapStateToProps)(EmailFormModal);
