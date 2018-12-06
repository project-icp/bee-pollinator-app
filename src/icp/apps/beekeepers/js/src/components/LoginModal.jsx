import React from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeLoginModal, openSignUpModal, login } from '../actions';


const LoginModal = ({ isLoginModalOpen, dispatch }) => {
    const submitForm = (event) => {
        let form = {};
        let i;
        for (i = 0; i < event.currentTarget.elements.length; i += 1) {
            const inputValue = event.currentTarget.elements[i].value;
            const inputName = event.currentTarget.elements[i].name;
            const newElement = { [inputName]: inputValue };
            form = Object.assign(newElement, form);
        }
        dispatch(login(form));
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
