import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import reducers from './reducers';

const middlewares = [thunk];

if (process.env.NODE_ENV === 'development') {
    const logger = createLogger();
    middlewares.push(logger);
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);

const persistReducerConfig = {
    key: 'beekeepers-app',
    storage,
    whitelist: ['saved'],
};
const persistReducers = persistCombineReducers(persistReducerConfig, reducers);
const store = createStoreWithMiddleware(persistReducers);
const persistor = persistStore(store);

export { store, persistor };
