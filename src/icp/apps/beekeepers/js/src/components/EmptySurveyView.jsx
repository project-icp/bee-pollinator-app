import React from 'react';
import { Link } from 'react-router-dom';


export default function () {
    return (
        <div className="survey empty">
            <div className="survey__header empty">
                Add locations of interest
            </div>
            <div className="survey__body">
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                    minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                </div>
                <Link to="/" className="survey__button">Go to location finder</Link>
            </div>
        </div>
    );
}
