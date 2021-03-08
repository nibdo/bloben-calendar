import _ from 'lodash';
import { ReduxState, TCalendarAlarmType } from '../types/types';
import { v4 } from 'uuid';
import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';
import { setEvents } from '../redux/actions';
import { DateTime } from 'luxon';
// @ts-ignore
import Interval from 'luxon/src/interval.js';
import { reduxStore } from 'bloben-module/layers/ReduxProvider';
import {
  EventDecrypted,
  formatTimestampToDate,
  LuxonHelper,
} from 'bloben-utils';
import { parseToDateTime } from 'bloben-utils/dates/datetimeParser';

export const mapTags = (tags: any) => {
  const tagsObj: any = {};

  for (const tag of tags) {
    const { id } = tag;
    // Check if is in tagsObj
    if (!tagsObj[id]) {
      tagsObj[id] = tag;
    }
  }

  return tagsObj;
};

export const getArrayStart = (array: any) => array[0];
export const getArrayEnd = (array: any) => array[array.length - 1];

export const cloneDeep = (obj: any): any => _.cloneDeep(obj);

export const findInArrayById = (array: any, id: string): any =>
  new Promise((resolve) => {
    if (!array || array.length === 0) {
      resolve(false);
    }

    for (let i = 0; i < array.length; i += 1) {
      if (array[i].id === id) {
        resolve(array[i]);
      }

      // Handle loop end
      if (i + 1 === array.length) {
        resolve(false);
      }
    }
  });

export const findInState = (item: any, stateString: any) =>
  new Promise((resolve) => {
    const store: any = reduxStore.getState();
    const dataState: any = store[stateString];
    if (!dataState) {
      resolve(false);
    }

    if (dataState.length > 0) {
      dataState.forEach((stateItem: any, index: number) => {
        if (stateItem.id === item.id) {
          resolve(stateItem);
        } else {
          if (index + 1 === dataState.length) {
            resolve(false);
          }
        }
      });
    } else {
      resolve(false);
    }
  });

export const findInEvents = (id: string): Promise<EventDecrypted | null> =>
  new Promise((resolve) => {
    const store: ReduxState = reduxStore.getState();
    const dataState: EventDecrypted[] = store.events;
    if (dataState) {
      for (const [key, value] of Object.entries(dataState)) {
        const dayEvents: any = value;
        for (const event of dayEvents) {
          const eventObj: EventDecrypted = event;
          if (eventObj.id === id) {
            resolve(eventObj);
          }
        }
      }
      resolve(null);
    } else {
      resolve(null);
    }
  });

const removeFromArray = (item: any, array: any) =>
  new Promise((resolve) => {
    const result: any = [];

    if (array.length === 0) {
      resolve(result);
    }

    // Loop over all results
    for (let i = 0; i < array.length; i++) {
      const arrayItem: any = array[i];

      // Found match
      if (arrayItem.id === item.id) {
        // Push new item
      } else {
        // Push other items
        result.push(arrayItem);
      }

      if (i + 1 === array.length) {
        resolve(result);
      }
    }
  });

export const handleEventReduxUpdate = async (
  prevItem: any,
  newItem: EventDecrypted
) => {
  const store: ReduxState = reduxStore.getState();
  const stateClone: any = cloneDeep(store.events);

  const result: any = {};

  if (!stateClone) {
    result[getDateKey(newItem)] = [newItem];
  }

  // Handle simple event updates without repeats
  if (!prevItem.isRepeated) {
    // Find previous item and delete it
    stateClone[getDateKey(prevItem)] = await removeFromArray(
      prevItem,
      stateClone[getDateKey(prevItem)]
    );
    // Save updated version
    stateClone[getDateKey(newItem)].push(newItem);
  }

  reduxStore.dispatch(setEvents(stateClone));
};
export const getDateKey = (event: EventDecrypted): string =>
  formatTimestampToDate(event.startAt);

export const handleEventReduxDelete = async (
  prevItem: any,
  newItem?: EventDecrypted
) => {
  const store: any = reduxStore.getState();
  const stateClone: any = cloneDeep(store.events);

  // Handle simple event delete without repeats
  if (!prevItem.isRepeated) {
    // Find previous item and delete it
    stateClone[getDateKey(prevItem)] = await removeFromArray(
      prevItem,
      stateClone[getDateKey(prevItem)]
    );
  }

  reduxStore.dispatch(setEvents(stateClone));
};

