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

interface ICalendarColorProps {
  color: any;
  isDark: boolean;
  onClick: any;
}
const CalendarColor = (props: ICalendarColorProps) => {
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
  addNotification?: any;
  removeNotification?: any;
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
    addNotification,
    removeNotification,
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

interface ICalendarContentProps {
  selectColor: any;
  addNotification: any;
  removeNotification: any;
  deleteCalendar?: any;
  calendarId?: string;
  calendarState: any;
  saveCalendar: any;
  handleChange: any;
  reminders: any;
}
const CalendarContent = (props: ICalendarContentProps) => {
  const {
    selectColor,
    addNotification,
    removeNotification,
    deleteCalendar,
    calendarId,
    calendarState,
    saveCalendar,
    handleChange,
  } = props;

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
      toggleColorModal={toggleColorModal}
      colorModalIsOpen={colorModalIsOpen}
      handleColorClick={handleColorClick}
      addNotification={addNotification}
      removeNotification={removeNotification}
      deleteCalendar={deleteCalendar}
      calendarId={calendarId}
      calendarState={calendarState}
      saveCalendar={saveCalendar}
      handleChange={handleChange}
    />
  );
};

export default CalendarContent;
