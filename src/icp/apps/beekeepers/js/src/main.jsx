import React from 'react';
import { render } from 'react-dom';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import '../../sass/main.scss';
import App from './App';
import Survey from './Survey';

import { store, persistor } from './store';

render(
    <Provider store={store}>
        {/* TODO Add Loading State
            https://github.com/project-icp/bee-pollinator-app/issues/314 */}
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={App} />
                    <Route path="/survey" component={Survey} />
                </Switch>
            </BrowserRouter>
        </PersistGate>
    </Provider>,
    document.querySelector('.beekeepers-app'),
);
