import React from 'react';
import { connect } from 'react-redux';
import { func } from 'prop-types';

import { openParticipateModal } from '../actions';

const Header = ({ dispatch }) => (
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
                <li className="navbar__item">
                    <button
                        type="button"
                        className="navbar__button--auth"
                        onClick={() => dispatch(openParticipateModal())}
                    >
                            Participate in study
                    </button>
                </li>
            </ul>
        </div>
    </header>
);

function mapStateToProps(state) {
    return state.main;
}

Header.propTypes = {
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(Header);
