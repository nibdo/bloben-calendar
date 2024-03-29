import { DateTime } from 'luxon';
import { getLocalTimezone } from './common';
import Datez from 'datez';

//
// Support for local datetime, timezones and floating times
//
const FLOATING_DATETIME = 'floating'; // fixed datetime without timezone
const UTC_TIMEZONE = 'UTC';

/**
 * Parse datetime according different rules like local datetime, floating time and timezones
 * @param date
 * @param zone
 * @param deviceTimezone
 * @constructor
 */
export const DatetimeParser = (
  date: DateTime | string,
  zone: string,
  deviceTimezone?: string
): string => {
  const dateString: string = typeof date === 'string' ? date : date.toString();

  const isFloatingDatetime: boolean = zone === FLOATING_DATETIME;

  // Adjust date with timezone so when converted to UTC it represents correct value with fixed time
  if (isFloatingDatetime) {
    const dateFloating: DateTime = DateTime.fromISO(dateString, {
      zone: UTC_TIMEZONE,
    });

    return dateFloating.toUTC().toISO();
  }

  const thisDate: DateTime = DateTime.fromISO(dateString);

  // Adjust datetime to device timezone
  if (deviceTimezone) {
    const dateConvert: DateTime = Datez.setZone(thisDate, zone);

    return dateConvert.setZone(deviceTimezone).toString();
  }

  return Datez.setZone(thisDate, zone).toString();
};

export const parseToDateTime = (
  date: DateTime | string,
  zone?: string,
  deviceTimezone?: string
): DateTime => {
  const dateString: string = typeof date === 'string' ? date : date.toString();

  const isFloatingDatetime: boolean = zone === FLOATING_DATETIME;

  // Adjust date with timezone so when converted to UTC it represents correct value with fixed time
  if (isFloatingDatetime) {
    return DateTime.fromISO(dateString).setZone('utc');
  }

  const thisDate: DateTime = DateTime.fromISO(dateString);

  let result;

  // Adjust datetime to device timezone
  if (deviceTimezone) {
    if (typeof zone === 'string') {
      result = Datez.setZone(thisDate, zone).setZone(deviceTimezone);
    } else {
      result = thisDate.setZone(deviceTimezone);
    }
  } else {
    if (zone) {
      result = Datez.setZone(thisDate, zone);
    } else {
      result = thisDate.setZone(getLocalTimezone());
    }
  }

  return result;
};

export const parseToDateTime2 = (
  date: DateTime | string,
  zone: string,
  deviceTimezone?: string
): DateTime => {
  const dateString: string = typeof date === 'string' ? date : date.toString();

  const isFloatingDatetime: boolean = zone === FLOATING_DATETIME;

  // Adjust date with timezone so when converted to UTC it represents correct value with fixed time
  if (isFloatingDatetime) {
    return DateTime.fromISO(dateString).setZone('utc');
  }

  const thisDate: DateTime = DateTime.fromISO(dateString);

  let result;

  // Adjust datetime to device timezone
  if (deviceTimezone) {
    result = Datez.setZone(thisDate, zone).setZone(deviceTimezone);
  } else {
    result = Datez.fromISO(dateString, { zone });
  }

  return result;
};
