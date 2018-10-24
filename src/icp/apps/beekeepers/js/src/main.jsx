import React from 'react';
import { render } from 'react-dom';

import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import '../../sass/main.scss';
import App from './App';

import createStoreWithMiddleware from './store';
import reducers from './reducers';

const store = createStoreWithMiddleware(reducers);
render(
    <Provider store={store}>
        <BrowserRouter>
            <Route exact path="/" component={App} />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'),
);
