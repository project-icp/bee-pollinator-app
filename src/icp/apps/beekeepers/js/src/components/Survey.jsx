import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { arrayOf, number, func } from 'prop-types';
import { Apiary } from '../propTypes';

import { openSignUpModal } from '../actions';

const Survey = ({ dispatch, userId, apiaries }) => {
    if (!userId) {
        return (
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
    }

    if (apiaries.length === 0) {
        return (
            <div className="survey empty">
                <div className="survey__header empty">
                    Add locations of interest
                </div>
                <div className="survey__body">
                    <div>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat.
                    </div>
                    <Link to="/" className="survey__button">Go to location finder</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="survey">
            <div className="survey__header">
                Survey
            </div>
            <div className="survey__body">
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
                <div className="survey__body--section">
                    Response needed
                </div>
                <div className="survey__body--section">
                    Up to date
                </div>
                <div className="survey__body--section">
                    This is not in the study
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        dispatch: state.main.dispatch,
        userId: state.auth.userId,
        apiaries: state.main.apiaries,
    };
}

Survey.propTypes = {
    dispatch: func.isRequired,
    userId: number,
    apiaries: arrayOf(Apiary).isRequired,
};

Survey.defaultProps = {
    userId: null,
};

export default connect(mapStateToProps)(Survey);
