import React from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeLoginModal, openSignUpModal, login } from '../actions';
import { parseFormToObject } from '../utils';


const LoginModal = ({ isLoginModalOpen, dispatch }) => {
    const submitForm = (event) => {
        // Send form data to backend for validation and prevent modal from closing
        dispatch(login(parseFormToObject(event)));
        event.preventDefault();
    };

    return (
        <Popup open={isLoginModalOpen} onClose={() => dispatch(closeLoginModal())} modal>
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
                        <form className="form" onSubmit={submitForm}>
                            <div className="form__group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="username"
                                    name="username"
                                    className="form__control"
                                />
                            </div>
                            <div className="form__group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    className="form__control"
                                    name="password"
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
                                onClick={close}
                            >
                                I forgot my password
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
};

function mapStateToProps(state) {
    return state.main;
}

LoginModal.propTypes = {
    isLoginModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(LoginModal);
