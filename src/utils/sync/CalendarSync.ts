import { AxiosResponse } from 'axios';

import { reduxStore } from '../../bloben-package/layers/ReduxProvider';
import OpenPgp from '../../bloben-utils/utils/OpenPgp';
import { cloneDeep, findInArrayById } from '../common';
import {
  addCalendar,
  setAllEvents,
  setCalendars,
  setCalendarsSyncLog,
  setEvents,
  updateCalendar,
} from '../../redux/actions';
import CalendarApi from '../../api/calendar';
import { ISyncLog, ReduxState } from '../../types/types';
import { User } from '../../bloben-utils/models/User';
import { Calendar, createCalendar } from '../../bloben-utils/models/Calendar';
import { CalendarEncrypted } from 'bloben-utils/models/CalendarEncrypted';

const decryptCalendar = async (
  item: CalendarEncrypted,
  user: User,
  password: string
): Promise<Calendar> => {
  let decryptedData: any = await OpenPgp.decrypt(
    user.publicKey,
    user.privateKey,
    password,
    item.data
  );
  decryptedData = JSON.parse(decryptedData);

  // Merge
  const decryptedCalendar: Calendar = { ...item, ...decryptedData };

  return createCalendar(decryptedCalendar);
};

const SyncCalendars: any = {
  getAll: async (): Promise<void> => {
    const store: ReduxState = reduxStore.getState();
    const password: string = store.password;
    const user: User = store.user;
    const syncLog: ISyncLog = store.syncLog;
    const stateClone: Calendar[] = cloneDeep(store.calendars);

    const response: AxiosResponse = await CalendarApi.getCalendars(
      syncLog.calendars
    );

    reduxStore.dispatch(setCalendarsSyncLog());

    const { data } = response;

    for (const item of data) {
      const { id } = item;

      const calendar: Calendar = await decryptCalendar(item, user, password);

      const calendarInState: Calendar | null = await findInArrayById(
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
  addCalendar: async (id: string): Promise<void> => {
    const store: ReduxState = reduxStore.getState();
    const password: string = store.password;
    const user: User = store.user;

    const response: AxiosResponse = await CalendarApi.getCalendarById(id);

    const calendar: Calendar = await decryptCalendar(
      response.data,
      user,
      password
    );

    reduxStore.dispatch(addCalendar(calendar));
  },
  updateCalendar: async (id: string): Promise<void> => {
    const store: ReduxState = reduxStore.getState();
    const password: string = store.password;
    const user: User = store.user;

    const response: AxiosResponse = await CalendarApi.getCalendarById(id);

    const calendar: Calendar = await decryptCalendar(
      response.data,
      user,
      password
    );

    reduxStore.dispatch(updateCalendar(calendar));
  },
  deleteAllCalendarEvents: (calendarId: string, events: any): Promise<void> => {
    const eventsObj: any = Object.entries(events);

    const result: any = {};

    for (const [key, value] of eventsObj) {
      result[key] = value.filter((item: any) => item.calendarId !== calendarId);
    }

    return result;
  },
  deleteCalendar: (calendarId: string): void => {
    const store: any = reduxStore.getState();
    const stateCloneCalendars: Calendar[] = cloneDeep(store.calendars);
    const stateCloneEvents: any = cloneDeep(store.events);
    const stateCloneAllEvents: any = cloneDeep(store.allEvents);

    // Delete calendar
    const filteredCalendars: Calendar[] = stateCloneCalendars.filter(
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
  syncClientServer: async (): Promise<void> => {
    const store: ReduxState = reduxStore.getState();
    const stateCloneCalendars: Calendar[] = cloneDeep(store.calendars);

    // Get all client data
    const calendars: any[] = stateCloneCalendars.map((item: Calendar) => {
      const { id, updatedAt } = item;

      return { id, updatedAt };
    });

    const response: AxiosResponse = await CalendarApi.syncCalendars(calendars);

    const { data } = response;

    for (const item of data) {
      const { id, action } = item;
      switch (action) {
        case 'update':
          await SyncCalendars.updateCalendar(id);
          break;
        case 'delete':
          await SyncCalendars.deleteCalendar(id);
          break;
        default:
      }
    }
  },
};

export default SyncCalendars;
