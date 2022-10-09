import { CalDavAccount, CalDavCalendar, CalDavEvent } from '../types/interface';
import { GetCardDavAddressBooks } from '../bloben-interface';
import { WebcalCalendar } from '../redux/reducers/webcalCalendars';

export const getAccountByCalendar = (
  calendar: CalDavCalendar,
  accounts: CalDavAccount[]
): CalDavAccount => {
  let result: CalDavAccount | null = null;

  if (!accounts || accounts.length === 0) {
    throw Error('No account found');
  }

  accounts.forEach((item) => {
    if (item.id === calendar.calDavAccountID) {
      result = item;
      return false;
    }
  });

  if (!result) {
    throw Error('No account found');
  }

  return result;
};

export const calendarByEvent = (
  event: CalDavEvent,
  calendars: CalDavCalendar[] | WebcalCalendar[]
): CalDavCalendar | WebcalCalendar | null => {
  let result: CalDavCalendar | WebcalCalendar | null = null;

  if (!calendars || calendars.length === 0) {
    return null;
  }

  calendars.forEach((item) => {
    if (item.id === event.calendarID) {
      result = item;
      return false;
    }
  });

  return result;
};

export const findLocalCalDavCalendar = (
  serverCalendar: any,
  localCalendars: any[]
): CalDavCalendar | undefined => {
  let match: CalDavCalendar | undefined;

  localCalendars.forEach((localCalendar) => {
    if (match) {
      return false;
    }
    if (serverCalendar.url === localCalendar.url) {
      match = localCalendar;
      return false;
    }
  });

  return match;
};

export const getAccountCalendars = (
  account: CalDavAccount,
  calendars: CalDavCalendar[]
) => {
  return calendars.filter((item) => {
    return item.calDavAccountID === account.id;
  });
};

export const getAccountAddressBooks = (
  account: CalDavAccount,
  addressBooks: GetCardDavAddressBooks[]
) => {
  return addressBooks.filter((item) => {
    return item.accountID === account.id;
  });
};

export const filterEventsByCalendar = (
  localEvents: CalDavEvent[],
  calendar: CalDavCalendar
): CalDavEvent[] => {
  return localEvents?.filter((item) => {
    if (item.calendarID === calendar.id) {
      return item;
    }
  });
};

export const checkCalendarChange = (
  localCalendar: any,
  serverCalendar: any
) => {
  if (
    localCalendar.description !== serverCalendar.description ||
    localCalendar.timezone !== serverCalendar.timezone ||
    localCalendar.ctag !== serverCalendar.ctag ||
    localCalendar.calendarColor !== serverCalendar.calendarColor ||
    localCalendar.displayName !== serverCalendar.displayName
  ) {
    return true;
  }

  return false;
};
