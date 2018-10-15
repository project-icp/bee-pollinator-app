import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const middlewares = [thunk];

if (process.env.NODE_ENV === 'development') {
    const logger = createLogger();
    middlewares.push(logger);
}

const createStoreWithMiddleware =
    applyMiddleware(...middlewares)(createStore);

export { createStoreWithMiddleware as default };
