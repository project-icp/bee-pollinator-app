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
                    <div>Log in</div>
                    <button type="button" className="button" onClick={close}>
                        &times;
                    </button>
                </div>
                <div className="authModal__content">
                    <div className="title">Log in to your account</div>
                </div>
                <div className="authModal__footer">
                    <button
                        type="button"
                        className="button--long"
                        onClick={close}
                    >
                        Log in
                    </button>
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

function mapStateToProps(state) {
    return state.main;
}

LoginModal.propTypes = {
    isLoginModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(LoginModal);
