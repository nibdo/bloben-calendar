import { getHostname } from '../utils/common';
import { isElectron } from '../env';
import ElectronApi from '../api/ElectronApi';
import React, { useEffect, useRef, useState } from 'react';

let interval: any;
/**
 * Wait for backend to start for electron app
 * @param props
 * @constructor
 */
const ElectronProvider = (props: any) => {
  const [isReady, setIsReady] = useState(true);
  const counter = useRef(0);

  const checkIfReady = async () => {
    if (import.meta.env.VITE_APP_IS_ELECTRON && isElectron) {
      // eslint-disable-next-line no-console
      console.log(
        'Is Electron App',
        import.meta.env.VITE_APP_IS_ELECTRON && isElectron
      );
    }

    // eslint-disable-next-line no-console
    console.log('Hostname', getHostname());
    const apiUrl = `${getHostname()}/api`;

    window.localStorage.setItem('apiUrl', apiUrl);
    window.env.apiUrl = apiUrl;

    try {
      const response = await ElectronApi.ping();

      if (response.status === 200) {
        setIsReady(true);
      }
    } catch (e: any) {
      setIsReady(true);

      counter.current = counter.current + 1;
      if (counter.current > 3) {
        setIsReady(true);
        stopInterval();
      }
    }
  };

  const stopInterval = () => {
    clearInterval(interval);
    interval = undefined;
  };

  useEffect(() => {
    if (!isElectron) {
      setIsReady(true);

      return;
    }

    // interval = setInterval(() => {
    checkIfReady();
    // }, 500);

    // return () => stopInterval();
  }, []);

  useEffect(() => {
    if (isReady && interval) {
      stopInterval();
    }
  }, [isReady]);

  return <>{isElectron && !isReady ? null : props.children}</>;
};
export default ElectronProvider;
