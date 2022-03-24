import { CalDavEventObj } from './davHelper';
import { CalendarView } from 'kalend';
import { DateTime } from 'luxon';
import { QueryRange, QueryRangeMillis } from '../types/interface';
import { TOAST_POSITION, TOAST_STATUS } from '../types/enums';
import { getMonthDays } from './calendarDays';
import { parseToDateTime } from './datetimeParser';
import { v4 } from 'uuid';
import LuxonHelper from './LuxonHelper';
import _, { forEach } from 'lodash';

export const STATUS_CODE_OK = 200;
export const MOBILE_MAX_WIDTH = 750;

export const parseCssDark = (className: string, isDark?: boolean): string =>
  isDark ? `${className}-dark` : className;

export const changeStatusbarColor = (color: string) => {
  document
    ?.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', color);
};

export const formatTimestampToDate = (dateObj: any): string =>
  dateObj.isValid
    ? dateObj.toFormat('dd-MM-yyyy')
    : DateTime.fromISO(dateObj).toFormat('dd-MM-yyyy');

export const getLocalTimezone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const parseErrorMessage = (error: any): any => {
  if (error && error.response) {
    if (
      error.response.data &&
      error.response.data.code &&
      error.response.data.message
    ) {
      return error.response.data;
    }
  }

  return {
    code: 5000,
    message: 'Unknown Error',
  };
};
// @ts-ignore
export const checkIfIsSafari = () => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    navigator.userAgent.includes('Mac')
  );
};

export const capitalStart = (text?: string) => {
  if (!text) {
    return '';
  }
  const stringLength: number = text.length;
  const firstLetter = text.slice(0, 1).toUpperCase();
  const restLetters = text.slice(1, stringLength);

  return firstLetter + restLetters;
};

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
export const findInArrayByKeyValue = (
  array: any,
  key: string,
  value: string
): any =>
  new Promise((resolve) => {
    if (!array || array.length === 0) {
      resolve(false);
    }

    for (let i = 0; i < array.length; i += 1) {
      if (array[i][key] === value) {
        resolve(array[i]);
      }

      // Handle loop end
      if (i + 1 === array.length) {
        resolve(false);
      }
    }
  });

