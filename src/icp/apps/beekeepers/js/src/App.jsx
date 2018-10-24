import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';

import Header from './components/Header';
import Prototype from './components/Prototype';

const App = () => (
    <Fragment>
        <Header />
        <Prototype />
    </Fragment>
);

function mapStateToProps(state) {
    return state;
}

const hotApp = hot(module)(App);
export default connect(mapStateToProps)(hotApp);
