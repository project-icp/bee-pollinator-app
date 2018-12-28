import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    bool,
    func,
    number,
    string,
} from 'prop-types';
import Control from 'react-leaflet-control';

import { showCropLayer, hideCropLayer, setCropLayerOpacity } from '../actions';


class CropLayerControl extends Component {
    constructor() {
        super();
        this.toggleCropLayer = this.toggleCropLayer.bind(this);
        this.setOpacity = this.setOpacity.bind(this);
    }

    componentDidMount() {
        this.forceUpdate();
    }

    setOpacity(e) {
        const { dispatch } = this.props;

        dispatch(setCropLayerOpacity(Number(e.target.value)));
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
        const { position, cropLayerOpacity, isCropLayerActive } = this.props;
        const slider = !isCropLayerActive ? null : (
            <input
                title="Drag to change opacity of overlay"
                type="range"
                min={0.0}
                max={1.0}
                step={0.03}
                className="layercontrol__slider"
                defaultValue={cropLayerOpacity}
                onChange={this.setOpacity}
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
    cropLayerOpacity: number.isRequired,
    isCropLayerActive: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(CropLayerControl);
