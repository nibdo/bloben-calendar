import React from 'react';
import './calendar-settings.scss';
import { ButtonBase } from '@material-ui/core';
import { useHistory, useParams } from 'react-router';
import { useSelector } from 'react-redux';

const CalendarSettingsItem = (props: any) => {
  const { onClick, title, isDisabled } = props;
  const isDark: boolean = useSelector((state: any) => state.isDark);

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


const CalendarSettingsView = (props: any) => {
  const {
    handleEditList,
    defaultList,
    params,
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

const CalendarSettings = (props: any) => {
  const { handleDeleteList, handleEditList, handleCloseModal, defaultList } = props;
  const history = useHistory();
  const params = useParams();
  const navigateTo = (path: string) => {
    handleCloseModal();
    history.push(path);
  };

  const handleEditListWithClose = () => {
    handleCloseModal();
    handleEditList();
  };

  const handleDeleteListWithClose = () => {
    handleCloseModal();
    handleDeleteList();
  };

  return (
    <CalendarSettingsView
      handleDeleteList={handleDeleteListWithClose}
      handleEditList={handleEditListWithClose}
      params={params}
      defaultList={defaultList}
      navigateTo={navigateTo}
    />
  );
};

export default CalendarSettings;
