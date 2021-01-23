import React, { useContext } from 'react';
import './SettingsCalendar.scss';
import { ButtonBase } from '@material-ui/core';
import { useHistory, useParams } from 'react-router';
import { Context } from '../../bloben-package/context/store';

interface ICalendarSettingsItemProps {
  onClick: any;
  title: string;
  isDisabled?: boolean;
}
const CalendarSettingsItem = (props: ICalendarSettingsItemProps) => {
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

interface ICalendarSettingsViewProps {
  navigateTo: any;
}
const CalendarSettingsView = (props: ICalendarSettingsViewProps) => {
  const {
    navigateTo,
  } = props;

  return (
    <div className={'calendar-settings__container'}>
      <CalendarSettingsItem
        title={'Add calendar'}
        onClick={() => navigateTo('/calendar/new')}
      />
      <CalendarSettingsItem
          title={'Import events'}
          onClick={() => navigateTo('/calendar/events/import')}
      />
      <CalendarSettingsItem
        title={'Settings'}
        onClick={() => navigateTo('/settings')}
      />
    </div>
  );
};

interface ICalendarSettingsProps {
  handleClose: any;
}
const SettingsCalendar = (props: ICalendarSettingsProps) => {
  const { handleClose } = props;

  const history = useHistory();

  const navigateTo = (path: string) => {
    handleClose();
    history.push(path);
  };

  return (
    <CalendarSettingsView
      navigateTo={navigateTo}
    />
  );
};

export default SettingsCalendar;
