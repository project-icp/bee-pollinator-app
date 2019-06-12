import React, { Component } from 'react';
import { func, number } from 'prop-types';
import 'react-tabs/style/react-tabs.css';

import {
    COLONY_LOSS_REASONS,
    ACTIVITY_SINCE_LAST,
    VARROA_CHECK_METHODS,
    MITE_MANAGEMENT_OPTIONS,
    VARROA_ALCOHOL_WASH_DESCRIPTION,
    VARROA_STICKYBOARD_DESCRIPTION,
    VARROA_SUGAR_SHAKE_DESCRIPTION,
    DEEP_HIVE_BODIES_DESCRIPTION,
    MEDIUM_HIVE_BODIES_DESCRIPTION,
    SHALLOW_HIVE_BODIES_DESCRIPTION,
    QUEEN_STOCK_DESCRIPTION,
    QUEENRIGHT_DESCRIPTION,
    THYMOL_DESCRIPTION,
    AMITRAZ_DESCRIPTION,
} from '../constants';
import { MonthlySurveyColony } from '../propTypes';

import Tooltip from './Tooltip';


class MonthlySurveyColonyForm extends Component {
    inputFactory(inputType) {
        const { onChange, data } = this.props;
        const disabled = data.id !== null;
        return (key, label, required, tooltipDescription, placeholder, pattern) => {
            const tooltip = tooltipDescription
                ? <Tooltip description={[tooltipDescription]} />
                : null;
            return (
                <div className="form__group">
                    <label htmlFor={key}>
                        {label}
                        {tooltip}
                    </label>
                    <input
                        type={inputType}
                        className="form__control"
                        id={key}
                        name={key}
                        value={data[key]}
                        onChange={onChange}
                        disabled={disabled}
                        required={required}
                        placeholder={placeholder}
                        pattern={pattern}
                    />
                </div>
            );
        };
    }

    inputSelect(key, label, options, tooltipDescription) {
        const { onChange, data } = this.props;
        const value = data[key] && data[key].toString();
        const disabled = data.id !== null;
        const tooltip = tooltipDescription
            ? <Tooltip description={tooltipDescription} />
            : null;

        return (
            <div className="form__group">
                <label htmlFor={key}>
                    {label}
                    {tooltip}
                </label>
                <select
                    className="form__control"
                    id={key}
                    name={key}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    {options.map(([oValue, oLabel]) => (
                        <option key={oValue} value={oValue}>{oLabel}</option>
                    ))}
                </select>
            </div>
        );
    }

    makeMultipleChoiceInputs(groupName, options, tooltipDescriptions) {
        const { onChange, data } = this.props;
        const disabled = data.id !== null;

        return options.map((option, index) => {
            const key = `${groupName}_${option}`;
            const label = option.split('_').join(' ').toLowerCase();
            const tooltip = tooltipDescriptions && tooltipDescriptions[index]
                ? <Tooltip description={[tooltipDescriptions[index]]} />
                : null;

            return (
                <div
                    className="form__checkbox"
                    key={key}
                >
                    <input
                        type="checkbox"
                        className="form__control"
                        id={key}
                        name={key}
                        checked={data[key]}
                        onChange={onChange}
                        disabled={disabled}
                    />
                    <label htmlFor={key}>
                        {label}
                        {tooltip}
                    </label>
                </div>
            );
        });
    }

