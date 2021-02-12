import React, { useContext, useState } from 'react';
import './CalendarContent.scss';
import { useHistory, useParams } from 'react-router';
import { ButtonBase } from '@material-ui/core';
import EvaIcons from 'bloben-common/components/eva-icons';
import ModalSmall from '../../../bloben-package/components/modalSmall/ModalSmall';
import CalendarIcon from '@material-ui/icons/DateRange';
import {
  calendarColors,
  parseEventColor,
} from '../../../components/calendarView/calendar-common';
import { useSelector } from 'react-redux';
import { Input } from '../../../bloben-package/components/input/Input';
import HeaderModal from '../../../bloben-package/components/headerModal/HeaderModal';
import { Context } from '../../../bloben-package/context/store';
import { parseCssDark } from '../../../bloben-common/utils/common';
import Modal from '../../../bloben-package/components/modal/Modal';
import TimeZonePicker from '../../../bloben-package/components/timezonePicker/TimeZonePicker';
import TimezoneRow from '../../../bloben-package/components/timezoneRow/TimezoneRow';


interface ICalendarColorProps {
  color: any;
  isDark: boolean;
  onClick: any;
}
const CalendarColor = (props: ICalendarColorProps) => {
  const { color, isDark, onClick } = props;

  const calendarColor: any = parseEventColor(color, isDark);

  return (
    <ButtonBase className={parseCssDark('event_detail__row', isDark)} onClick={onClick}>
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

interface ICalendarContentViewProps {
  goBack: any;
  calendarState: any;
  handleChange: any;
  colorModalIsOpen: boolean;
  toggleColorModal: any;
  handleColorClick: any;
  saveCalendar: any;
  deleteCalendar?: any;
  calendarId?: string;
  addAlarm?: any;
  removeAlarm?: any;
  openTimezoneModal: any;
  timezoneModalIsOpen: boolean;
  selectTimezone: any;
  timezone: string;
}
const CalendarContentView = (props: ICalendarContentViewProps) => {
  const {
    goBack,
    calendarState,
    handleChange,
    colorModalIsOpen,
    toggleColorModal,
    handleColorClick,
    saveCalendar,
    deleteCalendar,
    calendarId,
    addAlarm,
    removeAlarm,
    openTimezoneModal,
    timezoneModalIsOpen,
    selectTimezone,
    timezone
  } = props;

  const { name, color } = calendarState;

  const [store] = useContext(Context);
  const { isDark } = store;

  const defaultCalendar: string = useSelector(
    (state: any) => state.defaultCalendar
  );

  return (
    <div>
      <HeaderModal
          onClose={goBack}
        handleSave={saveCalendar}
        hasHeaderShadow={true}
        title={'Calendar'}
        handleDelete={defaultCalendar !== calendarId ? deleteCalendar : null}
        icons={[]}
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
            // onBlur={handleBlur}
            multiline={false}
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
        <TimezoneRow timezone={timezone} openTimezoneModal={openTimezoneModal} />
        {/*<NotificationSettings*/}
        {/*  notifications={reminders}*/}
        {/*  addNotification={addNotification}*/}
        {/*  removeNotification={removeNotification}*/}
        {/*/>*/}
      </div>
      {timezoneModalIsOpen
          ? <Modal>
            <TimeZonePicker
                selectTimezone={selectTimezone}
                onClose={() => openTimezoneModal(false)}/>
            </Modal>
          : null
      }
      <ModalSmall
        isOpen={colorModalIsOpen}
        handleClose={() => toggleColorModal(false)}
      >
        {renderCalendarColors(handleColorClick, isDark)}
      </ModalSmall>
    </div>
  );
};

interface ICalendarContentProps {
  selectColor: any;
  timezone: string;
  addAlarm: any;
  removeAlarm: any;
  deleteCalendar?: any;
  calendarId?: string;
  calendarState: any;
  saveCalendar: any;
  handleChange: any;
  alarms: any;
  isNewCalendar: boolean;
  selectTimezone: any;
}
const CalendarContent = (props: ICalendarContentProps) => {
  const {
    selectColor,
    addAlarm,
    removeAlarm,
    deleteCalendar,
    calendarId,
    calendarState,
    saveCalendar,
    handleChange,
    timezone,
    isNewCalendar,
    selectTimezone
  } = props;

  const [colorModalIsOpen, openColorModal] = useState(false);
  const [timezoneModalIsOpen, openTimezoneModal] = useState(false);

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
      toggleColorModal={toggleColorModal}
      colorModalIsOpen={colorModalIsOpen}
      handleColorClick={handleColorClick}
      addAlarm={addAlarm}
      removeAlarm={removeAlarm}
      deleteCalendar={deleteCalendar}
      calendarId={calendarId}
      calendarState={calendarState}
      saveCalendar={saveCalendar}
      handleChange={handleChange}
      openTimezoneModal={openTimezoneModal}
      timezoneModalIsOpen={timezoneModalIsOpen}
      selectTimezone={selectTimezone}
      timezone={timezone}
    />
  );
};

export default CalendarContent;
