import React from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';

import Header from './components/Header';
import Prototype from './components/Prototype';

const App = () => (
    <>
        <Header />
        <Prototype />
    </>
);

function mapStateToProps(state) {
    return state;
}

const hotApp = hot(module)(App);
export default connect(mapStateToProps)(hotApp);
