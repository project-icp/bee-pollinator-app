import React from 'react';
import { connect } from 'react-redux';

import { arrayOf, number } from 'prop-types';
import { Apiary } from '../propTypes';

import GuestSurveyView from './GuestSurveyView';
import EmptySurveyView from './EmptySurveyView';
import SurveyView from './SurveyView';

const Survey = ({ userId, apiaries }) => {
    if (!userId) {
        return <GuestSurveyView />;
    }

    if (apiaries.length === 0) {
        return <EmptySurveyView />;
    }

    return <SurveyView apiaries={apiaries} />;
};

function mapStateToProps(state) {
    return {
        userId: state.auth.userId,
        apiaries: state.main.apiaries,
    };
}

Survey.propTypes = {
    userId: number,
    apiaries: arrayOf(Apiary).isRequired,
};

Survey.defaultProps = {
    userId: null,
};

export default connect(mapStateToProps)(Survey);
