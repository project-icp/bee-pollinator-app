import React from 'react';
import { func } from 'prop-types';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import ParticipateModal from './components/ParticipateModal';

import { login } from './actions';

class App extends React.Component {
    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(login());
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
    };
}

App.propTypes = {
    dispatch: func.isRequired,
};

export default hot(module)(connect(mapStateToProps)(App));
