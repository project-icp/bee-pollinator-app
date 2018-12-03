import React from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeSignUpModal, openLoginModal } from '../actions';


const SignUpModal = ({ isSignUpModalOpen, dispatch }) => (
    <Popup open={isSignUpModalOpen} onClose={() => dispatch(closeSignUpModal())} modal>
        {close => (
            <div className="authModal">
                <div className="authModal__header">
                    <div>Participate in study</div>
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
                    Sign up
                </button>
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
            </div>
        )}
    </Popup>
);

function mapStateToProps(state) {
    return state.main;
}

SignUpModal.propTypes = {
    isSignUpModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(SignUpModal);
