import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    bool,
    func,
    number,
    string,
} from 'prop-types';
import Control from 'react-leaflet-control';

import cropTypes from '../cropTypes.json';

import { showCropLayer, hideCropLayer, setCropLayerOpacity } from '../actions';
import { sortByValue } from '../utils';


class CropLayerControl extends Component {
    constructor() {
        super();
        this.toggleCropLayer = this.toggleCropLayer.bind(this);
        this.setOpacity = this.setOpacity.bind(this);
        this.cropTypes = Object.entries(cropTypes);
        this.cropTypes.sort(sortByValue);
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
        const {
            position,
            cropLayerOpacity,
            isCropLayerActive,
            enableMapZoom,
            disableMapZoom,
        } = this.props;
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
        const legendItems = !isCropLayerActive
            ? []
            : this.cropTypes.map(([key, value]) => (
                <div className="legenditem" key={key}>
                    <span className={`legenditem__color crop-${key}`} />
                    {value}
                </div>
            ));
        const legend = !isCropLayerActive ? null : (
            <div
                className="layercontrol__legend"
                onMouseOver={disableMapZoom}
                onFocus={disableMapZoom}
                onMouseOut={enableMapZoom}
                onBlur={enableMapZoom}
            >
                {legendItems}
            </div>
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
                    <div className="layercontrol__button-text">
                        Crop layer
                    </div>
                </button>
                {slider}
                {legend}
            </Control>
        );
    }
}

function mapStateToProps(state) {
    return state.main;
}

CropLayerControl.propTypes = {
    position: string.isRequired,
    enableMapZoom: func.isRequired,
    disableMapZoom: func.isRequired,
    cropLayerOpacity: number.isRequired,
    isCropLayerActive: bool.isRequired,
    dispatch: func.isRequired,
};

export default connect(mapStateToProps)(CropLayerControl);
