import React from 'react';

export default function () {
    return (
        <div className="sidebar">
            <h2 className="sidebar__header">Locations</h2>
            <div className="controls">
                <div className="controls__select">
                    <select>
                        <option value="one">one</option>
                        <option value="two">two</option>
                        <option value="three">three</option>
                    </select>
                </div>
                <div className="controls__select">
                    <select>
                        <option value="one">one</option>
                        <option value="two">two</option>
                        <option value="three">three</option>
                    </select>
                </div>
                <div className="controls__display">
                    <h4 className="controls__header">Display</h4>
                    <div className="controls__checkboxes">
                        <label className="controls__label" htmlFor="benchmark">
                            <input className="controls__checkbox" type="checkbox" id="benchmark" />
                            Benchmark
                        </label>
                        <label className="controls__label" htmlFor="range">
                            <input className="controls__checkbox" type="checkbox" id="range" />
                            Range
                        </label>
                    </div>
                </div>
            </div>
            <ul className="card-container">
                <li className="card">
                    <div className="card__top">
                        <div className="card__identification">
                            <div className="card__name">
                                Benchmark:
                                <span className="card__benchmarklocation">
                                    Montana County
                                </span>
                            </div>
                        </div>
                        <div className="card__buttons" />
                    </div>
                    <div className="card__bottom">
                        <div className="indicator-container">
                            <div className="indicator indicator--hive-density">
                                <div className="indicator__number">65</div>
                                <div className="indicator__name">Hive&nbsp;Density</div>
                            </div>
                            <div className="indicator indicator--habitat">
                                <div className="indicator__number">49</div>
                                <div className="indicator__name">Habitat</div>
                            </div>
                            <div className="indicator indicator--pesticide">
                                <div className="indicator__number">55</div>
                                <div className="indicator__name">Pesticide</div>
                            </div>
                            <div className="indicator indicator--forage">
                                <div className="indicator__number">74</div>
                                <div className="indicator__name">Forage</div>
                            </div>
                            <div className="indicator indicator--overall">
                                <div className="indicator__number">46</div>
                                <div className="indicator__name">Overall</div>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="card">
                    <div className="card__top">
                        <div className="card__identification">
                            <div className="marker">D</div>
                            <div className="card__name">423 Waltz Road</div>
                        </div>
                        <div className="card__buttons">
                            <button type="button" className="card__button">
                                <i className="icon-star-outline" />
                            </button>
                            <button type="button" className="card__button">
                                <i className="icon-trash-fill" />
                            </button>
                        </div>
                    </div>
                    <div className="card__bottom">
                        <div className="indicator-container">
                            <div className="indicator indicator--hive-density">
                                <div className="indicator__number">65</div>
                                <div className="indicator__name">Hive&nbsp;Density</div>
                            </div>
                            <div className="indicator indicator--habitat">
                                <div className="indicator__number">36</div>
                                <div className="indicator__name">Habitat</div>
                            </div>
                            <div className="indicator indicator--pesticide">
                                <div className="indicator__number">5</div>
                                <div className="indicator__name">Pesticide</div>
                            </div>
                            <div className="indicator indicator--forage">
                                <div className="indicator__number">25</div>
                                <div className="indicator__name">Forage</div>
                            </div>
                            <div className="indicator indicator--overall">
                                <div className="indicator__number">6</div>
                                <div className="indicator__name">Overall</div>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="card">
                    <div className="card__top">
                        <div className="card__identification">
                            <div className="marker marker--selected">C</div>
                            <div className="card__name">423 Waltz Road</div>
                        </div>
                        <div className="card__buttons">
                            <button type="button" className="card__button">
                                <i className="icon-star-outline" />
                            </button>
                            <button type="button" className="card__button">
                                <i className="icon-trash-fill" />
                            </button>
                        </div>
                    </div>
                    <div className="card__bottom">
                        <div className="indicator-container">
                            <div className="indicator indicator--hive-density">
                                <div className="indicator__number">65</div>
                                <div className="indicator__name">Hive&nbsp;Density</div>
                            </div>
                            <div className="indicator indicator--habitat">
                                <div className="indicator__number">36</div>
                                <div className="indicator__name">Habitat</div>
                            </div>
                            <div className="indicator indicator--pesticide">
                                <div className="indicator__number">5</div>
                                <div className="indicator__name">Pesticide</div>
                            </div>
                            <div className="indicator indicator--forage">
                                <div className="indicator__number">25</div>
                                <div className="indicator__name">Forage</div>
                            </div>
                            <div className="indicator indicator--overall">
                                <div className="indicator__number">6</div>
                                <div className="indicator__name">Overall</div>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="card">
                    <div className="card__top">
                        <div className="card__identification">
                            <div className="marker marker--starred">B</div>
                            <div className="card__name">423 Waltz Road</div>
                        </div>
                        <div className="card__buttons">
                            <button type="button" className="card__button">
                                <i className="icon-clipboard-outline" />
                            </button>
                            <button type="button" className="card__button">
                                <i className="icon-star-fill" />
                            </button>
                            <button type="button" className="card__button">
                                <i className="icon-trash-fill" />
                            </button>
                        </div>
                    </div>
                    <div className="card__bottom">
                        <div className="indicator-container">
                            <div className="indicator indicator--hive-density">
                                <div className="indicator__number">65</div>
                                <div className="indicator__name">Hive&nbsp;Density</div>
                            </div>
                            <div className="indicator indicator--habitat">
                                <div className="indicator__number">36</div>
                                <div className="indicator__name">Habitat</div>
                            </div>
                            <div className="indicator indicator--pesticide">
                                <div className="indicator__number">5</div>
                                <div className="indicator__name">Pesticide</div>
                            </div>
                            <div className="indicator indicator--forage">
                                <div className="indicator__number">25</div>
                                <div className="indicator__name">Forage</div>
                            </div>
                            <div className="indicator indicator--overall">
                                <div className="indicator__number">6</div>
                                <div className="indicator__name">Overall</div>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="card">
                    <div className="card__top">
                        <div className="card__identification">
                            <div className="marker marker--starred-survey">A</div>
                            <div className="card__name">423 Waltz Road</div>
                        </div>
                        <div className="card__buttons">
                            <button type="button" className="card__button">
                                <i className="icon-clipboard-fill" />
                            </button>
                            <button type="button" className="card__button">
                                <i className="icon-star-fill" />
                            </button>
                            <button type="button" className="card__button">
                                <i className="icon-trash-fill" />
                            </button>
                        </div>
                    </div>
                    <div className="card__bottom">
                        <div className="indicator-container">
                            <div className="indicator indicator--hive-density">
                                <div className="indicator__number">65</div>
                                <div className="indicator__name">Hive&nbsp;Density</div>
                            </div>
                            <div className="indicator indicator--habitat">
                                <div className="indicator__number">36</div>
                                <div className="indicator__name">Habitat</div>
                            </div>
                            <div className="indicator indicator--pesticide">
                                <div className="indicator__number">5</div>
                                <div className="indicator__name">Pesticide</div>
                            </div>
                            <div className="indicator indicator--forage">
                                <div className="indicator__number">25</div>
                                <div className="indicator__name">Forage</div>
                            </div>
                            <div className="indicator indicator--overall">
                                <div className="indicator__number">6</div>
                                <div className="indicator__name">Overall</div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
}
