import React from 'react';
import { connect } from 'react-redux';
import { func, string } from 'prop-types';

import { openParticipateModal, openLoginModal } from '../actions';

const Header = ({ dispatch, username }) => {
    const authButtons = username
        ? (
            <li className="navbar__item">
                <button
                    type="button"
                    className="navbar__button"
                >
                    {username}
                </button>
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
};

export default connect(mapStateToProps)(Header);
