import { DateTime } from 'luxon';

import { CalendarDays } from '../../types/types';

const dummyCalendarDaysArray: DateTime[] = [DateTime.local()];

const initState: CalendarDays = [
  dummyCalendarDaysArray,
  dummyCalendarDaysArray,
  dummyCalendarDaysArray,
];

const calendarDays = (state: CalendarDays = initState, action: any) => {
  switch (action.type) {
    case 'SET_CALENDAR_DAYS':
      return action.payload;
    default:
      return state;
  }
};

export default calendarDays;
