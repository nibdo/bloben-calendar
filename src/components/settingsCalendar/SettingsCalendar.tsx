import React, { useContext } from 'react';
import './SettingsCalendar.scss';
import { ButtonBase } from '@material-ui/core';
import { useHistory } from 'react-router';
import { Context } from 'bloben-module/context/store';

interface CalendarSettingsItemProps {
  onClick: any;
  title: string;
  isDisabled?: boolean;
}
const CalendarSettingsItem = (props: CalendarSettingsItemProps) => {
  const { onClick, title, isDisabled } = props;

  const [store] = useContext(Context);
  const { isDark } = store;

  return (
    <ButtonBase
      className={`calendar-settings__item-container${
        isDisabled ? '-disabled' : ''
      }`}
      onClick={isDisabled ? null : onClick}
    >
      <p
        className={`calendar-settings__item-text${
          isDisabled ? '-disabled' : ''
        }${isDark ? '-dark' : ''}`}
      >
        {title}
      </p>
    </ButtonBase>
  );
};

interface CalendarSettingsViewProps {
  navigateTo: any;
}
const CalendarSettingsView = (props: CalendarSettingsViewProps) => {
  const { navigateTo } = props;

  return (
    <div className={'calendar-settings__container'}>
      <CalendarSettingsItem
        title={'Add calendar'}
        onClick={() => navigateTo('/calendar/new')}
      />
      <CalendarSettingsItem
        title={'Import events'}
        onClick={() => navigateTo('/events/import')}
      />
      <CalendarSettingsItem
        title={'Settings'}
        onClick={() => navigateTo('/settings')}
      />
    </div>
  );
};

interface CalendarSettingsProps {
  handleClose: any;
}
const SettingsCalendar = (props: CalendarSettingsProps) => {
  const { handleClose } = props;

  const history = useHistory();

  const navigateTo = (path: string) => {
    handleClose();
    history.push(path);
  };

  return <CalendarSettingsView navigateTo={navigateTo} />;
};

export default SettingsCalendar;
