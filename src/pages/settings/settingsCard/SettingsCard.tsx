import './SettingsCard.scss';
import { Context, StoreContext } from '../../../context/store';
import { parseCssDark } from '../../../utils/common';
import React, { useContext } from 'react';

interface SettingsCardProps {
  title: string;
  children: any;
}
const SettingsCard = (props: SettingsCardProps) => {
  const [store]: [StoreContext] = useContext(Context);

  const { isMobile } = store;

  const { isMobile } = store;

  return (
    <div className={'SettingsCard__container'}>
      {!isMobile ? (
        <h6 className={parseCssDark('SettingsCard__title', store.isDark)}>
          {props.title}
        </h6>
      ) : null}
      {props.children}
    </div>
  );
};

export default SettingsCard;
