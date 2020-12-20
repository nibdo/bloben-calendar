import React, { useState } from 'react';
import './calendar-content.scss';
import { useHistory, useParams } from 'react-router';
import HeaderModal from '../../../components/header-modal';
import Input from '../../../components/input';
import { ButtonBase } from '@material-ui/core';
import EvaIcons from 'bloben-common/components/eva-icons';
import ModalSmall from '../../../bloben-package/components/modal-small/modal-small';
import Utils from '../calendar-edit.utils';
import NotificationSettings from '../../../bloben-package/components/notification-settings/notification-settings';
import CalendarIcon from '@material-ui/icons/DateRange';
import { calendarColors, parseEventColor } from '../../../components/calendar-view/calendar-common';
import { useSelector } from 'react-redux';

const CalendarColor = (props: any) => {
  const { color, isDark, onClick } = props;
  const calendarColor: any = parseEventColor(color, isDark);

  return (
    <ButtonBase className={'event_detail__row'} onClick={onClick}>
      <div className={'event_detail__container--icon'}>
        <EvaIcons.CircleFill
          className={'svg-icon calendar-content-svg'}
          fill={calendarColor}
        />
      </div>
      <p className={`event_detail__input${isDark ? '--dark' : ''}`}>{color}</p>
    </ButtonBase>
  );
};

const renderCalendarColors = (onClick: any, isDark: boolean) => {
  const objectData: any = Object.keys(calendarColors);

  return objectData.map((keyName: string) => {
    return (
      <CalendarColor
        isDark={isDark}
        color={keyName}
        onClick={() => onClick(keyName)}
      />
    );
  });
};

const CalendarContentView = (props: any) => {
  const {
    goBack,
    handleBlur,
    state,
    handleChange,
    colorModalIsOpen,
    toggleColorModal,
    handleColorClick,
    saveCalendar,
    addNotification,
    reminders,
    removeNotification,
    deleteCalendar,
    calendarId
  } = props;
  const { name, color } = state;
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const defaultCalendar: string = useSelector((state: any) => state.defaultCalendar);

  const history = useHistory();
  const params = useParams();

  return (
    <div>
      <HeaderModal
        goBack={goBack}
        handleSave={saveCalendar}
        hasHeaderShadow={true}
        title={'Calendar'}
        handleDelete={defaultCalendar !== calendarId ? deleteCalendar : null}
        icons={[]}
      />
      <div className={'event_detail__wrapper'} style={{ padding: 0 }}>
        <div className={'event_detail__row'}>
          <div className={'event_detail__container--icon'}>
            <CalendarIcon className={'event_detail__icon--hidden'} />
          </div>
          <Input
            className={`calendar-content${isDark ? '-dark' : ''} `}
            name={'name'}
            value={name}
            placeholder={'Type calendar name'}
            autoComplete={false}
            autoFocus={true}
            onChange={handleChange}
            // onBlur={handleBlur}
            multiline={false}
            borderBottom={true}
          />
        </div>
        {/*
        // Calendar color
        */}
        <CalendarColor
          isDark={isDark}
          color={color}
          onClick={() => {
            toggleColorModal(true);
          }}
        />
        {/*<NotificationSettings*/}
        {/*  notifications={reminders}*/}
        {/*  addNotification={addNotification}*/}
        {/*  removeNotification={removeNotification}*/}
        {/*/>*/}
      </div>
      <ModalSmall
        isOpen={colorModalIsOpen}
        handleClose={() => toggleColorModal(false)}
      >
        {renderCalendarColors(handleColorClick, isDark)}
      </ModalSmall>
    </div>
  );
};

const CalendarContent = (props: any) => {
  const { selectColor, addNotification, removeNotification, deleteCalendar, calendarId } = props;
  const [colorModalIsOpen, openColorModal] = useState(false);

  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const toggleColorModal = (value: boolean) => {
    openColorModal(value);
  };

  const handleColorClick = (value: any) => {
    selectColor(value);
    toggleColorModal(false);
  };

  return (
    <CalendarContentView
      goBack={goBack}
      {...props}
      toggleColorModal={toggleColorModal}
      colorModalIsOpen={colorModalIsOpen}
      handleColorClick={handleColorClick}
      addNotification={addNotification}
      removeNotification={removeNotification}
      deleteCalendar={deleteCalendar}
      calendarId={calendarId}
    />
  );
};

export default CalendarContent;
