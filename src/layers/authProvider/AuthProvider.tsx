import { Context, StoreContext } from '../../context/store';
import { checkLogin } from './authProviderHelper';
import { getHostname, parseCssDark } from '../../utils/common';
import { isElectron } from '../../env';
import { useDispatch } from 'react-redux';
import AppRouter from '../../pages/Router';
import ElectronCreateUser from '../../components/electron/ElectronCreateUser';
import GeneralApi from '../../api/GeneralApi';
import Login from '../../pages/login/Login';
import React, { useContext, useEffect } from 'react';

const AuthProvider = () => {
  const reduxDispatch = useDispatch();
  const [store, dispatch]: [StoreContext, any] = useContext(Context);
  const { isLogged } = store;

  const setContext = (type: string, payload: any) => {
    dispatch({ type, payload });
  };

  const handleDemoRedirect = () => {
    const query = new URLSearchParams(window.location.search);
    const param = query.get('demo');
    if (param) {
      const apiUrl = `${getHostname()}/api`;

      window.localStorage.setItem('apiUrl', apiUrl);
      window.env.apiUrl = apiUrl;
      window.location.replace('/calendar');
    }
  };

  const handleCheckLogin = async () =>
    checkLogin(setContext, handleDemoRedirect, reduxDispatch);

  const getApiVersion = async () => {
    if (!window.env?.apiUrl) {
      setContext('isLogged', false);
      return;
    }
    const response = await GeneralApi.getApiVersion();

    setContext('version', response?.data);
  };

  const getServerSettings = async () => {
    try {
      const response = await GeneralApi.getServerSettings();

      setContext('serverSettings', response?.data);
    } catch (e) {
      return;
    }
  };

  // check login on load
  useEffect(() => {
    handleCheckLogin();
    getApiVersion();
    getServerSettings();
  }, []);

  return (
    <div className={parseCssDark('Surface', store.isDark)}>
      {!isLogged ? (
        isElectron ? (
          <ElectronCreateUser />
        ) : (
          <Login />
        )
      ) : (
        <AppRouter />
      )}
    </div>
  );
};

export default AuthProvider;
