import React from 'react';
import { arrayOf, func, string } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';
import { setForageRange, setSort } from '../actions';
import { FORAGE_RANGES, SORT_OPTIONS, DEFAULT_SORT } from '../constants';

import ApiaryCard from './ApiaryCard';
import DropdownSelector from './DropdownSelector';
import Splash from './Splash';

const Sidebar = ({
    apiaries,
    dispatch,
    sortBy,
    forageRange,
}) => {
    if (apiaries.length === 0) {
        return <Splash />;
    }

    let sortedApiaries;
    if (sortBy === DEFAULT_SORT) {
        sortedApiaries = apiaries.sort((a, b) => {
            if (a.marker < b.marker) { return -1; }
            if (a.marker > b.marker) { return 1; }
            return 0;
        });
    } else {
        sortedApiaries = apiaries.sort((a, b) => (
            b.scores[forageRange][sortBy].data - a.scores[forageRange][sortBy].data
        ));
    }

    const apiaryCards = sortedApiaries.map((apiary, idx) => {
        // TODO: Replace unique key generator once app uses real, complete data
        // Currently solution appeases React unique key error
        const key = String.fromCharCode(idx);
        return (
            <ApiaryCard
                key={key}
                apiary={apiary}
                forageRange={forageRange}
            />
        );
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
                <div className="sidebar__controls">
                    <DropdownSelector
                        title="Sort by:"
                        options={SORT_OPTIONS}
                        onOptionClick={onSelectSort}
                    />
                    <DropdownSelector
                        title="Forage range:"
                        options={FORAGE_RANGES}
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
    sortBy: string.isRequired,
    forageRange: string.isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(Sidebar);
