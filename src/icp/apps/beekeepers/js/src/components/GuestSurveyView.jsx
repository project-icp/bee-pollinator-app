import React from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import { openSignUpModal } from '../actions';


const GuestSurveyView = ({ dispatch }) => (
    <div className="survey empty">
        <div className="survey__header empty">
            Sign up to participate in our study to get better info about hive locations
        </div>
        <div className="survey__body">
            <div>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat.
            </div>
            <button
                type="button"
                className="survey__button"
                onClick={() => dispatch(openSignUpModal())}
            >
                Sign up
            </button>
        </div>
    </div>
);

function mapStateToProps(state) {
    return state.main;
}

GuestSurveyView.propTypes = {
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(GuestSurveyView);
