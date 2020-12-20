import Axios from 'bloben-common/utils/axios';
import { CALENDAR_URL } from '../bloben-common/globals/url';
import { stompClient } from '../layers/authenticated-layer';

export const APP_API_PREFIX: string = '/calendar-app';
export const API_GET_CALENDAR_SETTINGS: string = 'settings';

export const WEBSOCKET_GET_ONE_EVENT: string = '/app/events/get/one'
export const WEBSOCKET_GET_ALL_EVENTS: string = '/app/events/get/all'
export const WEBSOCKET_GET_EVENTS: string = '/app/events/get';
export const WEBSOCKET_CREATE_EVENT: string = '/app/events/create';
export const WEBSOCKET_IMPORT_EVENTS: string = '/app/events/import';
export const WEBSOCKET_UPDATE_EVENT: string = '/app/events/update';
export const WEBSOCKET_DELETE_EVENT: string = '/app/events/delete';
export const WEBSOCKET_SYNC_EVENTS: string = '/app/events/sync';

export const WEBSOCKET_GET_ALL_CALENDARS: string = '/app/calendars/get';
export const WEBSOCKET_GET_ONE_CALENDAR: string = '/app/calendars/get/one';
export const WEBSOCKET_CREATE_CALENDAR: string = '/app/calendars/create';
export const WEBSOCKET_UPDATE_CALENDAR: string = '/app/calendars/update';
export const WEBSOCKET_DELETE_CALENDAR: string = '/app/calendars/delete';
export const WEBSOCKET_SYNC_CALENDARS: string = '/app/calendars/sync';

export const sendWebsocketMessage = (destination: string, data?: any | null) => {
  stompClient.send(destination, {}, data ? JSON.stringify(data) : null
  );
}

const CalendarApi = {
  getCalendarSettings: async () => {
    const result: any = (await Axios.get(`${APP_API_PREFIX}/${API_GET_CALENDAR_SETTINGS}`)).data;

    return result;
  },
  /*
   * Get calendars from server, check only new one after repeated attempts
   * Update timestamp of last server check
   */
  getCalendars: async () => {
    // Try to load session from local database
    // const lastSyncServerAt: string = await SyncingHandler.getFromServer();
    //
    // const lastSyncLocalAt: string = await SyncingHandler.getFromLocal();
    //
    // if (!lastSyncLocalAt) {
    //   await SyncingHandler.create(lastSyncServerAt);
    // }

    const getDataUrl: string = `/${CALENDAR_URL}/calendars`;

    // Update only new items
    // if (lastSyncLocalAt) {
    //   getDataUrl = `${getDataUrl}/?dateFrom=${lastSyncLocalAt}`;
    // }

    const result: any = (await Axios.get(getDataUrl)).data;

    // Update local session timestamp
    // await SyncingHandler.update(lastSyncServerAt);

    return result;
  },
  getEvents: async (query: any) => {
    return Axios.get(`/${CALENDAR_URL}/events${query}`);
  },
  saveEvent: async (itemLocal: any) => {
    const result: any = (await Axios.post(`/${CALENDAR_URL}/event`, itemLocal))
      .data;

    return result;
  },
  updateEvent: async (itemLocal: any) => {
    return Axios.put(`/${CALENDAR_URL}/event`, itemLocal);
  },
  deleteEvent: async (item: any) => {
    return Axios.delete(`/${CALENDAR_URL}/event`, { id: item.id });
  },
  saveCalendar: async (itemLocal: any) => {
    const result: any = (
      await Axios.post(`/${CALENDAR_URL}/calendar`, itemLocal)
    ).data;

    return result;
  },
};

export default CalendarApi;
