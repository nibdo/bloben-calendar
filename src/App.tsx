import React, { useEffect } from 'react';
import 'bloben-common/index.scss';
import StoreLayer from 'layers/store-layer';
import { BrowserRouter } from 'react-router-dom';
import { createStore, Store } from 'redux';
import { Provider, useSelector } from 'react-redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from 'redux/reducers';
import { Persistor } from 'redux-persist/es/types';
import { PersistGate } from 'redux-persist/integration/react';
import LoadingScreen from './bloben-common/components/loading-screen/loading-screen';

const persistConfig = {
    key: 'root',
    storage,
    transforms: [
        createTransform(JSON.stringify, (toRehydrate: any) =>
            JSON.parse(toRehydrate, (key, value) =>
                typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
                    ? new Date(value)
                    : value,
            ),
        ),
    ],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// REDUX STORE
export let reduxStore: Store = createStore(persistedReducer);
export let persistor: any = persistStore(reduxStore)

const App = () =>
  (
        <Provider store={reduxStore}>
            <PersistGate     loading={<LoadingScreen/>}
                             persistor={persistor}  >
            <BrowserRouter>
        <StoreLayer initPath={window.location.href} />
      </BrowserRouter>
            </PersistGate>
        </Provider>
  );

export default App;
