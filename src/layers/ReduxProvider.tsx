import { Provider } from 'react-redux';
import { createStore } from 'redux';
import React, { useEffect, useState } from 'react';

import { debug } from '../utils/debug';
import { saveState } from '../redux/localstorage';
import LocalForage from '../utils/LocalForage';
import rootReducer, { initialReduxState } from '../redux/reducers';

export let reduxStore: any = createStore(rootReducer, initialReduxState);

interface ReduxProviderProps {
  isStorageLoaded?: boolean;
  state?: any;
  children: any;
}
const ReduxProvider = (props: ReduxProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    reduxStore = createStore(rootReducer, initialReduxState);
  }, []);

  useEffect(() => {
    LocalForage.getItem('root')
      .then((storage: any) => {
        reduxStore = createStore(rootReducer, storage || initialReduxState);
        setIsLoaded(true);

        reduxStore.subscribe(() => {
          saveState();
        });
      })
      .catch((e: any) => {
        alert(
          'Error: Local storage not available. \n\nIf you are using incognito' +
            ' mode in Firefox browser, required localstorage is not working.' +
            ' Please try another browser or use regular Firefox window.'
        );
        debug('Local storage error', e);
      });
  }, []);

  return (
    <>
      {isLoaded ? (
        <Provider store={reduxStore}>{props.children}</Provider>
      ) : null}
    </>
  );
};

export default ReduxProvider;
