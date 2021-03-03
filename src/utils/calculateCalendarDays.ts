import { getCalendarDays } from '../components/calendarView/calendar-common';
import { getArrayEnd, getArrayStart } from './common';
import { CalendarDays, CalendarView } from '../types/types';

export const calculateCalendarDays = (
  nextIndex: number,
  isGoingForward: boolean,
  calendarDays: CalendarDays,
  calendarView: CalendarView
): CalendarDays => {
  if (isGoingForward) {
    switch (nextIndex) {
      case 0:
        return [
          calendarDays[0],
          getCalendarDays(
            calendarView,
            getArrayEnd(calendarDays[0]),
            isGoingForward
          ),
          calendarDays[2],
        ];
      case 1:
        return [
          calendarDays[0],
          calendarDays[1],
          getCalendarDays(
            calendarView,
            getArrayEnd(calendarDays[1]),
            isGoingForward
          ),
        ];
      case 2:
        return [
          getCalendarDays(
            calendarView,
            getArrayEnd(calendarDays[2]),
            isGoingForward
          ),
          calendarDays[1],
          calendarDays[2],
        ];
      default:
        return calendarDays;
    }
  } else {
    switch (nextIndex) {
      case 0:
        return [
          calendarDays[0],
          calendarDays[1],
          getCalendarDays(
            calendarView,
            getArrayStart(calendarDays[0]),
            isGoingForward
          ),
        ];
      case 1:
        return [
          getCalendarDays(
            calendarView,
            getArrayStart(calendarDays[1]),
            isGoingForward
          ),
          calendarDays[1],
          calendarDays[2],
        ];
      case 2:
        // 0 1 2
        return [
          calendarDays[0],
          getCalendarDays(
            calendarView,
            getArrayStart(calendarDays[2]),
            isGoingForward
          ),
          calendarDays[2],
        ];
      default:
        return calendarDays;
    }
  }
};

export const getNextCalendarDaysIndex = (
  isGoingForward: boolean,
  calendarDaysCurrentIndex: number
): number => {
  if (isGoingForward) {
    switch (calendarDaysCurrentIndex) {
      case 0:
        return 1;
      case 1:
        return 2;
      case 2:
        return 0;
      default:
        return 2;
    }
  }

  switch (calendarDaysCurrentIndex) {
    case 0:
      return 2;
    case 1:
      return 0;
    case 2:
      return 1;
    default:
      return 0;
  }
};
