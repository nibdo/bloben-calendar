import { DateTime } from 'luxon';

import { getCalendarDays } from '../components/calendarView/calendar-common';
import { getArrayEnd, getArrayStart } from './common';
import { CalendarDays, CalendarView } from '../types/types';

export const initCalendarDays = (
  calendarView: CalendarView,
  date: DateTime
): CalendarDays => {
  const calendarDaysNew: DateTime[] = getCalendarDays(
    calendarView,
    date,
    null,
    true
  );

  const calendarDaysPrevNew: DateTime[] = getCalendarDays(
    calendarView,
    getArrayStart(calendarDaysNew),
    false
  );

  const calendarDaysNextNew: DateTime[] = getCalendarDays(
    calendarView,
    getArrayEnd(calendarDaysNew),
    true
  );

  return [calendarDaysPrevNew, calendarDaysNew, calendarDaysNextNew];
};
