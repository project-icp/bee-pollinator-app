import React from 'react';
import { arrayOf } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';

import ApiaryCard from './ApiaryCard';
import Splash from './Splash';

const Sidebar = ({ apiaries }) => {
    if (apiaries.length === 0) {
        return <Splash />;
    }

    const apiaryCards = apiaries.map((apiary, idx) => {
        const key = String.fromCharCode(idx);
        return <ApiaryCard key={key} apiary={apiary} />;
    });

    return (
        <div className="sidebar">
            <h2 className="sidebar__header">Locations</h2>
            <div className="controls">
                {/* TODO Implement Forage Range, Sort selectors
                    https://github.com/project-icp/bee-pollinator-app/issues/316 */}
                <div className="controls__select">
                    <select>
                        <option value="one">one</option>
                        <option value="two">two</option>
                        <option value="three">three</option>
                    </select>
                </div>
                <div className="controls__select">
                    <select>
                        <option value="one">one</option>
                        <option value="two">two</option>
                        <option value="three">three</option>
                    </select>
                </div>
            </div>
            <ul className="card-container">
                {apiaryCards}
            </ul>
        </div>
    );
};

Sidebar.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(Sidebar);
