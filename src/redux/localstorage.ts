import { logger } from 'bloben-common/utils/common';
import { LocalForage } from '../bloben-package/utils/LocalForage';
import { setIsLoading } from './actions';
import OpenPgp, { PgpKeys } from '../bloben-package/utils/OpenPgp';

export const loadState =  async (state?: any) => {
  try {
    const isStorageEncrypted: boolean | null = await LocalForage.getItem("isStorageEncrypted");

    let decryptedState: any;

    if (!isStorageEncrypted) {
      decryptedState = await LocalForage.getItem('root');
    } else {
      decryptedState = JSON.parse(state);
    }

    if (decryptedState === null) {
      return undefined;
    }

    const parsedState: any = parseStringDateToDate(decryptedState);

    return parsedState;
  } catch (err) {
    logger(err);

    return undefined;
  }
};

export const saveState = async (root: any) => {
  try {
    const systemKeys: any = await LocalForage.getItem('systemKeys');

    if (systemKeys) {
      const { publicKey } = systemKeys;
      // Encrypt storage
      const encrypted: any = await OpenPgp.encrypt(publicKey, root);

      await LocalForage.setItem('root', encrypted)
    } else {
      await LocalForage.setItem('root', root);
    }
  } catch (err) {
    logger(err);
  }
};

const parseEventDates = (event: any) => {
  event.createdAt = new Date(event.createdAt);
  event.updatedAt = new Date(event.updatedAt);
  event.deletedAt = event.deletedAt ? new Date(event.deletedAt) : null;
  event.startAt = new Date(event.startAt);
  event.endAt = new Date(event.endAt);

  return event;
}
const parseCalendarDays = (calendar: any) => {
  calendar.createdAt = new Date(calendar.createdAt);
  calendar.updatedAt = new Date(calendar.updatedAt);
  calendar.deletedAt = calendar.deletedAt ? new Date(calendar.deletedAt) : null;

  return calendar;
}
const parseStringDateToDate = (state: any) => {
  const result: any = {};

  const dateKeysSimple: any = ["rangeFrom", "rangeTo", 'selectedDate', 'eventsLastSynced'];
  const dateKeysArraySimple: any = ["calendarDays"];
  const dateKeysNested: any = ["events", "calendars", "allEvents"];

  for (const [key, value] of Object.entries(state)) {
    const keyType: string = key;
    const valueAny: any = value;

    if (dateKeysSimple.indexOf(key) !== -1) {
      result[keyType] = new Date(valueAny);
    } else if (key === 'calendarDays') {
      const calendarDaysAny: any = [];

      for (const item of valueAny) {
        const calendarDaysDate: any = item.map((day: any) =>
          new Date(day)
        )
        calendarDaysAny.push(calendarDaysDate)
      }

      result[keyType] = calendarDaysAny;
    } else if (keyType === 'events') {
      const eventsObj: any = {};

      for (const [keyEvents, valueEvents] of Object.entries(valueAny)) {
        const valueEventsAny: any = valueEvents;
        eventsObj[keyEvents] = valueEventsAny.map((item: any) => {
          return parseEventDates(item);
        })
      }

      result[keyType] = eventsObj;
    } else if (keyType === 'allEvents') {
      const eventsArray: any = [];

      for (const item of valueAny) {
        eventsArray.push(parseEventDates(item));
      }

      result[keyType] = eventsArray;
    }
    else if (keyType === 'calendars') {
      const calendarsArray: any = [];

      for (const item of valueAny) {
        calendarsArray.push(parseCalendarDays(item));
      }

      result[keyType] = calendarsArray;
    }
    else {
      result[keyType] = valueAny;
    }
  }

  return result;
};
