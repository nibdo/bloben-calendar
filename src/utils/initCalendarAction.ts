import { Dispatch } from 'redux';

// Action creator
// Setup base calendar days and reset it's index
import { CalendarDays, InitCalendarDaysAction } from '../types/types';
import {
  resetCalendarDaysCurrentIndex,
  setCalendarDays,
} from '../redux/actions';
import { initCalendarDays } from './initCalendarDays';

export const initCalendarAction = (
  dispatch: Dispatch,
  data: InitCalendarDaysAction
) => {
  const calendarDays: CalendarDays = initCalendarDays(
    data.calendarView,
    data.date
  );

  dispatch(resetCalendarDaysCurrentIndex());
  dispatch(setCalendarDays(calendarDays));
};
