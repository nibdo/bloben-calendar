import { reduxStore } from '../../bloben-package/layers/ReduxLayer';
import OpenPgp, { PgpKeys } from '../../bloben-utils/utils/OpenPgp';
import { cloneDeep, findInArrayById } from '../common';
import CalendarStateEntity from '../../data/models/state/calendar.entity';
import {
  addCalendar, setAllEvents,
  setCalendars,
  setCalendarsSyncLog, setEvents,
  updateCalendar
} from '../../redux/actions';
import { AxiosResponse } from 'axios';
import CalendarApi from '../../api/calendar';
import { DateTime } from 'luxon';
import { ISyncLog } from '../../types/types';

const decryptCalendar = async (
  item: any,
  pgpKeys: PgpKeys,
  password: string
): Promise<any> => {
  let decryptedData: any = await OpenPgp.decrypt(
    pgpKeys.publicKey,
    pgpKeys.privateKey,
    password,
    item.data
  );
  decryptedData = JSON.parse(decryptedData);

  // Merge
  const decryptedCalendar: any = { ...item, ...decryptedData };

  return new CalendarStateEntity(
      decryptedCalendar
  ).getStoreObj();
};

const SyncCalendars: any = {
  getAll: async () => {
    const store: any = reduxStore.getState();
    const password: string = store.password;
    const pgpKeys: PgpKeys = store.pgpKeys;
    const syncLog: ISyncLog = store.syncLog;
    const stateClone: any = cloneDeep(store.calendars);

    console.log('store', store)
    const response: AxiosResponse = await CalendarApi.getCalendars(syncLog.calendars);

    reduxStore.dispatch(setCalendarsSyncLog());

    const { data } = response;

    for (const item of data) {
      const { id } = item;

      const calendar: any = await decryptCalendar(
        item,
        pgpKeys,
        password
      );

      const calendarInState: CalendarStateEntity | null = await findInArrayById(
        stateClone,
        id
      );

      // Create calendar
      if (!calendarInState) {
        reduxStore.dispatch(addCalendar(calendar));
      } else {
        // Update calendar in state
        // const newState: any = stateClone.filter((clonedCalendar: any) =>
        //   clonedCalendar.id === id ? calendar : clonedCalendar
        // );
        reduxStore.dispatch(updateCalendar(calendar));
        // TODO calendar and event color update
      }
    }
  },
  addCalendar: async (id: string) => {
    const store: any = reduxStore.getState();
    const password: string = store.password;
    const pgpKeys: PgpKeys = store.pgpKeys;

    const response: AxiosResponse = await CalendarApi.getCalendarById(id);

    const calendar: any = await decryptCalendar(
        response.data,
        pgpKeys,
        password
    );

    reduxStore.dispatch(addCalendar(calendar));
  },
  updateCalendar: async (id: string) => {
    const store: any = reduxStore.getState();
    const password: string = store.password;
    const pgpKeys: PgpKeys = store.pgpKeys;

    const response: AxiosResponse = await CalendarApi.getCalendarById(id);

    const calendar: any = await decryptCalendar(
        response.data,
        pgpKeys,
        password
    );

    reduxStore.dispatch(updateCalendar(calendar));
  },
  deleteAllCalendarEvents: (calendarId: string, events: any) => {
    const eventsObj: any = Object.entries(events);

    const result: any = {};

    for (const [key, value] of eventsObj) {
      result[key] = value.filter((item: any) => item.calendarId !== calendarId);
    }

    return result;
  },
  deleteCalendar: (calendarId: string) => {
    const store: any = reduxStore.getState();
    const stateCloneCalendars: any = cloneDeep(store.calendars);
    const stateCloneEvents: any = cloneDeep(store.events);
    const stateCloneAllEvents: any = cloneDeep(store.allEvents);

    // Delete calendar
    const filteredCalendars: any = stateCloneCalendars.filter(
        (item: any) => item.id !== calendarId
    );

    // Delete all events from this calendar
    const filteredEvents: any = SyncCalendars.deleteAllCalendarEvents(
        calendarId,
        stateCloneEvents
    );

    const filteredAllEvents: any = stateCloneAllEvents.filter(
        (item: any) => item.calendarId !== calendarId
    );

    reduxStore.dispatch(setCalendars(filteredCalendars));
    reduxStore.dispatch(setEvents(filteredEvents));
    reduxStore.dispatch(setAllEvents(filteredAllEvents));
  },
  /**
   * Compare client and server data and sync differences
   */
  syncClientServer: async () => {
    const store: any = reduxStore.getState();
    const stateCloneCalendars: any = cloneDeep(store.calendars);

    // Get all client data
    const calendars: any[] = stateCloneCalendars.map((item: any) => {
      const { id, updatedAt } = item;

      return { id, updatedAt };
    });

    const response: AxiosResponse = await CalendarApi.syncCalendars(calendars);

    const {data} = response;

    console.log('data', data)

    for (const item of data) {
      const {id, action} = item;
      switch (action) {
        case ('update'):
          await SyncCalendars.updateCalendar(id);
          break;
        case ('delete'):
          await SyncCalendars.deleteCalendar(id);
          break;
        default:
      }
    }
  }

};

export default SyncCalendars;
