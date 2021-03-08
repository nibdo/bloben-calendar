/* tslint:disable:no-magic-numbers */
import { setSelectedDate } from '../../redux/actions';
import { DateTime } from 'luxon';
import {
  CALENDAR_3DAYS_VIEW,
  CALENDAR_DAY_VIEW,
  CALENDAR_MONTH_VIEW,
  CALENDAR_WEEK_VIEW,
} from '../../utils/contants';
import { CalendarView } from '../../types/types';
import { LuxonHelper } from 'bloben-utils';
import { reduxStore } from 'bloben-module/layers/ReduxProvider';

const ONE_DAY = 1;
const THREE_DAYS = 3;
const SEVEN_DAYS = 7;
export const CALENDAR_OFFSET_LEFT = 24;
export const ONE_HOUR_HEIGHT = 39;
export const HEADER_HEIGHT_SMALL = 56;
export const HEADER_HEIGHT_BASE = 156;
export const HEADER_HEIGHT_BASE_DESKTOP = 235;
export const HEADER_HEIGHT_EXTENDER = 166;
export const NAVBAR_HEIGHT_BASE = 50;
export const CALENDAR_DRAWER_DESKTOP_WIDTH = 247;

export const formatIsoStringDate = (stringDate: string) =>
  stringDate.slice(0, stringDate.indexOf('T'));

export const hoursArray = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
];

export const hoursArrayString = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
];

export const parseEventColor = (
  colorString: string,
  isDark?: boolean
): string => calendarColors[colorString][isDark ? 'dark' : 'light'];

export const calendarColors: any = {
  red: { dark: '#ef9a9a', light: '#e53935' },
  pink: { dark: '#f48fb1', light: '#d81b60' },
  purple: { dark: '#ce93d8', light: '#8e24aa' },
  'deep purple': { dark: '#b39ddb', light: '#5e35b1' },
  indigo: { dark: '#9fa8da', light: '#3949ab' },
  blue: { dark: '#90caf9', light: '#1e88e5' },
  'light blue': { dark: '#81d4fa', light: '#039be5' },
  cyan: { dark: '#80deea', light: '#00acc1' },
  teal: { dark: '#80cbc4', light: '#00897b' },
  green: { dark: '#a5d6a7', light: '#43a047' },
  'light green': { dark: '#c5e1a5', light: '#7cb342' },
  yellow: { dark: '#fff59d', light: '#fdd835' },
  amber: { dark: '#ffe082', light: '#ffb300' },
  orange: { dark: '#ffcc80', light: '#fb8c00' },
  'deep orange': { dark: '#ffab91', light: '#f4511e' },
  brown: { dark: '#bcaaa4', light: '#6d4c41' },
  'blue grey': { dark: '#b0bec5', light: '#546e7a' },
};

export const daysText = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const getOneDay = (
  date: DateTime,
  isGoingForward?: boolean | null
): DateTime[] => {
  let refDate: DateTime;

  if (isGoingForward === null) {
    refDate = date;
  } else if (isGoingForward) {
    refDate = date.plus({ days: 1 });
  } else {
    refDate = date.minus({ days: 1 });
  }

  // Set state
  reduxStore.dispatch(setSelectedDate(refDate));

  return [refDate];
};

export const getMonthDays = (
  date: DateTime,
  isGoingForward?: boolean | null,
  isCurrent?: boolean
) => {
  const FIVE_WEEKS_DAYS_COUNT = 36;
  // Get reference date for calculating new month

  const refDate: DateTime =
    isGoingForward === null
      ? date
      : isGoingForward
      ? date.plus({ days: 15 })
      : date.minus({ days: 15 });

  // Get first week of current month
  const firstDayOfCurrentMonth: DateTime = LuxonHelper.getFirstDayOfMonth(date);

  const firstWeekOfCurrentMonth: DateTime[] = getWeekDays(
    firstDayOfCurrentMonth
  );

  const monthDays: DateTime[] = firstWeekOfCurrentMonth;

  // Add missing days to month view
  for (let i = 1; i < FIVE_WEEKS_DAYS_COUNT; i += 1) {
    const day: DateTime = firstWeekOfCurrentMonth[6].plus({ days: i });
    monthDays.push(day);
  }

  // Set state
  if (isCurrent) {
    reduxStore.dispatch(setSelectedDate(monthDays[15]));
  }

  return monthDays;
};

