import Axios from 'bloben-common/utils/axios';
import { CALENDAR_URL } from '../bloben-common/globals/url';
import { AxiosResponse } from 'axios';
import { IPatchUpdate } from '../bloben-package/types/common.types';
import { APP_API_VERSION_1 } from '../bloben-package/api/account.api';
import { stompClient } from '../bloben-package/layers/WebsocketProvider';

export const APP_API_PREFIX = 'calendar-app';
export const API_GET_CALENDAR_SETTINGS = 'settings';
export const API_GET_SCHEDULED_REMINDERS = 'scheduled-reminders';
export const API_SET_TIMEZONE = 'settings/timezone';
export const API_UPDATE_SETTINGS = 'settings';
export const API_SET_ALARM = 'settings/alarm';

export const WEBSOCKET_GET_ONE_EVENT = '/app/events/get/one';
export const WEBSOCKET_GET_ALL_EVENTS = '/app/events/get/all';
export const WEBSOCKET_GET_EVENTS = '/app/events/get';
export const WEBSOCKET_CREATE_EVENT = '/app/events/create';
export const WEBSOCKET_IMPORT_EVENTS = '/app/events/import';
export const WEBSOCKET_UPDATE_EVENT = '/app/events/update';
export const WEBSOCKET_DELETE_EVENT = '/app/events/delete';
export const WEBSOCKET_SYNC_EVENTS = '/app/events/sync';
export const WEBSOCKET_SYNC_TIMEZONES = '/app/events/timezone';
export const WEBSOCKET_SYNC_TIMEZONES_CALENDARS = '/app/calendars/timezone';

export const WEBSOCKET_GET_ALL_CALENDARS = '/app/calendars/get';
export const WEBSOCKET_GET_ONE_CALENDAR = '/app/calendars/get/one';
export const WEBSOCKET_CREATE_CALENDAR = '/app/calendars/create';
export const WEBSOCKET_UPDATE_CALENDAR = '/app/calendars/update';
export const WEBSOCKET_DELETE_CALENDAR = '/app/calendars/delete';
export const WEBSOCKET_SYNC_CALENDARS = '/app/calendars/sync';

export const WEBSOCKET_GET_NOTIFICATIONS = '/app/notifications/get/all';
export const WEBSOCKET_GET_ONE_NOTIFICATION = '/app/notifications/get/one';
export const WEBSOCKET_READ_NOTIFICATION = '/app/notifications/read';

export const WEBSOCKET_GET_ONE_CONTACT = '/app/contacts/get/one';

export const sendWebsocketMessage = (
  destination: string,
  data?: any | null
) => {
  stompClient.send(destination, {}, data ? JSON.stringify(data) : null);
};

const CalendarApi = {
  getCalendarSettings: async (): Promise<AxiosResponse> => {
    return Axios.get(
      `${APP_API_VERSION_1}/${APP_API_PREFIX}/${API_GET_CALENDAR_SETTINGS}`
    );
  },
  setTimezone: async (timezone: string) => {
    await Axios.patch(
      `${APP_API_VERSION_1}/${APP_API_PREFIX}/${API_SET_TIMEZONE}`,
      { timezone }
    );
  },
  setDefaultAlarm: async (defaultAlarm: string) => {
    await Axios.patch(
      `${APP_API_VERSION_1}/${APP_API_PREFIX}/${API_SET_ALARM}`,
      { defaultAlarm }
    );
  },
  updateSettings: async (data: IPatchUpdate): Promise<AxiosResponse> => {
    return Axios.patch(
      `${APP_API_VERSION_1}/${APP_API_PREFIX}/${API_UPDATE_SETTINGS}`,
      data
    );
  },
  getScheduledReminders: async () => {
    const result: any = await Axios.get(
      `${APP_API_VERSION_1}/${APP_API_PREFIX}/${API_GET_SCHEDULED_REMINDERS}`
    );

    if (result) {
      return result.data;
    }

    return;
  },
  /*
   * Get calendars from server, check only new one after repeated attempts
   * Update timestamp of last server check
   */
  getCalendars: async (lastSyncAt: string) => {
    const getDataUrl = `${APP_API_VERSION_1}/${CALENDAR_URL}/calendars?lastSyncAt=${lastSyncAt}`;

    const result: any = await Axios.get(getDataUrl);

    return result;
  },
  getCalendarById: async (id: string) => {
    return Axios.get(`${APP_API_VERSION_1}/${CALENDAR_URL}/calendars/${id}`);
  },
  createCalendar: async (data: any) => {
    return Axios.post(`${APP_API_VERSION_1}/${CALENDAR_URL}/calendars/`, data);
  },
  updateCalendar: async (data: any) => {
    return Axios.put(`${APP_API_VERSION_1}/${CALENDAR_URL}/calendars/`, data);
  },
  deleteCalendar: async (data: any) => {
    return Axios.delete(
      `${APP_API_VERSION_1}/${CALENDAR_URL}/calendars/`,
      data
    );
  },
  syncCalendars: async (data: any) => {
    return Axios.post(
      `${APP_API_VERSION_1}/${CALENDAR_URL}/calendars/sync`,
      data
    );
  },
  getEvents: async (query: any) => {
    return Axios.get(`${APP_API_VERSION_1}/${CALENDAR_URL}/events${query}`);
  },
  getAllEventsLastSync: async (lastSync: string) => {
    return Axios.get(
      `${APP_API_VERSION_1}/${CALENDAR_URL}/events/all?lastSync=${lastSync}`
    );
  },
  createEvent: async (itemLocal: any) => {
    return Axios.post(`${APP_API_VERSION_1}/${CALENDAR_URL}/events`, itemLocal);
  },
  getEventById: async (id: string, rangeFrom: string, rangeTo: string) => {
    return Axios.get(
      `${APP_API_VERSION_1}/${CALENDAR_URL}/events/${id}?rangeFrom=${rangeFrom}&rangeTo=${rangeTo}`
    );
  },
  updateEvent: async (itemLocal: any) => {
    return Axios.put(`${APP_API_VERSION_1}/${CALENDAR_URL}/events`, itemLocal);
  },
  deleteEvent: async (item: any) => {
    return Axios.delete(`${APP_API_VERSION_1}/${CALENDAR_URL}/events`, {
      id: item.id,
    });
  },
  saveCalendar: async (itemLocal: any) => {
    return Axios.post(
      `${APP_API_VERSION_1}/${CALENDAR_URL}/calendars`,
      itemLocal
    );
  },
  sendInvite: async (item: any) => {
    return Axios.post(
      `${APP_API_VERSION_1}/${CALENDAR_URL}/event/invite`,
      item
    );
  },
};

export default CalendarApi;
