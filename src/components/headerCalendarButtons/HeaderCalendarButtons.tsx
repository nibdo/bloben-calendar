import React, { useContext } from 'react';
import './HeaderCalendarButtons.scss';
import { ButtonBase } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { setCalendarView } from '../../redux/actions';
import { parseCssDark } from 'bloben-react';
import { CalendarView, ReduxState } from '../../types/types';
import { Dispatch } from 'redux';
import { Context } from 'bloben-module/context/store';

interface HeaderCalendarButtonProps {
  text: string;
}
const HeaderCalendarButton = (props: HeaderCalendarButtonProps) => {
  const { text } = props;

  const dispatch: Dispatch = useDispatch();

  const [store] = useContext(Context);
  const { isDark } = store;

  const calendarView: CalendarView = useSelector(
    (state: ReduxState) => state.calendarView
  );
  const textFormatted: string = text.replace(' ', '').toUpperCase();
  const isSelected: boolean = textFormatted === calendarView;
  const buttonClassName = `header_calendar_button${
    isSelected ? '-selected' : ''
  }`;
  const textClassName = `header_calendar_button-text${
    isSelected ? '-selected' : ''
  }`;

  const navigateFunction = (): void => {
    dispatch(setCalendarView(textFormatted as CalendarView));
  };

  return (
    <ButtonBase
      className={parseCssDark(buttonClassName, isDark)}
      onClick={navigateFunction}
    >
      <p className={parseCssDark(textClassName, isDark)}>{text}</p>
    </ButtonBase>
  );
};

/**
 * Buttons for switching calendar view in desktop layout
 * @constructor
 */
const HeaderCalendarButtons = () => {
  const [store] = useContext(Context);

  const { isDark } = store;

  return (
    <div className={parseCssDark('header_calendar_buttons__container', isDark)}>
      <HeaderCalendarButton text={'Agenda'} />
      <HeaderCalendarButton text={'Day'} />
      <HeaderCalendarButton text={'3 Days'} />
      <HeaderCalendarButton text={'Week'} />
      <HeaderCalendarButton text={'Month'} />
    </div>
  );
};

export default HeaderCalendarButtons;
