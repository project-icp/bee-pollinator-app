import React from 'react';
import { func, number } from 'prop-types';
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
import EmailFormModal from './components/EmailFormModal';

import { UserSurvey } from './propTypes';
import { login, saveAndFetchApiaries, openUserSurveyModal } from './actions';

class App extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(login());
    }

    componentDidUpdate(prevProps) {
        const { dispatch, userId, userSurvey } = this.props;

        if (userId && userId !== prevProps.userId) {
            dispatch(saveAndFetchApiaries());

            if (!userSurvey) {
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
                    <EmailFormModal />
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
    userSurvey: UserSurvey,
};

App.defaultProps = {
    userId: null,
    userSurvey: null,
};

export default hot(module)(connect(mapStateToProps)(App));
