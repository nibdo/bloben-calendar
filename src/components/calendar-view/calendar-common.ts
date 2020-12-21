import {
  addDays, addMonths,
  format, formatISO,
  getDay,
  getMonth,
  getYear, lastDayOfMonth,
  parseISO,
  subDays, subMonths,
} from 'date-fns';
import { reduxStore } from '../../App';
import { setSelectedDate } from '../../redux/actions';

const ONE_DAY: number = 1;
const THREE_DAYS: number = 3;
const SEVEN_DAYS: number = 7;
export const CALENDAR_OFFSET_LEFT: number = 24;
export const ONE_HOUR_HEIGHT: number = 39;
export const HEADER_HEIGHT_SMALL: number = 56;
export const HEADER_HEIGHT_BASE: number = 156;
export const HEADER_HEIGHT_BASE_DESKTOP: number = 200;
export const HEADER_HEIGHT_EXTENDER: number = 166;
export const NAVBAR_HEIGHT_BASE: number = 50;
export const CALENDAR_DRAWER_DESKTOP_WIDTH: number = 247;

export const formatTimestampToDate = (dateObj: Date) =>
   format(dateObj, 'dd-MM-yyyy')

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

export const parseEventColor = (colorString: string, isDark: boolean): string =>
    calendarColors[colorString][isDark ? 'dark' : 'light'];

export const calendarColors: any = {
  'red': { dark: '#ef9a9a', light: '#e53935' },
  'pink': { dark: '#f48fb1', light: '#d81b60' },
  'purple': { dark: '#ce93d8', light: '#8e24aa' },
  'deep purple': { dark: '#b39ddb', light: '#5e35b1' },
  'indigo': { dark: '#9fa8da', light: '#3949ab' },
  'blue': { dark: '#90caf9', light: '#1e88e5' },
  'light blue': { dark: '#81d4fa', light: '#039be5' },
  'cyan': { dark: '#80deea', light: '#00acc1' },
  'teal': { dark: '#80cbc4', light: '#00897b' },
  'green': { dark: '#a5d6a7', light: '#43a047' },
  'light green': { dark: '#c5e1a5', light: '#7cb342' },
  'yellow': { dark: '#fff59d', light: '#fdd835' },
  'amber': { dark: '#ffe082', light: '#ffb300' },
  'orange': { dark: '#ffcc80', light: '#fb8c00' },
  'deep orange': { dark: '#ffab91', light: '#f4511e' },
  'brown': { dark: '#bcaaa4', light: '#6d4c41' },
  'blue grey': { dark: '#b0bec5', light: '#546e7a' },
};

export const daysText = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const getCustomDaysText = (days: any) => {
  const daysText = [];
  for (const day of days) {
    daysText.push(format(day, 'iiiiii'));
  }

  return daysText;
};

const getOneDay = (date: Date, isGoingForward?: boolean | null): Date[] => {
  let refDate: Date;

  if (isGoingForward === null) {
    refDate = date;
  } else if (isGoingForward) {
    refDate = addDays(date, 1)
  } else {
    refDate = subDays(date, 1)
  }

  // Set state
  reduxStore.dispatch(setSelectedDate(refDate));

  return [refDate];
}

