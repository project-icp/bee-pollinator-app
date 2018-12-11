import React from 'react';
import { hot } from 'react-hot-loader';

import Header from './components/Header';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import ParticipateModal from './components/ParticipateModal';

const Survey = () => (
    <>
        <Header />
        <main>
            <ParticipateModal />
            <SignUpModal />
            <LoginModal />
        </main>
    </>
);

export default hot(module)(Survey);
