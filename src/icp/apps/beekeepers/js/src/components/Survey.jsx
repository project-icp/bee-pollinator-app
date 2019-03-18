import React from 'react';
import { connect } from 'react-redux';

import { arrayOf, number, string } from 'prop-types';
import { Apiary } from '../propTypes';
import { CONTRIBUTION_LEVEL_PRO } from '../constants';

import GuestSurveyView from './GuestSurveyView';
import EmptySurveyView from './EmptySurveyView';
import SurveyView from './SurveyView';

const Survey = ({ userId, apiaries, contributionLevel }) => {
    if (!userId) {
        return <GuestSurveyView />;
    }

    if (apiaries.length === 0) {
        return <EmptySurveyView />;
    }

    return (
        <SurveyView
            apiaries={apiaries}
            isProUser={contributionLevel === CONTRIBUTION_LEVEL_PRO}
        />
    );
};

function mapStateToProps(state) {
    return {
        userId: state.auth.userId,
        apiaries: state.main.apiaries,
        contributionLevel: state.auth.userSurvey
            && state.auth.userSurvey.contribution_level,
    };
}

Survey.propTypes = {
    userId: number,
    apiaries: arrayOf(Apiary).isRequired,
    contributionLevel: string,
};

Survey.defaultProps = {
    userId: null,
    contributionLevel: null,
};

export default connect(mapStateToProps)(Survey);
