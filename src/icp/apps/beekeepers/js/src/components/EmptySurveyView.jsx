import React from 'react';
import { Link } from 'react-router-dom';


export default function () {
    return (
        <div className="survey empty">
            <div className="survey__header empty">
                Add your apiaries
            </div>
            <div className="survey__body">
                <div>
                    Please drop a pin to locate your apiaries on the map. Then come back to this
                    page and select the apiaries that you want to include in the survey.
                </div>
                <Link to="/" className="survey__button">Go to location finder</Link>
            </div>
        </div>
    );
}