    render() {
        const {
            data: {
                colony_name,
                colony_alive,
                varroa_count_performed,
            },
            idx,
        } = this.props;

        const inputText = this.inputFactory('text');
        const inputDate = this.inputFactory('date');
        const inputNumber = this.inputFactory('number');

        // The first colony is always requried. Henceforth, the colony name
        // indicates if the colony is being filled out. If it is filled out,
        // then the other fields are required as well.
        const required = idx === 0 || colony_name !== '';

        const colonyLossReasons = colony_alive ? null : (
            <>
                <div className="form__group">
                    <label htmlFor="colony_loss_reason">
                        What do you think was the most likely cause of colony loss?
                        Check all that apply. Required.
                    </label>
                    {this.makeMultipleChoiceInputs('colony_loss_reason', COLONY_LOSS_REASONS)}
                    <div className="form__secondary">
                        {inputText('colony_loss_reason_OTHER', 'other')}
                    </div>
                </div>
            </>
        );

        const varroaCountDetails = !varroa_count_performed ? null : (
            <>
                <div className="form__group">
                    <label htmlFor="varroa_count_technique">
                        How did you do a Varroa count?
                        <Tooltip
                            description={[
                                VARROA_ALCOHOL_WASH_DESCRIPTION,
                                VARROA_SUGAR_SHAKE_DESCRIPTION,
                                VARROA_STICKYBOARD_DESCRIPTION,
                            ]}
                        />
                    </label>
                    {this.makeMultipleChoiceInputs('varroa_count_technique', VARROA_CHECK_METHODS)}
                    <div className="form__secondary">
                        {inputText('varroa_count_technique_OTHER', 'other')}
                        {inputNumber('varroa_count_result', 'Number of mites per 300 bees (1/2 cup)')}
                    </div>
                </div>
            </>
        );
        /* eslint-disable-next-line no-useless-escape */
        const dateRegex = '\\d{4}-\\d{2}-\\d{2}';
        return (
            <>
                {inputText('colony_name', 'Colony Name (required)', required)}
                {inputDate('inspection_date', 'Date of Inspection', required, false, 'YYYY-MM-DD', dateRegex)}
                {inputText('hive_scale_id', 'If you have an automated scale associated with this colony, please enter the hive scale brand and ID number here.')}
                {this.inputSelect('colony_alive', 'Is the colony alive?', [
                    ['true', 'Yes'],
                    ['false', 'No'],
                ])}
                {colonyLossReasons}
                <div className="form__group">
                    Total number of hive bodies and supers:
                    <Tooltip
                        description={[
                            DEEP_HIVE_BODIES_DESCRIPTION,
                            MEDIUM_HIVE_BODIES_DESCRIPTION,
                            SHALLOW_HIVE_BODIES_DESCRIPTION,
                        ]}
                    />
                    <div className="form__secondary">
                        {inputNumber('num_bodies_supers_deep', 'Deep')}
                        {inputNumber('num_bodies_supers_medium', 'Medium')}
                        {inputNumber('num_bodies_supers_shallow', 'Shallow')}
                    </div>
                </div>
                {this.inputSelect('varroa_count_performed', 'Did you do a Varroa count?', [
                    ['true', 'Yes'],
                    ['false', 'No'],
                ])}
                {varroaCountDetails}
                <div className="form__group">
                    <label htmlFor="varroa_treatment">
                        Did you manage for Varroa since the last inspection?
                        Check all that apply.
                    </label>
                    {this.makeMultipleChoiceInputs('varroa_treatment', MITE_MANAGEMENT_OPTIONS, [THYMOL_DESCRIPTION, AMITRAZ_DESCRIPTION])}
                    <div className="form__secondary">
                        {inputText('varroa_treatment_OTHER', 'Other')}
                    </div>
                </div>
                <div className="form__group">
                    <label htmlFor="activity_since_last">
                        Since the last assessment, have you done any of the following?
                        Check all that apply.
                    </label>
                    {this.makeMultipleChoiceInputs('activity_since_last', ACTIVITY_SINCE_LAST)}
                </div>
                {this.inputSelect('queenright', 'Is the colony queenright?', [
                    ['true', 'Yes'],
                    ['false', 'No'],
                ], [QUEENRIGHT_DESCRIPTION])}
                {this.inputSelect('same_queen', 'Is this the same queen from the last assessment?', [
                    ['YES', 'Yes: Same Queen'],
                    ['NO_BEEKEEPER_REPLACED', 'No: Beekeeper Replaced'],
                    ['NO_SWARM', 'No: Swarm'],
                    ['NO_SUPERSEDURE', 'No: Supersedure'],
                    ['NO_QUEEN_DEATH', 'No: Queen Death'],
                ])}
                {inputText(
                    'queen_stock',
                    'To the best of your knowledge, what is the stock of the queen?',
                    false,
                    QUEEN_STOCK_DESCRIPTION,
                )}
                {this.inputSelect('queen_source', 'Where did the queen come from?', [
                    ['NON_LOCAL_COMMERCIAL', 'Non-local commercial breeder'],
                    ['LOCAL_COMMERCIAL', 'Local commercial breeder'],
                    ['LOCAL_NON_COMMERCIAL', 'Local, non-commercial or reared on site'],
                    ['REQUEENED', 'Colony requeened itself'],
                    ['PACKAGE', 'Package'],
                    ['FERAL', 'Feral colony or swarm'],
                ])}
            </>
        );
    }
}

MonthlySurveyColonyForm.propTypes = {
    data: MonthlySurveyColony.isRequired,
    onChange: func.isRequired,
    idx: number.isRequired,
};

export default MonthlySurveyColonyForm;
