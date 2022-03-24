import { GetUserEmailConfigResponse } from '../bloben-interface/userEmailConfig/userEmailConfig';
import React, { createContext, useEffect, useReducer } from 'react';
import Reducer from './reducer';

export interface StoreContext {
  isLogged: boolean;
  isDark: boolean;
  isLoading: boolean;
  isAppStarting: boolean;
  isMobile: boolean;
  snackbarIsVisible: boolean;
  snackbar: any;
  errorObj: Error | null;
  settingsOpen: boolean;
  syncSequence: number;
  isSyncing: boolean;
  apiVersion: string;
  emailConfig: GetUserEmailConfigResponse;
  latestVersion: string;
}

const initialContext: StoreContext = {
  isLogged: false,
  isDark: false,
  isLoading: false,
  isAppStarting: true,
  isMobile: false,
  snackbarIsVisible: false,
  snackbar: {},
  errorObj: null,
  settingsOpen: false,
  syncSequence: 0,
  isSyncing: false,
  apiVersion: '',
  latestVersion: '',
  emailConfig: {
    hasCustomConfig: false,
    hasSystemConfig: false,
  },
};

const StoreProvider = ({ children }: any) => {
  const [store, dispatch] = useReducer(Reducer, initialContext);

  // load env
  const loadEnv = async () => {
    const apiUrl = window.localStorage.getItem('apiUrl');

    if (apiUrl) {
      window.env.apiUrl = apiUrl;
    }
  };

  useEffect(() => {
    loadEnv();
  }, []);

  return (
    <Context.Provider value={[store, dispatch]}>{children}</Context.Provider>
  );
};

// @ts-ignore
export const Context: any = createContext();
export default StoreProvider;
