import React from 'react';
import { arrayOf, object } from 'prop-types';
import { connect } from 'react-redux';

import Splash from './Splash';
import Prototype from './Prototype';

const Sidebar = ({ apiaries }) => (
    apiaries.length > 0
        ? <Prototype />
        : <Splash />
);

Sidebar.propTypes = {
    // TODO Replace `object` with Apiary Shape
    apiaries: arrayOf(object).isRequired,
};

function mapStateToProps(state) {
    return state.main;
}

export default connect(mapStateToProps)(Sidebar);
