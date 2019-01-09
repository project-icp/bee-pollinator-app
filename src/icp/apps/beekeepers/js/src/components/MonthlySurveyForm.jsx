import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Tab,
    Tabs,
    TabList,
    TabPanel,
} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { Survey } from '../propTypes';
import { getOrCreateSurveyRequest, toMonthNameYear } from '../utils';

class MonthlySurveyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            num_colonies: props.survey.num_colonies,
            error: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const { survey: { id, apiary } } = this.props;

        if (id) {
            // TODO parse data to fill out forms
            getOrCreateSurveyRequest({ apiaryId: apiary, surveyId: id })
                .then(({ data }) => this.setState({
                    num_colonies: data.survey.num_colonies,
                }))
                .catch(error => this.setState({ error }));
        }
    }

    handleChange({
        currentTarget: {
            value, type, checked, name,
        },
    }) {
        let finalValue = value;
        if (type === 'checkbox') {
            if (value === 'on') {
                finalValue = checked;
            } else {
                finalValue = checked ? value : '';
            }
        }
        this.setState({ [name]: finalValue });
    }


    // eslint-disable-next-line class-methods-use-this
    handleSubmit(event) {
        // TODO Fill out
        // Send form data to backend for validation/save and prevent form from closing modal
        event.preventDefault();
    }

    render() {
        const {
            num_colonies,
            error,
        } = this.state;

        const { survey: { month_year, completed } } = this.props;

        const userMessage = error.length ? (
            <div className="form__group--error">
                {error}
            </div>
        ) : null;

        const submitButton = completed ? null
            : (
                <button
                    type="submit"
                    value="Submit"
                    className="button--long"
                >
                    Submit
                </button>
            );

        const surveyForm = (
            <>
                <div className="title">
                    Monthly Survey for
                    {' '}
                    {toMonthNameYear(month_year)}
                </div>
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className="form__group">
                        <label htmlFor="num_colonies">
                            How many colonies are in this apiary?
                        </label>
                        <input
                            type="number"
                            className="form__control"
                            id="num_colonies"
                            name="num_colonies"
                            onChange={this.handleChange}
                            value={num_colonies}
                            disabled={completed}
                            required
                        />
                    </div>
                    Please enter details for up to three colonies:
                    <Tabs>
                        <TabList>
                            <Tab>Colony 1</Tab>
                            <Tab>Colony 2</Tab>
                            <Tab>Colony 3</Tab>
                        </TabList>

                        <TabPanel>
                            <h2>Colony 1</h2>
                        </TabPanel>
                        <TabPanel>
                            <h2>Colony 2</h2>
                        </TabPanel>
                        <TabPanel>
                            <h2>Colony 3</h2>
                        </TabPanel>
                    </Tabs>
                    {submitButton}
                </form>
            </>
        );

        return (
            <div className="authModal">
                <div className="authModal__header">
                    <div>Monthly Survey</div>
                </div>
                <div className="authModal__content">
                    {userMessage}
                    {surveyForm}
                </div>
                <div className="authModal__footer" />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state.main;
}

MonthlySurveyForm.propTypes = {
    survey: Survey.isRequired,
};

export default connect(mapStateToProps)(MonthlySurveyForm);
