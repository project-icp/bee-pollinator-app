import React from 'react';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader';

import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';

const App = () => (
    <>
        <Header />
        <main>
            <Map />
            <Sidebar />
        </main>
    </>
);

function mapStateToProps(state) {
    return state;
}

const hotApp = hot(module)(App);
export default connect(mapStateToProps)(hotApp);