export const addAlarm = (data: any, setState: any, alarms: any) => {
  const newAlarm: TCalendarAlarmType = {
    id: v4(),
    ...data.value,
  };
  setState('alarms', [...alarms, newAlarm]);
};
export const removeAlarm = (item: any, setState: any, alarms: any) => {
  const alarmsFiltered: any = [...alarms].filter(
    (alarm: any) => alarm.id !== item.id
  );
  setState('alarms', alarmsFiltered);
};

export const setNullTimeInDate = (date: DateTime): DateTime =>
  date.set({ hour: 0, minute: 0, second: 0 });

export const getDayTimeStart = (date: DateTime): string =>
  date.set({ hour: 0, minute: 0, second: 0 }).toUTC().toString();
export const getDayTimeEnd = (date: DateTime): string =>
  date.set({ hour: 23, minute: 59, second: 59 }).toUTC().toString();

export const getEventsList = (): any => {
  const store: any = reduxStore.getState();
  const stateCloneEvents: any = cloneDeep(store.events);

  const usedIds: string[] = [];
  const events: any = [];

  for (const [key, value] of Object.entries(stateCloneEvents)) {
    for (const item of value as any) {
      const { id, updatedAt } = item;
      if (events.indexOf(id) === -1) {
        usedIds.push(id);
        events.push({ id, updatedAt });
      }
    }
  }

  return events;
};

export const getEventAndCalendarIds = (): any => {
  const store: any = reduxStore.getState();
  const stateCloneCalendars: any = cloneDeep(store.calendars);

  const calendars: any[] = stateCloneCalendars.map((item: any) => {
    const { id, updatedAt } = item;

    return { id, updatedAt };
  });
  const events: any[] = getEventsList();

  return { calendars, events };
};

/**
 * Format array of events to object with date keys
 * @param events
 */
export const mapEventsToDates = (events: EventDecrypted[]): any => {
  const result: any = {};

  if (events.length === 0) {
    return result;
  }

  // Sort events
  const sortedEvents: EventDecrypted[] = events.sort(
    (a: EventDecrypted, b: EventDecrypted) =>
      DateTime.fromISO(a.startAt).millisecond -
      DateTime.fromISO(b.startAt).millisecond
  );

  for (const event of sortedEvents) {
    const { startAt } = event;

    const dateKey: string = formatTimestampToDate(startAt);

    if (result[dateKey] === undefined) {
      result[formatTimestampToDate(startAt)] = [event];
    } else {
      result[formatTimestampToDate(startAt)].push(event);
    }
  }

  return result;
};

export const parseStartAtDateForNotification = (date: Date): string => {
  const dateNow: Date = new Date();

  const minutesBetween: number = differenceInMinutes(date, dateNow);

  if (minutesBetween < 1) {
    return 'Event starts now';
  }

  if (minutesBetween < 2) {
    return `Event starts in ${minutesBetween} minute`;
  }

  if (minutesBetween < 60) {
    return `Event starts in ${minutesBetween} minutes`;
  }

  const hoursBetween: number = differenceInHours(date, dateNow);

  if (hoursBetween < 2) {
    return `Event starts in ${hoursBetween} hour`;
  }

  if (hoursBetween < 24) {
    return `Event starts in ${hoursBetween} hours`;
  }

  const daysBetween: number = differenceInCalendarDays(date, dateNow);

  if (daysBetween < 2) {
    return `Event starts in ${daysBetween} day`;
  }

  return `Event starts in ${daysBetween} days`;
};

export const checkOverlappingEvents = (firstDate: any, secondDate: any) => {
  const startAtFirst: DateTime = DateTime.fromISO(firstDate.startAt);
  const endAtFirst: DateTime = DateTime.fromISO(firstDate.endAt);

  return new Interval({ start: startAtFirst, end: endAtFirst }).overlaps(
    new Interval({
      start: DateTime.fromISO(secondDate.startAt),
      end: DateTime.fromISO(secondDate.endAt),
    })
  );
};

export const createMultiDayClone = (
  event: EventDecrypted
): EventDecrypted[] => {
  const data: any = [];

  const daysBetween: number | undefined = DateTime.fromISO(event.endAt)
    .diff(DateTime.fromISO(event.startAt), 'days')
    .toObject().days;

  if (!daysBetween) {
    return data;
  }

  for (let i = 1; i <= daysBetween; i++) {
    const dateRef: any = DateTime.fromISO(event.startAt).plus({ days: i });

    data.push(formatTimestampToDate(dateRef));
  }

  return data;
};

