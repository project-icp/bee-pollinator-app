import React from 'react';
import { hot } from 'react-hot-loader';

import Header from './components/Header';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';

const App = () => (
    <>
        <Header />
        <main>
            <SignUpModal />
            <LoginModal />
            <Map />
            <Sidebar />
        </main>
    </>
);

export default hot(module)(App);
