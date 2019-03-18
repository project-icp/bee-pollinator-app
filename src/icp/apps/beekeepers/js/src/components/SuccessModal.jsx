import React from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeSuccessModal } from '../actions';

const SuccessModal = ({ dispatch, isSuccessModalOpen }) => (
    <Popup
        open={isSuccessModalOpen}
        onClose={() => dispatch(closeSuccessModal())}
        className="modal"
        modal
    >
        {close => (
            <div className="authModal">
                <div className="authModal__header">
                    Thank You
                    <button type="button" className="button" onClick={close}>
                        &times;
                    </button>
                </div>
                <div className="authModal__content">
                    Your response has been saved.
                </div>
            </div>
        )}
    </Popup>
);

function mapStateToProps(state) {
    return {
        isSuccessModalOpen: state.main.isSuccessModalOpen,
        dispatch: state.main.dispatch,
    };
}

SuccessModal.propTypes = {
    isSuccessModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(SuccessModal);