export const formatEventDate = (event: any) => {
  const { startAt, endAt, timezoneStart } = event;

  const isSameDay: boolean = LuxonHelper.isSameDay(startAt, endAt);

  const dateFromString: string = parseToDateTime(
    startAt,
    timezoneStart
  ).toFormat(`d LLL ${isSameDay ? 'yyyy' : ''}`);
  const dateToString: string = !isSameDay
    ? ` - ${parseToDateTime(endAt, timezoneStart).toFormat('d LLL yyyy')}`
    : '';
  const dates = `${dateFromString}${dateToString}`;

  const timeFrom: string = parseToDateTime(startAt, timezoneStart).toFormat(
    'hh:mm'
  );
  const timeTo: string = parseToDateTime(endAt, timezoneStart).toFormat(
    'hh:mm'
  );
  const time = `${timeFrom} - ${timeTo}`;

  return {
    dates,
    time,
  };
};

export const TIMEOUT_LONG = 200;
export const NO_TIMEOUT = 0;
// export const STATUS_OK: number = 200;

export const STATUS_OK = 'ok';
export const STATUS_NOK = 'nok';
export const HTTP_STATUS_BAD_REQUEST = 400;

export const BIOMETRIC_SUPPORT_KEY = 'isBiometricSupported';
export const CREATE_BIOMETRIC_ENCRYPTION_ACTION = 'createBiometricEncryption';
export const PREPARE_ENCRYPT_STORAGE_ACTION = 'prepareEncryptStorage';
export const ENCRYPT_STORAGE_ACTION = 'encryptStorage';
export const DECRYPT_STORAGE_ACTION = 'decryptStorage';
export const GET_DECRYPT_PASSWORD_ACTION = 'getDecryptPassword';

export const capitalStart = (text?: string) => {
  if (!text) {
    return '';
  }
  const stringLength: number = text.length;
  const firstLetter = text.slice(0, 1).toUpperCase();
  const restLetters = text.slice(1, stringLength);

  return firstLetter + restLetters;
};

export const isCalendarApp = (): boolean =>
  process.env.REACT_APP_URL === 'http://localhost:4103' ||
  process.env.REACT_APP_URL === 'http://localhost:4003' ||
  process.env.REACT_APP_URL === 'https://calendar.bloben.com' ||
  process.env.REACT_APP_URL === 'https://calendar.nibdo.com';

export const parseToDate = (item: string | DateTime): DateTime =>
  typeof item === 'string' ? DateTime.fromISO(item) : item;

export const parseDateToString = (item: string | Date): string =>
  typeof item === 'string' ? item : item.toISOString();

export const colorPalette: any = {
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
export const findIndexById = (array: any, id: string): any =>
  new Promise((resolve) => {
    if (!array || array.length === 0) {
      resolve(false);
    }

    for (let i = 0; i < array.length; i += 1) {
      if (array[i].id === id) {
        resolve(i);
      }

      // Handle loop end
      if (i + 1 === array.length) {
        resolve(false);
      }
    }
  });

export const sendMessageToReactNative = (data: any) => {
  // @ts-ignore
  window.ReactNativeWebView.postMessage(JSON.stringify(data));
};

export const generateRandomString = () => {
  const stringLength = 256;
  const charset =
    "0123456789abcdefghijklmnopqrstuvwxyz,./;']`=-<>?:|}{~_+()*&^%$#@!";
  let i = 0;
  let result = '';
  while (i < stringLength) {
    result += charset.charAt(Math.random() * charset.length);
    i += 1;
  }

  return result;
};

export const generateRandomDemoString = () => {
  const stringLength = 16;
  const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
  let i = 0;
  let result = '';
  while (i < stringLength) {
    result += charset.charAt(Math.random() * charset.length);
    i += 1;
  }

  return result;
};

export const getLocalTimezone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

const getTimezoneOffset = (date: Date): string => {
  const dateString: string = date.toString();

  return dateString.slice(
    dateString.indexOf('GMT'),
    dateString.indexOf('GMT') + 8
  );
};

export const parseTimezoneText = (zone: string): string => {
  if (zone === 'device') {
    const timezoneDevice: string = getLocalTimezone();

    return `Device (${timezoneDevice})`;
  }

  if (zone === 'floating') {
    return 'Floating (fixed) time';
  }

  return zone;
};

export const parseTimezoneTextWithOffset = (
  zone: string,
  currentDate?: Date,
  localTimezone?: string
): string => {
  const date: Date = currentDate ? currentDate : new Date();

  if (zone === localTimezone) {
    const timezoneOffsetString: string = getTimezoneOffset(date);

    const timezoneDevice: string = getLocalTimezone();

    return `Device (${timezoneDevice}) ${timezoneOffsetString}`;
  }

  if (zone === 'floating') {
    return 'Floating fixed time';
  }

  return `${zone}`;
};
