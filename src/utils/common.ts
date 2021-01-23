import _ from 'lodash';
import { reduxStore } from '../bloben-package/layers/ReduxLayer';
import { TCalendarNotificationType } from '../types/types';
import { v4 } from 'uuid';
import {
  addDays,
  areIntervalsOverlapping,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  formatISO,
  getDate,
  getMonth,
  getUnixTime,
  getYear,
} from 'date-fns';
import EventStateEntity from '../data/entities/state/event.entity';
import { setAllEvents, setCalendars, setEvents } from '../redux/actions';
import { formatTimestampToDate } from '../components/calendarView/calendar-common';
import { DateTime } from 'luxon';
// @ts-ignore
import Interval from 'luxon/src/interval.js';
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

export const findInEvents = (id: string): Promise<EventStateEntity | null> =>
  new Promise((resolve) => {
    const store: any = reduxStore.getState();
    const dataState: any = store.events;
    if (dataState) {
      for (const [key, value] of Object.entries(dataState)) {
        const dayEvents: any = value;
        for (const event of dayEvents) {
          const eventObj: EventStateEntity = event;
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
  newItem: EventStateEntity
) => {
  const store: any = reduxStore.getState();
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
    stateClone[newItem.getDateKey()].push(newItem.getReduxStateObj());
  }

  reduxStore.dispatch(setEvents(stateClone));
};
export const getDateKey = (event: EventStateEntity): string =>
  formatTimestampToDate(event.startAt);

export const handleEventReduxDelete = async (
  prevItem: any,
  newItem: EventStateEntity
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
export const handleCalendarReduxDelete = (calendarId: string) => {
  const store: any = reduxStore.getState();
  const stateCloneCalendars: any = cloneDeep(store.calendars);
  const stateCloneEvents: any = cloneDeep(store.events);
  const stateCloneAllEvents: any = cloneDeep(store.allEvents);

  // Delete calendar
  const filteredCalendars: any = stateCloneCalendars.filter(
    (item: any) => item.id !== calendarId
  );

  // Delete all events from this calendar
  const filteredEvents: any = deleteAllCalendarEvents(
    calendarId,
    stateCloneEvents
  );

  const filteredAllEvents: any = stateCloneAllEvents.filter(
    (item: any) => item.calendarId !== calendarId
  );

  reduxStore.dispatch(setCalendars(filteredCalendars));
  reduxStore.dispatch(setEvents(filteredEvents));
  reduxStore.dispatch(setAllEvents(filteredAllEvents));
};
export const addNotification = (data: any, setState: any, reminders: any) => {
  const newNotification: TCalendarNotificationType = {
    id: v4(),
    ...data.value,
  };
  setState('reminders', [...reminders, newNotification]);
};
export const removeNotification = (
  item: any,
  setState: any,
  reminders: any
) => {
  const notificationsFiltered: any = [...reminders].filter(
    (reminder: any) => reminder.id !== item.id
  );
  setState('reminders', notificationsFiltered);
};

export const nullTimeInDate = (date: DateTime): DateTime =>
  date.set({ hour: 0, minute: 0, second: 0 });

export const getDayTimeStart = (date: DateTime): string =>
  date.set({ hour: 0, minute: 0, second: 0 }).toString();
export const getDayTimeEnd = (date: DateTime): string =>
  date.set({ hour: 23, minute: 59, second: 59 }).toString();

const deleteAllCalendarEvents = (calendarId: string, events: any) => {
  const eventsObj: any = Object.entries(events);

  const result: any = {};

  for (const [key, value] of eventsObj) {
    result[key] = value.filter((item: any) => item.calendarId !== calendarId);
  }

  return result;
};

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
export const mapEventsToDates = (events: EventStateEntity[]): any => {
  const result: any = {};

  if (events.length === 0) {
    return result;
  }

  // Sort events
  const sortedEvents: EventStateEntity[] = events.sort(
    (a: EventStateEntity, b: EventStateEntity) =>
      DateTime.fromISO(a.startAt).millisecond - DateTime.fromISO(b.startAt).millisecond
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

  return  new Interval({ start: startAtFirst, end: endAtFirst }).overlaps(
      new Interval({ start: DateTime.fromISO(secondDate.startAt), end: DateTime.fromISO(secondDate.endAt) })
  );
}


export const createMultiDayClone = (event: EventStateEntity) => {
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
