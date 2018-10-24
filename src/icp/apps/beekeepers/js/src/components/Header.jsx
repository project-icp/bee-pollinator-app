import React from 'react';

export default () => (
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
                    <button type="button" className="navbar__button">
                        Account
                    </button>
                </li>
            </ul>
        </div>
    </header>
);
