import { AxiosResponse } from 'axios';

import { reduxStore } from '../../bloben-package/layers/ReduxProvider';
import OpenPgp from '../../bloben-utils/utils/OpenPgp';
import {
  cloneDeep,
  createMultiDayClone,
  findInEvents,
  getDateKey,
} from '../common';
import {
  setAllEvents,
  setAllEventsSyncLog,
  setEvents,
  setEventsAreFetching,
  setEventsSyncLog,
} from '../../redux/actions';
import CalendarApi from '../../api/calendar';
import { ICalendarSettings, ISyncLog, ReduxState } from '../../types/types';
import { EventResultDTO } from '../../data/types';
import EventStateEntity from '../../bloben-utils/models/event.entity';
import { findInArrayWithIndex } from '../filter/findInArray';
import Crypto from '../../bloben-utils/utils/encryption';
import { User } from '../../bloben-utils/models/User';
import {
  createEvent,
  EventData,
  EventDecrypted,
} from '../../bloben-utils/models/Event';
import { CalendarEncrypted } from '../../bloben-utils/models/CalendarEncrypted';
import { EventEncrypted } from '../../bloben-utils/models/EventEncrypted';

export const decryptEvents = async (data: any): Promise<void> => {
  const store: ReduxState = reduxStore.getState();
  // Clone state
  const stateClone: any = cloneDeep(store.events);

  const password: string = store.password;
  const user: User = store.user;
  const calendarSettings: ICalendarSettings = store.calendarSettings;

  if (!data || data.length === 0) {
    return;
  }

  // Prepare day arrays
  for (let i = 0; i < data.length; i++) {
    // Decrypt events
    const eventResultDTO: EventEncrypted = data[i];

    let decryptedData: any = await OpenPgp.decrypt(
      user.publicKey,
      user.privateKey,
      password,
      eventResultDTO.data
    );
    decryptedData = JSON.parse(decryptedData);

    const finalForm: EventData = {
      ...eventResultDTO,
      ...decryptedData,
    };

    const event: EventDecrypted = createEvent(
      finalForm,
      undefined,
      calendarSettings.defaultTimezone
    );

    /**
     * Logic for saving event
     */
    const handleEventSave = async (date: any) => {
      const eventsArray: EventDecrypted[] = stateClone[date];
      // Check if there is date in redux store with event datekey
      // Datekey exists, add new item or update existing
      if (eventsArray && eventsArray.length > 0) {
        const itemInState: any = await findInArrayWithIndex(eventsArray, event);
        // Item exists, update it
        if (itemInState.children) {
          stateClone[date][itemInState.index] = event;
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        } else {
          eventsArray.push(event);
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        }
      } else {
        stateClone[date] = [];
        stateClone[date].push(event);
        if (i + 1 === data.length) {
          reduxStore.dispatch(setEvents(stateClone));
          reduxStore.dispatch(setEventsAreFetching(false));
        }
      }
    };

    /**
     * Handle multi day events
     * // TODO destroy on delete and on update and recreate new
     */
    if (event.isMultiDay) {
      const multiDayDates: EventDecrypted[] = createMultiDayClone(event);

      for (const date of multiDayDates) {
        await handleEventSave(date);
      }
    }
    // Get dateKey
    const dateKey: string = getDateKey(event);

    console.log('dateKey', dateKey);

    await handleEventSave(dateKey);
  }
};

const decryptEventPgp = async (
  password: string,
  user: User,
  item: EventResultDTO,
  defaultTimezone?: string
): Promise<any> => {
  const eventResultDTO: EventResultDTO = item;
  let decryptedData: any = await OpenPgp.decrypt(
    user.publicKey,
    user.privateKey,
    password,
    eventResultDTO.data
  );
  decryptedData = JSON.parse(decryptedData);

  const finalForm: any = {
    ...eventResultDTO,
    ...decryptedData,
  };
  const newEvent: EventStateEntity = new EventStateEntity(
    finalForm,
    undefined,
    defaultTimezone
  );

  return newEvent.getReduxStateObj();
};

