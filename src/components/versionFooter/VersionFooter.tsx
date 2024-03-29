import React, { useContext } from 'react';

import './VersionFooter.scss';
import * as packageFile from '../../../package.json';
import { Context, StoreContext } from '../../context/store';
import { parseCssDark } from '../../utils/common';

const VersionFooter = () => {
  const [store]: [StoreContext] = useContext(Context);

  const { version, isDark } = store;

  return (
    <div className={'VersionFooter__container'}>
      <p
        className={parseCssDark('VersionFooter__text', isDark)}
      >{`Docker image version ${version.dockerImageVersion}`}</p>
      <p
        className={parseCssDark('VersionFooter__text', isDark)}
      >{`Calendar version ${packageFile.version}`}</p>
      <p
        className={parseCssDark('VersionFooter__text', isDark)}
      >{`Api version ${version.apiVersion}`}</p>
    </div>
  );
};

export default VersionFooter;
