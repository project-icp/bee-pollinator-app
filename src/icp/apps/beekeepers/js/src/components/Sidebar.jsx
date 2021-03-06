import React, { Component } from 'react';
import { arrayOf, func, string } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';
import { setForageRange, setSort, fetchApiaryScores } from '../actions';
import { FORAGE_RANGES, SORT_OPTIONS, DEFAULT_SORT } from '../constants';

import ApiaryCard from './ApiaryCard';
import DropdownSelector from './DropdownSelector';
import Splash from './Splash';


class Sidebar extends Component {
    shouldComponentUpdate(nextProps) {
        const { apiaries, forageRange: nextForageRange } = nextProps;
        const { forageRange, dispatch } = this.props;

        if (forageRange !== nextForageRange) {
            const apiariesSansData = apiaries.filter(apiary => (
                !Object.keys(apiary.scores[nextForageRange]).length
            ));
            dispatch(fetchApiaryScores(apiariesSansData, nextForageRange));
        }

        return nextProps;
    }

    render() {
        const {
            apiaries: unsortedApiaries,
            forageRange,
            sortBy,
            dispatch,
        } = this.props;

        if (unsortedApiaries.length === 0) {
            return <Splash />;
        }

        // unsortedApiaries is in DEFAULT_SORT already, so can be used directly.
        // In other cases, we make a deep copy and sort that, so as not to alter
        // the redux state out of band.
        const apiaries = sortBy === DEFAULT_SORT
            ? unsortedApiaries
            : JSON.parse(JSON.stringify(unsortedApiaries)).sort((a, b) => {
                if (!b.scores[forageRange][sortBy] || !a.scores[forageRange][sortBy]) {
                    return 0;
                }
                return b.scores[forageRange][sortBy].data - a.scores[forageRange][sortBy].data;
            });

        const apiaryCards = apiaries.map(apiary => (
            <ApiaryCard
                key={apiary.marker}
                apiary={apiary}
                forageRange={forageRange}
            />
        ));

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
                            options={Object.entries(SORT_OPTIONS)}
                            onOptionClick={onSelectSort}
                        />
                        <DropdownSelector
                            title="Forage range:"
                            options={Object.entries(FORAGE_RANGES)}
                            onOptionClick={onSelectForageRange}
                        />
                    </div>
                </div>
                <ul className="card-container">
                    {apiaryCards}
                </ul>
            </div>
        );
    }
}

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
