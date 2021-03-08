import React, { useContext, useState } from 'react';
import './CalendarContent.scss';
import { useHistory } from 'react-router';
import { ButtonBase } from '@material-ui/core';
import { EvaIcons, HeaderModal, Input, ModalSmall, Modal } from 'bloben-react';
import CalendarIcon from '@material-ui/icons/DateRange';
import {
  calendarColors,
  parseEventColor,
} from '../../../components/calendarView/calendar-common';
import { useSelector } from 'react-redux';
import { parseCssDark } from 'bloben-react';
import { Context } from 'bloben-module/context/store';
import TimezoneRow from 'components/timezoneRow/TimezoneRow';
import TimeZonePicker from 'components/timezonePicker/TimeZonePicker';

interface CalendarColorProps {
  color: any;
  isDark: boolean;
  onClick: any;
}
const CalendarColor = (props: CalendarColorProps) => {
  const { color, isDark, onClick } = props;

  const calendarColor: any = parseEventColor(color, isDark);

  return (
    <ButtonBase
      className={parseCssDark('event_detail__row', isDark)}
      onClick={onClick}
    >
      <div className={'event_detail__container--icon'}>
        <EvaIcons.CircleFill
          className={'svg-icon calendar-content-svg'}
          fill={calendarColor}
        />
      </div>
      <p className={parseCssDark('event_detail__input', isDark)}>{color}</p>
    </ButtonBase>
  );
};

const renderCalendarColors = (onClick: any, isDark: boolean) => {
  const objectData: any = Object.keys(calendarColors);

  return objectData.map((keyName: string) => (
    <CalendarColor
      isDark={isDark}
      color={keyName}
      onClick={() => onClick(keyName)}
    />
  ));
};

interface CalendarContentViewProps {
  goBack: any;
  calendarState: any;
  handleChange: any;
  colorModalIsOpen: boolean;
  toggleColorModal: any;
  handleColorClick: any;
  saveCalendar: any;
  deleteCalendar?: any;
  addAlarm?: any;
  removeAlarm?: any;
  openTimezoneModal: any;
  timezoneModalIsOpen: boolean;
  selectTimezone: any;
}
const CalendarContentView = (props: CalendarContentViewProps) => {
  const {
    goBack,
    calendarState,
    handleChange,
    colorModalIsOpen,
    toggleColorModal,
    handleColorClick,
    saveCalendar,
    deleteCalendar,
    addAlarm,
    removeAlarm,
    openTimezoneModal,
    timezoneModalIsOpen,
    selectTimezone,
  } = props;

  const { id, timezone, alarms, name, color } = calendarState;

  const [store] = useContext(Context);
  const { isDark, isMobile } = store;

  const defaultCalendar: string = useSelector(
    (state: any) => state.defaultCalendar
  );

  return (
    <>
      <HeaderModal
        onClose={goBack}
        handleSave={saveCalendar}
        hasHeaderShadow={true}
        title={'Calendar'}
        handleDelete={defaultCalendar !== id ? deleteCalendar : null}
        icons={[]}
        isDark={isDark}
        isMobile={isMobile}
      />
      <div className={'event_detail__wrapper'} style={{ padding: 0 }}>
        <div className={parseCssDark('event_detail__row', isDark)}>
          <div className={'event_detail__container--icon'}>
            <CalendarIcon className={'event_detail__icon--hidden'} />
          </div>
          <Input
            className={parseCssDark('event_detail__input', isDark)}
            name={'name'}
            value={name}
            placeholder={'Type calendar name'}
            autoComplete={false}
            autoFocus={true}
            onChange={handleChange}
            multiline={false}
            isDark={isDark}
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
        <TimezoneRow
          timezone={timezone}
          openTimezoneModal={openTimezoneModal}
        />
        {/*<NotificationSettings*/}
        {/*  notifications={reminders}*/}
        {/*  addNotification={addNotification}*/}
        {/*  removeNotification={removeNotification}*/}
        {/*/>*/}
      </div>
      {timezoneModalIsOpen ? (
        <Modal isDark={isDark}>
          <TimeZonePicker
            selectTimezone={selectTimezone}
            onClose={() => openTimezoneModal(false)}
          />
        </Modal>
      ) : null}
      <ModalSmall
        isOpen={colorModalIsOpen}
        isDark={isDark}
        handleClose={() => toggleColorModal(false)}
      >
        {renderCalendarColors(handleColorClick, isDark)}
      </ModalSmall>
    </>
  );
};

interface CalendarContentProps {
  addAlarm: any;
  removeAlarm: any;
  deleteCalendar?: any;
  calendarState: any;
  saveCalendar: any;
  handleChange: any;
  setLocalState: any;
}
const CalendarContent = (props: CalendarContentProps) => {
  const {
    addAlarm,
    removeAlarm,
    deleteCalendar,
    calendarState,
    saveCalendar,
    handleChange,
    setLocalState,
  } = props;

  const [colorModalIsOpen, openColorModal] = useState(false);
  const [timezoneModalIsOpen, openTimezoneModal] = useState(false);

  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const selectTimezone = (value: string) => {
    setLocalState('timezone', value);
  };

  const selectColor = (colorValue: string) => {
    setLocalState('color', colorValue);
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
      toggleColorModal={toggleColorModal}
      colorModalIsOpen={colorModalIsOpen}
      handleColorClick={handleColorClick}
      addAlarm={addAlarm}
      removeAlarm={removeAlarm}
      deleteCalendar={deleteCalendar}
      calendarState={calendarState}
      saveCalendar={saveCalendar}
      handleChange={handleChange}
      openTimezoneModal={openTimezoneModal}
      timezoneModalIsOpen={timezoneModalIsOpen}
      selectTimezone={selectTimezone}
    />
  );
};

export default CalendarContent;
