import React from 'react';
import { func, number, bool } from 'prop-types';
import { hot } from 'react-hot-loader';
import {
    Switch,
    Route,
} from 'react-router-dom';
import { connect } from 'react-redux';

import Map from './components/Map';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Survey from './components/Survey';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import ParticipateModal from './components/ParticipateModal';
import UserSurveyModal from './components/UserSurveyModal';

import { login, fetchUserApiaries, openUserSurveyModal } from './actions';

class App extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(login());
    }

    componentDidUpdate(prevProps) {
        const { dispatch, userId, userSurvey } = this.props;

        if (userId && userId !== prevProps.userId) {
            if (userSurvey) {
                dispatch(fetchUserApiaries());
            } else {
                dispatch(openUserSurveyModal());
            }
        }
    }

    render() {
        const locationFinder = () => (
            <>
                <Map />
                <Sidebar />
            </>
        );
        return (
            <>
                <Header />
                <main>
                    <UserSurveyModal />
                    <ParticipateModal />
                    <SignUpModal />
                    <LoginModal />
                    <Switch>
                        <Route path="/survey" component={Survey} />
                        <Route render={locationFinder} />
                    </Switch>
                </main>
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        dispatch: state.main.dispatch,
        userId: state.auth.userId,
        userSurvey: state.auth.userSurvey,
    };
}

App.propTypes = {
    dispatch: func.isRequired,
    userId: number,
    userSurvey: bool,
};

App.defaultProps = {
    userId: null,
    userSurvey: false,
};

export default hot(module)(connect(mapStateToProps)(App));
