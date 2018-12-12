import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { func, number } from 'prop-types';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';

import Map from './components/Map';
import Sidebar from './components/Sidebar';

import { login, fetchUserApiaries } from './actions';
import Survey from './Survey';

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
        const locationFinder = () => (
            <>
                <Map />
                <Sidebar />
            </>
        );
        return (
            <Switch>
                <Route exact path="/" component={locationFinder} />
                <Route path="/survey" component={Survey} />
            </Switch>
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
