import CalendarApi from '../api/calendar';
import {
  addDays,
  differenceInCalendarDays,
  formatISO,
  getDate,
  getISODay,
  getMonth,
  getYear,
  isDate, parseISO,
  subDays,
} from 'date-fns';
import { reduxStore } from '../bloben-package/layers/ReduxLayer';
import {  setIsAppStarting } from '../redux/actions';
import { decryptEvents } from './decrypt-events';

const DAYS_IN_WEEK: number = 7;

export const getDayStart = (date: Date): Date => {
  const baseYear: any = getYear(date);
  const baseMonth: any = getMonth(date);
  const baseDay: any = getDate(date);

  return new Date(baseYear, baseMonth, baseDay, 0, 0);
};

export const getDayEnd = (date: Date): Date => {
  const baseYear: any = getYear(date);
  const baseMonth: any = getMonth(date);
  const baseDay: any = getDate(date);

  return new Date(baseYear, baseMonth, baseDay, 23, 59);
};

const preloadWeekData = async (
  customRangeFrom: any | null,
  customRangeTo: any | null
) => {
  const dateNow: Date = new Date();
  const dateStart: Date = getDayStart(
    customRangeFrom ? customRangeFrom : dateNow
  );
  const dateEnd: Date = getDayEnd(customRangeTo ? customRangeTo : dateNow);

  const dateNowInWeek: number = getISODay(dateStart);
  const rangeFrom: string = formatISO(subDays(
    dateStart,
    DAYS_IN_WEEK - dateNowInWeek
  ));
  const rangeTo: string = formatISO(addDays(
    dateEnd,
    DAYS_IN_WEEK - dateNowInWeek + DAYS_IN_WEEK + 1
  ));

  const dateStart2: Date = getDayStart(new Date(rangeFrom));

  const serverData: any = await CalendarApi.getEvents(
    `?rangeFrom=${rangeFrom}&rangeTo=${rangeTo}`
  );

  return serverData.data;
};

const fetchEvents = async (rangeFrom: any, rangeTo: any) => {
  const rangeFromParsed: string = isDate(rangeFrom)
    ? formatISO(rangeFrom)
    : rangeFrom;
  const rangeToParsed: string = isDate(rangeTo)
    ? formatISO(rangeTo)
    : rangeTo;

  const serverData: any = await CalendarApi.getEvents(
    `?rangeFrom=${rangeFromParsed}&rangeTo=${rangeToParsed}`
  );

  return serverData.data;
};

const getDaysFromRange = (rangeFrom: any, rangeTo: any) => {
  const result: any = [];
  const parsedFrom: Date = parseISO(rangeFrom);
  const parsedTo: Date = parseISO(rangeTo);
  const daysBetween: number = differenceInCalendarDays(parsedTo, parsedFrom);
  for (let i = 0; i <= daysBetween; i += 1) {
    result.push(addDays(parsedFrom, i));
  }

  return result;
};

export const getEvents = async (
  rangeStart: Date,
  rangeTo: Date
) => {
  const store: any = reduxStore.getState();
  const cryptoPassword: any = store.cryptoPassword;

  const data: any = await CalendarApi.getEvents(
      `?rangeFrom=${formatISO(rangeStart)}&rangeTo=${formatISO(rangeTo)}`
  );

  const eventsResult: any = {};
  //
  // switch (calendarView) {
  //   case 'week':
  //     dataset = await preloadWeekData(rangeStart, rangeTo);
  //   default:
  //     dataset = await preloadWeekData(rangeStart, rangeTo);
  // }

  // Add days from range to state (for Agenda View)
  // const allDays: any = getDaysFromRange(rangeStart, rangeTo);
  const agendaDays: any = [];

  const result: any = await decryptEvents(data.data);

  reduxStore.dispatch(setIsAppStarting(false))

  // TODO add to cache??
};
