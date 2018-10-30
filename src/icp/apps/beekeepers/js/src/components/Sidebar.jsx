import React from 'react';
import { arrayOf } from 'prop-types';
import { connect } from 'react-redux';

import { Apiary } from '../propTypes';

import Splash from './Splash';
import Prototype from './Prototype';

const Sidebar = ({ apiaries }) => (
    apiaries.length > 0
        ? <Prototype />
        : <Splash />
);

Sidebar.propTypes = {
    apiaries: arrayOf(Apiary).isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(Sidebar);
