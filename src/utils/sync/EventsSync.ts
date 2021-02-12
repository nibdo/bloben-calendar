import { reduxStore } from '../../bloben-package/layers/ReduxLayer';
import OpenPgp, { PgpKeys } from '../../bloben-utils/utils/OpenPgp';
import {
  cloneDeep,
  createMultiDayClone,
  findInArrayById,
  findInEvents,
} from '../common';
import CalendarStateEntity from '../../data/models/state/calendar.entity';
import {
  addCalendar,
  setAllEvents,
  setAllEventsLastSync,
  setAllEventsSyncLog,
  setCalendars,
  setCalendarsSyncLog,
  setEvents,
  setEventsAreFetching,
  setEventsLastSync,
  setEventsSyncLog,
  updateCalendar,
} from '../../redux/actions';
import { AxiosResponse } from 'axios';
import CalendarApi, {
  sendWebsocketMessage,
  WEBSOCKET_GET_ONE_EVENT,
} from '../../api/calendar';
import { DateTime } from 'luxon';
import {
  GetEventWebsocketByIdDTO,
  ICalendarSettings,
  ISyncLog,
} from '../../types/types';
import { logger } from '../../bloben-common/utils/common';
import { EventResultDTO } from '../../data/types';
import EventStateEntity from '../../bloben-utils/models/event.entity';
import Crypto from '../../bloben-package/utils/encryption';
import { findInArrayWithIndex } from '../filter/findInArray';
import { DEFAULT_DATE } from '../../redux/reducers/syncLog';
import LuxonHelper from '../../bloben-utils/utils/LuxonHelper';

export const decryptEvents = async (data: any): Promise<void> => {
  const store: any = reduxStore.getState();
  // Clone state
  const stateClone: any = cloneDeep(store.events);

  const cryptoPassword: any = store.cryptoPassword;
  const password: string = store.password;
  const pgpKeys: PgpKeys = store.pgpKeys;
  const calendarSettings: ICalendarSettings = store.calendarSettings;

  if (!data || data.length === 0) {
    return;
  }
  const objEntries: any = Object.entries(data);

  // Prepare day arrays
  for (let i = 0; i < data.length; i++) {
    // Decrypt events
    const decryptedEvents: any = [];

    // // Add day to allDays for Agenda view
    // if (agendaDays.indexOf(key) === -1) {
    //   agendaDays.push(key);
    // }
    const eventResultDTO: EventResultDTO = data[i];

    let decryptedData: any;

    if (pgpKeys && pgpKeys.publicKey) {
      decryptedData = await OpenPgp.decrypt(
        pgpKeys.publicKey,
        pgpKeys.privateKey,
        password,
        eventResultDTO.data
      );
      decryptedData = JSON.parse(decryptedData);
    } else {
      decryptedData = await Crypto.decrypt(eventResultDTO.data, cryptoPassword);
    }

    const finalForm: any = {
      ...eventResultDTO,
      ...decryptedData,
    };
    const newEvent: EventStateEntity = new EventStateEntity(
      finalForm,
      undefined,
      calendarSettings.defaultTimezone
    );
    const simpleEventObj: EventStateEntity = newEvent.getReduxStateObj();

    /**
     * Logic for saving event
     */
    const handleEventSave = async (date: any) => {
      const eventsArray: any[] = stateClone[date];
      // Check if there is date in redux store with event datekey
      // Datekey exists, add new item or update existing
      if (eventsArray && eventsArray.length > 0) {
        const itemInState: any = await findInArrayWithIndex(
          eventsArray,
          simpleEventObj
        );
        // Item exists, update it
        if (itemInState.children) {
          stateClone[date][itemInState.index] = simpleEventObj;
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        } else {
          eventsArray.push(simpleEventObj);
          if (i + 1 === data.length) {
            reduxStore.dispatch(setEvents(stateClone));
            reduxStore.dispatch(setEventsAreFetching(false));
          }
        }
      } else {
        stateClone[date] = [];
        stateClone[date].push(simpleEventObj);
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
    const dateKey: string = newEvent.getDateKey();

    await handleEventSave(dateKey);
  }
};

const decryptEventPgp = async (
  password: string,
  pgpKeys: PgpKeys,
  item: EventResultDTO,
  defaultTimezone?: string
): Promise<any> => {
  const eventResultDTO: EventResultDTO = item;
  let decryptedData: any = await OpenPgp.decrypt(
    pgpKeys.publicKey,
    pgpKeys.privateKey,
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
    const pgpKeys: PgpKeys = store.pgpKeys;
    const password: string = store.password;
    const syncLog: ISyncLog = store.syncLog;
    const defaultTimezone: string = store.defaultTimezone;

    const response: AxiosResponse = await CalendarApi.getAllEventsLastSync(
      syncLog.eventsAll
    );

    const result: any = stateClone;

    const { data } = response;

    const decryptedEvents: any = []
    for (const item of data) {
      const event: any = await decryptEventPgp(
          password,
          pgpKeys,
          item,
          defaultTimezone
      );

      decryptedEvents.push(event);
    }

    for (const item of decryptedEvents) {
      if (store.allEvents.length === 0) {
        result.push(item)
      } else {
        for (let i: number = 0; i < result.length; i += 1) {
          if (result[i].ix === item.id) {
            result[i] = await decryptEventPgp(
                password,
                pgpKeys,
                item,
                defaultTimezone
            );
          } else {
            if (i + 1 === decryptedEvents.length) {
              result.push(item)
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
    const pgpKeys: PgpKeys = store.pgpKeys;

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
      const eventResultDTO: EventResultDTO = data[i];

      let decryptedData: any = await OpenPgp.decrypt(
        pgpKeys.publicKey,
        pgpKeys.privateKey,
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
        calendarSettings.defaultTimezone
      );
      const simpleEventObj: EventStateEntity = newEvent.getReduxStateObj();

      /**
       * Logic for saving event
       */
      const handleEventSave = async (date: any) => {
        const eventsArray: any[] = stateClone[date];
        // Check if there is date in redux store with event datekey
        // Datekey exists, add new item or update existing
        if (eventsArray && eventsArray.length > 0) {
          const itemInState: any = await findInArrayWithIndex(
            eventsArray,
            simpleEventObj
          );
          // Item exists, update it
          if (itemInState.children) {
            stateClone[date][itemInState.index] = simpleEventObj;
            if (i + 1 === data.length) {
              reduxStore.dispatch(setEvents(stateClone));
              reduxStore.dispatch(setEventsAreFetching(false));
            }
          } else {
            eventsArray.push(simpleEventObj);
            if (i + 1 === data.length) {
              reduxStore.dispatch(setEvents(stateClone));
              reduxStore.dispatch(setEventsAreFetching(false));
            }
          }
        } else {
          stateClone[date] = [];
          stateClone[date].push(simpleEventObj);
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
      const dateKey: string = newEvent.getDateKey();

      await handleEventSave(dateKey);
    }
  },

  addEvent: async (id: string) => {
    const store: any = reduxStore.getState();
    const { rangeFrom, rangeTo } = store;

    const eventInState: EventStateEntity | null = await findInEvents(id);

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
