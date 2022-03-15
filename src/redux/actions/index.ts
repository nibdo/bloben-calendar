import {
  CalDavAccount,
  CalDavCalendar,
  CalDavEvent,
  User,
} from '../../types/interface';
import { GetEventResponse } from '../../bloben-interface/event/event';
import { OnPageChangeData } from 'kalend';
import { WebcalCalendar } from '../reducers/webcalCalendars';

export const setUser = (data: User) => {
  return {
    type: 'SET_USER',
    payload: data,
  };
};

export const setCaldavAccounts = (data: CalDavAccount[]) => {
  return {
    type: 'SET_CALDAV_ACCOUNTS',
    payload: data,
  };
};

export const addToCaldavAccounts = (data: CalDavAccount) => {
  return {
    type: 'ADD_TO_CALDAV_ACCOUNTS',
    payload: data,
  };
};
export const deleteCaldavAccount = (data: CalDavAccount) => {
  return {
    type: 'DELETE_CALDAV_ACCOUNT',
    payload: data,
  };
};

export const setCaldavCalendars = (data: CalDavCalendar[]) => {
  return {
    type: 'SET_CALDAV_CALENDARS',
    payload: data,
  };
};
export const addToCaldavCalendars = (data: CalDavCalendar[]) => {
  return {
    type: 'ADD_TO_CALDAV_CALENDARS',
    payload: data,
  };
};
export const updateCaldavCalendar = (data: CalDavCalendar) => {
  return {
    type: 'UPDATE_CALDAV_CALENDAR',
    payload: data,
  };
};
export const deleteCaldavCalendar = (data: CalDavCalendar) => {
  return {
    type: 'DELETE_CALDAV_CALENDAR',
    payload: data,
  };
};

export const setCaldavEvents = (data: CalDavEvent[] | GetEventResponse[]) => {
  return {
    type: 'SET_CALDAV_EVENTS',
    payload: data,
  };
};
export const addToCaldavEvents = (data: CalDavEvent[]) => {
  return {
    type: 'INSERT_CALDAV_EVENTS',
    payload: data,
  };
};
export const updateCalDavEvent = (data: CalDavEvent) => {
  return {
    type: 'UPDATE_CALDAV_EVENT',
    payload: data,
  };
};
export const deleteCaldavEvent = (data: CalDavEvent) => {
  return {
    type: 'DELETE_CALDAV_EVENT',
    payload: data,
  };
};
export const setCalendarDaysRange = (data: OnPageChangeData) => {
  return {
    type: 'SET_CALENDAR_DAYS_RANGE',
    payload: data,
  };
};
export const setBaseDateRange = (data: OnPageChangeData) => {
  return {
    type: 'SET_BASE_DATE_RANGE',
    payload: data,
  };
};
export const setSettings = (data: any) => {
  return {
    type: 'SET_SETTINGS',
    payload: data,
  };
};
export const updateSettings = (key: string, value: any) => {
  return {
    type: 'UPDATE_SETTINGS',
    payload: { key, value },
  };
};
export const setCachedEvents = (data: any[]) => {
  return {
    type: 'SET_CACHED_EVENTS',
    payload: data,
  };
};
export const deleteCachedEvent = (data: any) => {
  return {
    type: 'DELETE_CACHED_EVENT',
    payload: data,
  };
};
export const insertCachedEvents = (data: any) => {
  return {
    type: 'INSERT_CACHED_EVENTS',
    payload: data,
  };
};
export const updateCachedEvent = (data: any) => {
  return {
    type: 'UPDATE_CACHED_EVENT',
    payload: data,
  };
};
export const replace = (data: any) => {
  return {
    type: 'REPLACE',
    payload: data,
  };
};
export const setEventsSyncLog = (date: string) => {
  return {
    type: 'SET_EVENTS_SYNC_LOG',
    payload: date,
  };
};

export const setWebcalCalendars = (data: WebcalCalendar[]) => {
  return {
    type: 'SET_WEBCAL_CALENDARS',
    payload: data,
  };
};

export const addToWebcalCalendars = (data: WebcalCalendar) => {
  return {
    type: 'ADD_TO_WEBCAL_CALENDARS',
    payload: data,
  };
};
