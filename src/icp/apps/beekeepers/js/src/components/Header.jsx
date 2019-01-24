import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { func, string, bool } from 'prop-types';

import {
    openParticipateModal,
    openLoginModal,
    logout,
} from '../actions';

const Header = ({ dispatch, username, isStaff }) => {
    const makeExportDataButton = srOnly => (
        <a
            rel="noopener noreferrer"
            className={`navbar__link ${srOnly ? 'sr-only' : ''}`}
            href="/beekeepers/export/"
        >
            Export Survey Data
        </a>
    );

    const exportDataButton = isStaff
        ? (
            <li>
                {makeExportDataButton()}
            </li>
        ) : null;

    const exportDataButtonForScreenReader = isStaff
        ? makeExportDataButton(true) : null;

    const makeLogOutButton = srOnly => (
        <button
            type="button"
            className={`navbar__button ${srOnly ? 'sr-only' : ''}`}
            onClick={() => dispatch(logout())}
        >
            Log Out
        </button>
    );

    const authButtons = username
        ? (
            <li className="navbar__item navbar__item--user">
                <button
                    type="button"
                    className="navbar__button"
                >
                    {username}
                    ▾
                </button>
                {/* Hidden buttons for screen readers */}
                {exportDataButtonForScreenReader}
                {makeLogOutButton(true)}
                <ul className="navbar__options">
                    {exportDataButton}
                    <li>
                        {makeLogOutButton()}
                    </li>
                </ul>
            </li>
        )
        : (
            <>
                <li className="navbar__item">
                    <button
                        type="button"
                        className="navbar__button"
                        onClick={() => dispatch(openLoginModal())}
                    >
                        Log in
                    </button>
                </li>
                <li className="navbar__item">
                    <button
                        type="button"
                        className="navbar__button--auth"
                        onClick={() => dispatch(openParticipateModal())}
                    >
                            Participate in study
                    </button>
                </li>
            </>
        );

    return (
        <header className="header">
            <div className="navbar">
                <div className="navbar__logo">
                    Landscape4Bees
                    <NavLink exact to="/" className="navbar__item">Location finder</NavLink>
                    <NavLink to="/survey" className="navbar__item">Survey</NavLink>
                </div>
                <ul className="navbar__items">
                    <li className="navbar__item">
                        <button type="button" className="navbar__button">
                            About
                        </button>
                    </li>
                    <li className="navbar__item">
                        <button type="button" className="navbar__button">
                            Methodology
                        </button>
                    </li>
                    {authButtons}
                </ul>
            </div>
        </header>
    );
};

function mapStateToProps(state) {
    return state.auth;
}

Header.propTypes = {
    dispatch: func.isRequired,
    username: string.isRequired,
    isStaff: bool.isRequired,
};

export default withRouter(connect(mapStateToProps)(Header));
