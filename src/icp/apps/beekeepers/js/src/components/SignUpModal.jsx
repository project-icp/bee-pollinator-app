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
                    <button type="button" className="button" onClick={close}>
                        &times;
                    </button>
                </div>
                <div className="authModal__content">
                    <div className="title">Sign up for the study</div>
                </div>
                <div className="authModal__footer">
                    <button
                        type="button"
                        className="button--long"
                        onClick={close}
                    >
                        Sign up
                    </button>
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

function mapStateToProps(state) {
    return state.main;
}

SignUpModal.propTypes = {
    isSignUpModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(SignUpModal);
