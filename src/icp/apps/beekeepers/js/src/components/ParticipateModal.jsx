import React from 'react';
import { bool, func } from 'prop-types';
import Popup from 'reactjs-popup';
import { connect } from 'react-redux';

import { closeParticipateModal, openSignUpModal, openLoginModal } from '../actions';


const ParticipateModal = ({ isParticipateModalOpen, dispatch }) => (
    <Popup
        open={isParticipateModalOpen}
        onClose={() => dispatch(closeParticipateModal())}
        className="modal"
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
                    <div className="title">
                        Help us see the world as a bee!
                    </div>
                    Our goal is to give beekeepers, gardeners, and growers detailed information
                    about the quality of their landscapes for bees, and site-specific
                    recommendations for land and bee management practices. But, to do this, we
                    need your help, so we can have data from many diverse landscapes! If you
                    have a wild bee hotel and would like to participate in our study, please
                    click here. If you are a beekeeper, please follow the link below.
                </div>
                <div className="authModal__footer">
                    <button
                        type="button"
                        className="button--long"
                        onClick={() => {
                            close();
                            dispatch(openSignUpModal());
                        }}
                    >
                        I want to participate
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

ParticipateModal.propTypes = {
    isParticipateModalOpen: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(ParticipateModal);