export const getWeekDays = (
  date: DateTime,
  isGoingForward?: boolean | null
): DateTime[] => {
  // Get reference date for calculating new week
  const dateForNewWeek: any =
    isGoingForward !== null
      ? isGoingForward
        ? date.plus({ days: 1 })
        : date.minus({ days: 1 })
      : date;

  // Set state
  if (reduxStore.getState().calendarView !== CALENDAR_MONTH_VIEW) {
    reduxStore.dispatch(setSelectedDate(dateForNewWeek));
  }

  const days = [];
  const dayInWeek = dateForNewWeek.weekday;
  const startDate = dateForNewWeek.minus({ days: dayInWeek - 1 });

  if (reduxStore.getState().calendarView === CALENDAR_MONTH_VIEW) {
    if (dayInWeek === 0) {
      for (let i = 6; i > 0; i--) {
        days.push(dateForNewWeek.minus({ days: i }));
      }
      days.push(dateForNewWeek);
    } else {
      days.push(startDate);
      for (let i = 1; i < 7; i++) {
        days.push(startDate.plus({ days: i }));
      }
    }
  } else {
    for (let i = 0; i < 7; i++) {
      days.push(startDate.plus({ days: i }));
    }
  }

  return days;
};

export const getThreeDays = (
  date: DateTime,
  isGoingForward?: boolean | null
): DateTime[] => {
  const days = [];

  if (isGoingForward === null) {
    for (let i = 0; i <= 2; i++) {
      days.push(date.plus({ days: i }));
    }
  } else if (isGoingForward) {
    for (let i = 1; i <= 3; i++) {
      days.push(date.plus({ days: i }));
    }
  } else {
    for (let i = 3; i > 0; i--) {
      days.push(date.minus({ days: i }));
    }
  }

  // Set state
  reduxStore.dispatch(setSelectedDate(days[1]));

  return days;
};

export const getCalendarDays = (
  calendarView: string,
  date: DateTime,
  isGoingForward?: boolean | null,
  isCurrent?: boolean
): DateTime[] => {
  switch (calendarView) {
    case CALENDAR_WEEK_VIEW:
      return getWeekDays(date, isGoingForward);
    case CALENDAR_3DAYS_VIEW:
      return getThreeDays(date, isGoingForward);
    case CALENDAR_DAY_VIEW:
      return getOneDay(date, isGoingForward);
    case CALENDAR_MONTH_VIEW:
      return getMonthDays(date, isGoingForward, isCurrent);
    default:
      return getWeekDays(date, isGoingForward);
  }
};

export const getDaysNum = (calendarView: CalendarView): number => {
  switch (calendarView) {
    case CALENDAR_WEEK_VIEW:
      return SEVEN_DAYS;
    case CALENDAR_3DAYS_VIEW:
      return THREE_DAYS;
    case CALENDAR_DAY_VIEW:
      return ONE_DAY;
    default:
      return SEVEN_DAYS;
  }
};

export const mapCalendarColors = (calendars: any) => {
  const result: any = {};
  for (const calendar of calendars) {
    result[calendar.id] = {
      color: {
        light: calendar.color.light,
        dark: calendar.color.dark,
      },
    };
  }

  return result;
};

export const parseToDate = (item: string | DateTime): DateTime =>
  typeof item === 'string' ? DateTime.fromISO(item) : item;

export const parseDateToString = (item: string | DateTime): string =>
  typeof item === 'string' ? item : item.toString();

export const checkIfSwipingForward = (
  oldIndex: number,
  newIndex: number
): boolean =>
  (oldIndex === 0 && newIndex === 1) ||
  (oldIndex === 1 && newIndex === 2) ||
  (oldIndex === 2 && newIndex === 0);

export const chooseSelectedDateIndex = (calendarView: CalendarView): number => {
  switch (calendarView) {
    case CALENDAR_MONTH_VIEW:
      return 15;
    case CALENDAR_WEEK_VIEW:
      return 2;
    case CALENDAR_3DAYS_VIEW:
      return 0;
    case CALENDAR_DAY_VIEW:
      return 0;
    default:
      return 2;
  }
};
