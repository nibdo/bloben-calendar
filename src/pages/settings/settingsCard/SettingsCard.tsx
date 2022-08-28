import './SettingsCard.scss';
import { Context } from '../../../context/store';
import { parseCssDark } from '../../../utils/common';
import React, { useContext } from 'react';

interface SettingsCardProps {
  title: string;
  children: any;
}
const SettingsCard = (props: SettingsCardProps) => {
  const [store] = useContext(Context);

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
