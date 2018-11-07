import React from 'react';
import { arrayOf, func } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';
import { setForageRange, setSort } from '../actions';
import { FORAGE_RANGES, SORT_OPTIONS } from '../constants';

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

    const onSelectSort = (selection) => {
        dispatch(setSort(selection.target.value));
    };

    const onSelectForageRange = (selection) => {
        dispatch(setForageRange(selection.target.value));
    };

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <h2>Locations</h2>
                <div className="sidebar__header__controls">
                    <DropdownSelector
                        title="Sort by:"
                        options={SORT_OPTIONS}
                        onOptionClick={onSelectSort}
                    />
                    <DropdownSelector
                        title="Forage range:"
                        options={Object.keys(FORAGE_RANGES)}
                        onOptionClick={onSelectForageRange}
                    />
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
    dispatch: func.isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(Sidebar);
