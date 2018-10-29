import React from 'react';
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

export default hot(module)(App);
