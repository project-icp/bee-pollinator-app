import React from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeLoginModal, openSignUpModal } from '../actions';


const LoginModal = ({ isLoginModalOpen, dispatch }) => (
    <Popup open={isLoginModalOpen} onClose={() => dispatch(closeLoginModal())} modal>
        {close => (
            <div className="authModal">
                <div className="authModal__header">
                    <div>Log in to your account</div>
                    <button type="button" onClick={close}>
                        &times;
                    </button>
                </div>
                <div className="authModal__content">
                    <div className="title">Sign up for the study</div>
                </div>
                <button
                    type="button"
                    className="button"
                    onClick={close}
                >
                    I forgot my password
                </button>
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
            </div>
        )}
    </Popup>
);

function mapStateToProps(state) {
    return state.main;
}

LoginModal.propTypes = {
    isLoginModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(LoginModal);
