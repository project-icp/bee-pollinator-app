import React from 'react';
import { arrayOf, func } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';
import { setForageRange, setSort } from '../actions';

import ApiaryCard from './ApiaryCard';
import DropdownSelector from './DropdownSelector';
import Splash from './Splash';

const Sidebar = ({ apiaries, dispatch }) => {
    if (apiaries.length === 0) {
        return <Splash />;
    }

    const apiaryCards = apiaries.map((apiary, idx) => {
        // TODO: Replace unique key generator once app uses real, complete data
        // Currently solution appeases React unique key error
        const key = String.fromCharCode(idx);
        return <ApiaryCard key={key} apiary={apiary} />;
    });

    const onSelectForageRange = (selection) => {
        dispatch(setForageRange(selection.target.value));
    };

    return (
        <div className="sidebar">
            <h2 className="sidebar__header">Locations</h2>
            <div className="controls">
                <DropdownSelector
                    title="Forage Range:"
                    options={['1', '2', '3']}
                    onOptionClick={onSelectForageRange}
                />
                <DropdownSelector
                    title="Sort:"
                    options={['6', '7', '11']}
                    onOptionClick={setSort}
                />
            </div>
            <ul className="card-container">
                {apiaryCards}
            </ul>
        </div>
    );
};

Sidebar.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
    dispatch: func.isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(Sidebar);