const SyncEvents: any = {
  getAllInRange: async (rangeFrom: string, rangeTo: string) => {
    const response: AxiosResponse = await CalendarApi.getEvents(
      `?rangeFrom=${rangeFrom}&rangeTo=${rangeTo}`
    );

    const { data } = response;

    const store: any = reduxStore.getState();

    const calendarSettings: ICalendarSettings = store.calendarSettings;
    const syncLog: ISyncLog = store.syncLog;

    await SyncEvents.processEvents(data);

    reduxStore.dispatch(setEventsSyncLog());
  },

  getAllLastSync: async () => {
    const store: any = reduxStore.getState();
    const stateClone: any = cloneDeep(store.allEvents);
    const user: User = store.user;
    const password: string = store.password;
    const syncLog: ISyncLog = store.syncLog;
    const defaultTimezone: string = store.defaultTimezone;

    const response: AxiosResponse = await CalendarApi.getAllEventsLastSync(
      syncLog.eventsAll
    );

    const result: any = stateClone;

    const { data } = response;

    const decryptedEvents: any = [];
    for (const item of data) {
      const event: any = await decryptEventPgp(
        password,
        user,
        item,
        defaultTimezone
      );

      decryptedEvents.push(event);
    }

    for (const item of decryptedEvents) {
      if (store.allEvents.length === 0) {
        result.push(item);
      } else {
        for (let i = 0; i < result.length; i += 1) {
          if (result[i].ix === item.id) {
            result[i] = await decryptEventPgp(
              password,
              user,
              item,
              defaultTimezone
            );
          } else {
            if (i + 1 === decryptedEvents.length) {
              result.push(item);
            }
          }
        }
      }
    }
    reduxStore.dispatch(setAllEvents(result));

    reduxStore.dispatch(setAllEventsSyncLog());
  },
  processEvents: async (data: any) => {
    const store: any = reduxStore.getState();
    const calendarSettings: ICalendarSettings = store.calendarSettings;

    // Clone state
    const stateClone: any = cloneDeep(store.events);

    const password: string = store.password;
    const user: User = store.user;

    if (!data || data.length === 0) {
      return;
    }

    // Prepare day arrays
    for (let i = 0; i < data.length; i++) {
      // Decrypt events
      const decryptedEvents: any = [];

      // // Add day to allDays for Agenda view
      // if (agendaDays.indexOf(key) === -1) {
      //   agendaDays.push(key);
      // }
      const eventResultDTO: EventEncrypted = data[i];

      let decryptedData: any = await OpenPgp.decrypt(
        user.publicKey,
        user.privateKey,
        password,
        eventResultDTO.data
      );

      decryptedData = JSON.parse(decryptedData);
      const finalForm: any = {
        ...eventResultDTO,
        ...decryptedData,
      };

      const newEvent: EventDecrypted = createEvent(
        finalForm,
        undefined,
        calendarSettings.defaultTimezone
      );

      /**
       * Logic for saving event
       */
      const handleEventSave = async (date: string) => {
        const eventsArray: EventDecrypted[] = stateClone[date];
        // Check if there is date in redux store with event datekey
        // Datekey exists, add new item or update existing
        if (eventsArray && eventsArray.length > 0) {
          const itemInState: any = await findInArrayWithIndex(
            eventsArray,
            newEvent
          );

          // Item exists, update it
          if (itemInState.children) {
            stateClone[date][itemInState.index] = newEvent;
            if (i + 1 === data.length) {
              reduxStore.dispatch(setEvents(stateClone));
              reduxStore.dispatch(setEventsAreFetching(false));
            }
          } else {
            eventsArray.push(newEvent);
            if (i + 1 === data.length) {
              reduxStore.dispatch(setEvents(stateClone));
              reduxStore.dispatch(setEventsAreFetching(false));
            }
          }
        } else {
          stateClone[date] = [];
          stateClone[date].push(newEvent);
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        }
      };

      /**
       * Handle multi day events
       * // TODO destroy on delete and on update and recreate new
       */
      if (newEvent.isMultiDay) {
        const multiDayDates: any = createMultiDayClone(newEvent);

        for (const date of multiDayDates) {
          await handleEventSave(date);
        }
      }
      // Get dateKey
      const dateKey: string = getDateKey(newEvent);

      await handleEventSave(dateKey);
    }
  },

  addEvent: async (id: string) => {
    const store: any = reduxStore.getState();
    const { rangeFrom, rangeTo } = store;

    const eventInState: EventDecrypted | null = await findInEvents(id);

    // Get event from server if not found, if needed to fetch all occurrences or is older
    if (!eventInState || (eventInState && eventInState.isRepeated)) {
      const response: AxiosResponse = await CalendarApi.getEventById(
        id,
        rangeFrom,
        rangeTo
      );

      await SyncEvents.processEvents(response.data);
    } else {
      // Flag found state item as synced
      // TODO flag as synced
      // eventInState.flagAsSynced();
    }
  },
  updateEvent: async (id: string) => {
    const store: any = reduxStore.getState();
    const { rangeFrom, rangeTo } = store;

    // Get event from server if not found, if needed to fetch all occurrences or is older
    const response: AxiosResponse = await CalendarApi.getEventById(
      id,
      rangeFrom,
      rangeTo
    );

    await SyncEvents.processEvents(response.data);
  },
};

export default SyncEvents;
