import { Context } from '../context/store';
import { Route } from 'react-router-dom';
import { setUser } from '../redux/actions';
import { useDispatch } from 'react-redux';
import GeneralApi from '../api/GeneralApi';
import Login from 'pages/login/Login';
import React, { useContext, useEffect } from 'react';
import UserApi from '../api/UserApi';

const AuthProvider = (props: any) => {
  const reduxDispatch = useDispatch();
  const [store, dispatch] = useContext(Context);
  const { isLogged } = store;

  const setContext = (type: string, payload: any) => {
    dispatch({ type, payload });
  };

  const handleDemoRedirect = () => {
    const query = new URLSearchParams(window.location.search);
    const param = query.get('demo');
    if (param) {
      window.localStorage.setItem('apiUrl', 'https://demo.bloben.com/api');
      window.env.apiUrl = 'https://demo.bloben.com/api';
      window.location.replace('/calendar');
    }
  };

  const checkLogin = async (): Promise<void> => {
    if (!window.env?.apiUrl) {
      setContext('isLogged', false);
      setContext('isAppStarting', false);

      handleDemoRedirect();
      return;
    }

    try {
      const response = await UserApi.getSession();

      if (response.data.isLogged) {
        setContext('isLogged', true);
        setContext('isAppStarting', false);
        reduxDispatch(
          setUser({
            id: response.data.userID,
            username: response.data.username,
          })
        );
      } else {
        setContext('isAppStarting', false);
      }
    } catch (e) {
      setContext('isLogged', true);
      setContext('isAppStarting', false);
    }
  };

  const getApiVersion = async () => {
    if (!window.env?.apiUrl) {
      setContext('isLogged', false);
      return;
    }
    const response = await GeneralApi.getApiVersion();

    setContext('version', response?.data);
  };

  // check login on load
  useEffect(() => {
    checkLogin();
    getApiVersion();
  }, []);

  return (
    <>
      <Route path={'/calendar'}>{!isLogged ? <Login /> : props.children}</Route>
    </>
  );
};

export default AuthProvider;
