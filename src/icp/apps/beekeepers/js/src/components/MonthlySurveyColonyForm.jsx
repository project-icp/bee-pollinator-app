import React, { Component } from 'react';
import { func, number } from 'prop-types';
import 'react-tabs/style/react-tabs.css';

import {
    COLONY_LOSS_REASONS,
    ACTIVITY_SINCE_LAST,
    VARROA_CHECK_METHODS,
    MITE_MANAGEMENT_OPTIONS,
} from '../constants';

import { MonthlySurveyColony } from '../propTypes';

class MonthlySurveyColonyForm extends Component {
    inputFactory(inputType) {
        const { data, onChange } = this.props;
        const disabled = data.id !== null;

        return (key, label, required) => (
            <div className="form__group">
                <label htmlFor={key}>
                    {label}
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
                />
            </div>
        );
    }

    inputSelect(key, label, options) {
        const { data, onChange } = this.props;
        const value = data[key] && data[key].toString();
        const disabled = data.id !== null;

        return (
            <div className="form__group">
                <label htmlFor={key}>
                    {label}
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

    makeMultipleChoiceInputs(groupName, options) {
        const { data, onChange } = this.props;
        const disabled = data.id !== null;

        return options.map((option) => {
            const key = `${groupName}_${option}`;
            const label = option.split('_').join(' ').toLowerCase();

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
                    <label htmlFor={key}>{label}</label>
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
                        What do you think the most likely cause of colony loss was?
                        Check all that apply.
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
                    </label>
                    {this.makeMultipleChoiceInputs('varroa_count_technique', VARROA_CHECK_METHODS)}
                    <div className="form__secondary">
                        {inputText('varroa_count_technique_OTHER', 'other')}
                        {inputNumber('varroa_count_result', 'Number of mites per 300 bees (1/2 cup)')}
                    </div>
                </div>
            </>
        );

        return (
            <>
                {inputText('colony_name', 'Colony Name (required)', required)}
                {inputDate('inspection_date', 'Date of Inspection', required)}
                {this.inputSelect('colony_alive', 'Is the colony alive?', [
                    ['true', 'Yes'],
                    ['false', 'No'],
                ])}
                {colonyLossReasons}
                <div className="form__group">
                    Total number of hive bodies and supers:
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
                        Do you treat for Varroa? If so, how?
                        Check all that apply.
                    </label>
                    {this.makeMultipleChoiceInputs('varroa_treatment', MITE_MANAGEMENT_OPTIONS)}
                    <div className="form__secondary">
                        {inputText('varroa_treatment_CHEMICAL_ORGANIC_OTHER', 'Other organic chemical')}
                        {inputText('varroa_treatment_MECHANICAL_OTHER', 'Other mechanical')}
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
                ])}
                {this.inputSelect('same_queen', 'Is this the same queen from the last assessment?', [
                    ['YES', 'Yes: Same Queen'],
                    ['NO_BEEKEEPER_REPLACED', 'No: Beekeeper Replaced'],
                    ['NO_SWARM', 'No: Swarm'],
                    ['NO_SUPERSEDURE', 'No: Supersedure'],
                    ['NO_QUEEN_DEATH', 'No: Queen Death'],
                ])}
                {inputText('queen_stock', 'To the best of your knowledge, what is the stock of the queen?')}
                {this.inputSelect('queen_source', 'Where did the queen come from?', [
                    ['NON_LOCAL_COMMERCIAL', 'Non-local commercial breeder'],
                    ['LOCAL_COMMERCIAL', 'Local commercial breeder'],
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
