import React from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import { openSignUpModal } from '../actions';


const GuestSurveyView = ({ dispatch }) => (
    <div className="survey empty">
        <div className="survey__header empty">
            Help us see the world as a bee!
        </div>
        <div className="survey__body">
            <div>
                Our goal is to give beekeepers, gardeners, and growers detailed information about
                the quality of their landscapes for bees, and site-specific recommendations for
                land and bee management practices. But, to do this, we need your help, so we can
                have data from many diverse landscapes!
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