const getMonthDays = (refDate: Date, isGoingForward?: boolean | null, isCurrent?: boolean) => {
  const FIVE_WEEKS_DAYS_COUNT: number = 35;

  // Get reference date for calculating new month
  // const refDate: any = isGoingForward ? addDays(date, 15) : subDays(date, 15)


  // Get last week of previous month
  const lastDayOfPrevMonth: Date = lastDayOfMonth(subMonths(refDate, 1));
  const lastWeekOfPrevMonth: Date[] = getWeekDays(lastDayOfPrevMonth)

  // Get first week of next month
  const nextMonth: Date = addMonths(refDate, 1);
  const firstDayOfNextMonth: Date = new Date(getYear(nextMonth), getMonth(nextMonth), 1);
  const firstWeekOfNextMonth: Date[] = getWeekDays(firstDayOfNextMonth)

  // Get first week of current month
  const firstDayOfCurrentMonth: Date = new Date(getYear(refDate), getMonth(refDate), 1);
  const firstWeekOfCurrentMonth: Date[] = getWeekDays(firstDayOfCurrentMonth)

  // Set state
  if (isCurrent) {
    reduxStore.dispatch(setSelectedDate(firstWeekOfCurrentMonth[6]));
  }

  const monthDays: Date[] = firstWeekOfCurrentMonth;

  // Add missing days to month view
  for (let i = 0; i < FIVE_WEEKS_DAYS_COUNT; i += 1) {
    monthDays.push(addDays(firstWeekOfCurrentMonth[firstWeekOfCurrentMonth.length - 1], 1));
  }

  return monthDays;
};

export const getWeekDays = (date: Date, isGoingForward?: boolean | null): Date[] => {

  // Get reference date for calculating new week
  const dateForNewWeek: any = isGoingForward !== null
      ? isGoingForward ? addDays(date, 1)
          : subDays(date, 1)
      : date;

  // Set state
  reduxStore.dispatch(setSelectedDate(dateForNewWeek));

  const days = [];
  const dayInWeek = getDay(dateForNewWeek);
  const startDate = subDays(dateForNewWeek, dayInWeek - 1);

  if (dayInWeek === 0) {
    for (let i = 6; i > 0; i--) {
      days.push(subDays(dateForNewWeek, i));
    }
    days.push(dateForNewWeek);
  } else {
    days.push(startDate);
    for (let i = 1; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
  }

  return days;
};

export const getThreeDays = (date: Date, isGoingForward?: boolean | null): Date[] => {
  const days = [];

  if (isGoingForward === null) {
    for (let i = 0; i <= 2; i++) {
      days.push(addDays(date, i));
    }
  } else if (isGoingForward) {
    for (let i = 1; i <= 3; i++) {
      days.push(addDays(date, i));
    }
  } else {
    for (let i = 3; i > 0; i--) {
      days.push(subDays(date, i));
    }
  }

  // Set state
  reduxStore.dispatch(setSelectedDate(days[1]));

  return days;
};

export const getCalendarDays = (
  calendarView: string,
  date: any,
  isGoingForward?: boolean | null,
  isCurrent?: boolean
): Date[] => {
  switch (calendarView) {
    case 'week':
      return getWeekDays(date, isGoingForward);
    case '3days':
      return getThreeDays(date, isGoingForward);
    case 'day':
      return getOneDay(date, isGoingForward);
    case 'month':
      return getMonthDays(date, isGoingForward, isCurrent);
    default:
      return getMonthDays(date, isGoingForward, isCurrent);
  }

};

export const getDaysNum = (calendarView: string): number => {
  switch (calendarView) {
    case 'week':
      return SEVEN_DAYS;
    case '3days':
      return THREE_DAYS;
    case 'day':
      return ONE_DAY;
    default:
      return SEVEN_DAYS;
  }
};

export const parseStringToDate = (stringDate: string): Date => {
  const dateArray: any = stringDate.split('-');

  return new Date(
    Number(dateArray[2]),
    Number(dateArray[1] - 1),
    Number(dateArray[0])
  );
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

export const parseToDate = (item: string | Date): Date =>
    typeof item === 'string' ? parseISO(item) : item;

export const parseDateToString = (item: string | Date): string =>
    typeof item === 'string' ? item : formatISO(item);

export const checkIfSwipingForward = (oldIndex: number, newIndex: number): boolean =>
    oldIndex === 0 && newIndex === 1
    || oldIndex === 1 && newIndex === 2
    || oldIndex === 2 && newIndex === 0;

export const chooseSelectedDateIndex = (calendarView: string): number => {
  switch (calendarView) {
    case 'month':
      return 15;
    case 'week':
      return 2;
    case '3days':
      return 0;
    case 'day':
      return 0;
    default:
      return 0;
  }
};