export const generateRandomString = (stringLength = 256) => {
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

export const generateRandomSimpleString = (stringLength = 32) => {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyz';
  let i = 0;
  let result = '';
  while (i < stringLength) {
    result += charset.charAt(Math.random() * charset.length);
    i += 1;
  }

  return result;
};

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

export const setNullTimeInDate = (date: DateTime): DateTime =>
  date.set({ hour: 0, minute: 0, second: 0 });

export const getDayTimeStart = (date: DateTime): string =>
  date.set({ hour: 0, minute: 0, second: 0 }).toUTC().toString();
export const getDayTimeEnd = (date: DateTime): string =>
  date.set({ hour: 23, minute: 59, second: 59 }).toUTC().toString();

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

export const formatEventDate = (event: any) => {
  const { startAt, endAt, timezoneStartAt } = event;

  const isSameDay: boolean = LuxonHelper.isSameDay(startAt, endAt);

  const dateFromString: string = parseToDateTime(
    startAt,
    timezoneStartAt
  ).toFormat(`d LLL ${isSameDay ? 'yyyy' : ''}`);
  const dateToString: string = !isSameDay
    ? ` - ${parseToDateTime(endAt, timezoneStartAt).toFormat('d LLL yyyy')}`
    : '';
  const dates = `${dateFromString}${dateToString}`;

  const timeFrom: string = parseToDateTime(startAt, timezoneStartAt).toFormat(
    'HH:mm'
  );
  const timeTo: string = parseToDateTime(endAt, timezoneStartAt).toFormat(
    'HH:mm'
  );
  const time = `${timeFrom} - ${timeTo}`;

  return {
    dates,
    time,
  };
};

export const checkHasNewVersion = (
  dockerVersion: string,
  serverVersion: string
) => {
  return (
    dockerVersion.length > 1 &&
    serverVersion.length > 1 &&
    dockerVersion !== serverVersion
  );
};

export const getArrayStart = (array: any) => array[0];
export const getArrayEnd = (array: any) => array[array.length - 1];

export const parseLinkInText = (text: string) => {
  const currentResult: any = [];

  const regex: any = new RegExp(/ http[^ ]*/g);

  // @ts-ignore
  const matches = [...text.matchAll(regex)];

  let lastIndex = 0;

  for (const match of matches) {
    currentResult.push({
      // @ts-ignore
      value: text.slice(lastIndex, match.index + 1), // space
      type: 'text',
    });
    currentResult.push({
      value: match[0].slice(1), // space
      type: 'link',
    });
    // @ts-ignore
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    currentResult.push({
      value: text.slice(lastIndex),
      type: 'text',
    });
  }

  return currentResult;
};

const getTimezoneOffset = (date: Date): string => {
  const dateString: string = date.toString();

  return dateString.slice(
    dateString.indexOf('GMT'),
    dateString.indexOf('GMT') + 8
  );
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

export const createMultiDayClone = (event: any): any[] => {
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

export const parseStartAtDateForNotification = (date: any, timezone: any) => {
  const dateNow = DateTime.now();

  const minutesBetween =
    (parseToDateTime(date, timezone).toMillis() - dateNow.toMillis()) /
    1000 /
    60;

  if (minutesBetween < 1) {
    return 'starts now';
  }

  if (minutesBetween < 2) {
    return `starts in a minute`;
  }

  if (minutesBetween < 60) {
    return `starts in ${Math.floor(minutesBetween)} minutes`;
  }

  const hoursBetween = minutesBetween / 60;

  if (hoursBetween < 2) {
    return `starts in a hour`;
  }

  if (hoursBetween < 24) {
    return `starts in ${Math.floor(hoursBetween)} hours`;
  }

  const daysBetween = hoursBetween / 24;

  if (daysBetween < 2) {
    return `starts in a day`;
  }

  return `starts in ${Math.floor(daysBetween)} days`;
};

export const addAlarm = (data: any, setState: any, alarms: any) => {
  const newAlarm: any = {
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

export const parseRRuleFromString = (rRuleString: string): any => {
  const rRuleObj: any = {
    freq: '',
    wkst: '',
    count: null,
    until: null,
    interval: null,
    dtstart: '',
    dtend: '',
    byday: null,
    bymonth: null,
    bymonthday: null,
    bysetpos: null,
  };

  if (!rRuleString) {
    return rRuleObj;
  }

  const delimiter = ';';
  const hasInterval: boolean = rRuleString.indexOf('INTERVAL') !== -1;
  const hasCount: boolean = rRuleString.indexOf('COUNT') !== -1;
  const hasUntil: boolean = rRuleString.indexOf('UNTIL') !== -1;

  const freq: string = rRuleString.slice(
    rRuleString.indexOf('FREQ=') + 'FREQ='.length,
    rRuleString.indexOf(delimiter)
  );
  rRuleObj.freq = freq;

  // Get rest of string
  let rawString: string = rRuleString.slice(
    rRuleString.indexOf(freq) + freq.length + 1
  );

  if (hasInterval) {
    const interval: string = rawString.slice(
      rawString.indexOf('INTERVAL=') + 'INTERVAL='.length,
      rawString.indexOf(delimiter)
    );
    rRuleObj.interval = Number(interval);
    rawString = rawString.slice(
      rawString.indexOf(interval) + interval.length + 1
    );
  }

  if (hasCount) {
    const count: string = rawString.slice(
      rawString.indexOf('COUNT=') + 'COUNT='.length
    );
    rRuleObj.count = Number(count);
  }

  if (hasUntil) {
    rRuleObj.until = rawString.slice(
      rawString.indexOf('UNTIL=') + 'UNTIL='.length
    );
  }

  return rRuleObj;
};

export const isNumber = (value: string): boolean => {
  return !isNaN(Number(value));
};

// local long, server short
export const isHrefInUrl = (href: string, url: string) => {
  return url.indexOf(href) !== -1;
};

/**
 * Merge events created from app and external events (webcal)
 * @param normalEvents
 * @param externalEvents
 */
export const mergeEvents = (normalEvents: any, externalEvents: any) => {
  const result: any = {};

  forEach(normalEvents, (item, dateKey) => {
    if (result[dateKey]) {
      result[dateKey] = [...result[dateKey], ...item];
    } else {
      result[dateKey] = item;
    }
  });
  forEach(externalEvents, (item, dateKey) => {
    if (result[dateKey]) {
      result[dateKey] = [...result[dateKey], ...item];
    } else {
      result[dateKey] = item;
    }
  });

  return result;
};

export const createToast = (text?: string, status?: TOAST_STATUS) => {
  if (!text) {
    return {
      title: 'Unknown error',
      status,
      position: TOAST_POSITION.TOP,
      isClosable: true,
    };
  }
  if (status) {
    return {
      title: text,
      status,
      position: TOAST_POSITION.TOP,
      isClosable: true,
    };
  }
  return {
    title: text,
    position: TOAST_POSITION.TOP,
    isClosable: true,
  };
};

export const getDaysLength = (calendarView: string) => {
  if (calendarView === CalendarView.DAY) {
    return 1;
  } else if (calendarView === CalendarView.THREE_DAYS) {
    return 3;
  } else if (calendarView === CalendarView.WEEK) {
    return 7;
  } else if (calendarView === CalendarView.MONTH) {
    return 42;
  } else if (calendarView === CalendarView.AGENDA) {
    return 31;
  }
};

export const formatCalendarView = (calendarView: string) => {
  if (calendarView === CalendarView.DAY) {
    return 'Day';
  } else if (calendarView === CalendarView.THREE_DAYS) {
    return 'Three days';
  } else if (calendarView === CalendarView.WEEK) {
    return 'Week';
  } else if (calendarView === CalendarView.MONTH) {
    return 'Month';
  } else if (calendarView === CalendarView.AGENDA) {
    return 'Agenda';
  }
};

const normalizeDateStart = (date: DateTime) => {
  return date.set({ hour: 0, minute: 0, second: 0, millisecond: 1 });
};
const normalizeDateEnd = (date: DateTime) => {
  return date.set({ hour: 23, minute: 59, second: 59, millisecond: 59 });
};

export const getSyncRange = (
  weekDayStart: string,
  date?: string
): QueryRange => {
  const calendarDays = getMonthDays(
    normalizeDateStart(date ? DateTime.fromISO(date) : DateTime.now()),
    undefined,
    'Monday' as any
  );

  return {
    rangeFrom: calendarDays[0].toUTC().toString(),
    rangeTo: normalizeDateEnd(calendarDays[calendarDays.length - 1])
      .toUTC()
      .toString(),
  };
};

export const getCurrentRangeForSync = (): QueryRange => {
  const calendarDays = getMonthDays(
    normalizeDateStart(DateTime.now()),
    undefined,
    'Monday' as any
  );

  return {
    rangeFrom: calendarDays[0].toUTC().toString(),
    rangeTo: normalizeDateEnd(calendarDays[calendarDays.length - 1])
      .toUTC()
      .toString(),
  };
};

export const getMillisRange = (range: QueryRange): QueryRangeMillis => {
  return {
    rangeFrom: DateTime.fromISO(range.rangeFrom).toMillis(),
    rangeTo: DateTime.fromISO(range.rangeTo).toMillis(),
  };
};

const formatRangeKey = (date: string) =>
  DateTime.fromISO(date).toFormat('ddMMyyyy');

export const getRangeKey = (range: QueryRange) =>
  `${formatRangeKey(range.rangeFrom)}_${formatRangeKey(range.rangeTo)}`;

export const getRangeFromRangeKey = (key: string) => {
  const ranges = key.split('_');

  const formatToDateTime = (dateString: string) =>
    DateTime.fromFormat(dateString, 'ddMMyyyy');

  return {
    rangeFrom: normalizeDateStart(formatToDateTime(ranges[0]))
      .toUTC()
      .toString(),
    rangeTo: normalizeDateEnd(formatToDateTime(ranges[1])).toUTC().toString(),
  };
};

export const checkIfIsInRange = (range: any) => {
  const dateTimeRangeFrom = normalizeDateStart(
    DateTime.fromISO(range.rangeFrom)
  ).toMillis();
  const dateTimeRangeTo = normalizeDateEnd(
    DateTime.fromISO(range.rangeTo)
  ).toMillis();

  const currentRange = getMillisRange(getCurrentRangeForSync());

  if (
    dateTimeRangeFrom < currentRange.rangeFrom ||
    dateTimeRangeTo > currentRange.rangeTo
  ) {
    return false;
  }

  return true;
};

export const checkEventInRange = (
  event: CalDavEventObj,
  range: any,
  timezone: string
) => {
  const dateTimeRangeFrom = normalizeDateStart(
    DateTime.fromISO(event.startAt).setZone(event.timezone || timezone)
  ).toMillis();
  const dateTimeRangeTo = normalizeDateEnd(
    DateTime.fromISO(event.endAt).setZone(event.timezone || timezone)
  ).toMillis();

  const currentRange = getMillisRange(range);

  if (
    dateTimeRangeFrom < currentRange.rangeFrom ||
    dateTimeRangeTo > currentRange.rangeTo
  ) {
    return false;
  }

  return true;
};

export const getApiBaseUrl = (url: string) => url.slice(0, url.indexOf('/api'));
