import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bool, func, string } from 'prop-types';
import Control from 'react-leaflet-control';

import { showCropLayer, hideCropLayer } from '../actions';


class CropLayerControl extends Component {
    constructor() {
        super();
        this.toggleCropLayer = this.toggleCropLayer.bind(this);
    }

    componentDidMount() {
        this.forceUpdate();
    }

    toggleCropLayer() {
        const { isCropLayerActive, dispatch } = this.props;

        if (isCropLayerActive) {
            dispatch(hideCropLayer());
        } else {
            dispatch(showCropLayer());
        }
    }

    render() {
        const { position, isCropLayerActive } = this.props;
        const slider = !isCropLayerActive ? null : (
            <input
                title="Drag to change opacity of overlay"
                type="range"
                min="0"
                max="99"
                step="3"
                className="layercontrol__slider"
                value="50"
            />
        );

        return (
            <Control
                className="layercontrol leaflet-bar"
                position={position}
            >
                <button
                    type="button"
                    className="layercontrol__button"
                    onClick={this.toggleCropLayer}
                >
                    <i className="icon-layers" />
                </button>
                {slider}
            </Control>
        );
    }
}

function mapStateToProps(state) {
    return state.main;
}

CropLayerControl.propTypes = {
    position: string.isRequired,
    isCropLayerActive: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(CropLayerControl);
