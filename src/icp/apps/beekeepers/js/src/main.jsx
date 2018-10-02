import React from 'react';
import { render } from 'react-dom';

import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import '../../sass/main.scss';
import App from './SampleApp';

import createStoreWithMiddleware from './store';
import reducers from './reducers';

const store = createStoreWithMiddleware(reducers);
render(
    <Provider store={store}>
        <BrowserRouter>
            <div>
                <Route exact path="/" component={App} />
            </div>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'),
);
