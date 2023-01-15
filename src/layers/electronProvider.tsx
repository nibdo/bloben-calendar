import { getHostname } from '../utils/common';
import { isElectron } from '../env';
import ElectronApi from '../api/ElectronApi';
import React, { useEffect, useRef, useState } from 'react';

/**
 * Wait for backend to start for electron app
 * @param props
 * @constructor
 */
const ElectronProvider = (props: any) => {
  const [isReady, setIsReady] = useState(false);
  const counter = useRef(0);
  const interval = useRef(undefined);

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
    counter.current = counter.current + 1;

    if (counter.current > 30) {
      setIsReady(true);
      stopInterval();
    }

    try {
      const response = await ElectronApi.ping();

      if (response.status === 200) {
        setIsReady(true);
        stopInterval();
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  };

  const stopInterval = () => {
    clearInterval(interval.current);
    interval.current = undefined;
  };

  useEffect(() => {
    if (!isElectron) {
      setIsReady(true);

      return;
    }

    // @ts-ignore
    interval.current = setInterval(() => {
      checkIfReady();
    }, 500);

    return () => stopInterval();
  }, []);

  useEffect(() => {
    if (isReady && interval.current) {
      stopInterval();
    }
  }, [isReady]);

  return <>{isElectron && !isReady ? null : props.children}</>;
};
export default ElectronProvider;
