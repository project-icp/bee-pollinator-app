import React from 'react';
import { func, number } from 'prop-types';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import ParticipateModal from './components/ParticipateModal';

import { login, fetchUserApiaries } from './actions';

class App extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(login());
    }

    componentDidUpdate(prevProps) {
        const { dispatch, userId } = this.props;

        if (userId && userId !== prevProps.userId) {
            dispatch(fetchUserApiaries());
        }
    }

    render() {
        return (
            <>
                <Header />
                <main>
                    <ParticipateModal />
                    <SignUpModal />
                    <LoginModal />
                    <Map />
                    <Sidebar />
                </main>
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        dispatch: state.main.dispatch,
        userId: state.auth.userId,
    };
}

App.propTypes = {
    dispatch: func.isRequired,
    userId: number,
};

App.defaultProps = {
    userId: null,
};

export default hot(module)(connect(mapStateToProps)(App));
