import {
  CalendarDays,
  CalendarView,
  ICalendarSettings,
} from '../../types/types';
import { User, Contact, Calendar } from 'bloben-utils';
import { UserProfile } from 'bloben-react/types/common.types';

export const setUser = (user: User) => {
  return {
    type: 'SET_USER',
    payload: user,
  };
};

export const setPgpKeys = (pgpKeys: any) => {
  return {
    type: 'SET_PGP_KEYS',
    payload: pgpKeys,
  };
};
export const setDefaultCalendar = (calendarId: string) => {
  return {
    type: 'SET_DEFAULT_CALENDAR',
    payload: calendarId,
  };
};
export const setPassword = (password: string) => {
  return {
    type: 'SET_PASSWORD',
    payload: password,
  };
};
export const setUserProfile = (userProfile: UserProfile) => {
  return {
    type: 'SET_USER_PROFILE',
    payload: userProfile,
  };
};
export const setContacts = (contacts: Contact[]) => {
  return {
    type: 'SET_CONTACTS',
    payload: contacts,
  };
};
export const addContact = (data: any) => {
  return {
    type: 'ADD_CONTACT',
    payload: data,
  };
};

export const setWarning = (value: boolean) => {
  return {
    type: 'SET_WARNING',
    payload: value,
  };
};
export const setTimezones = (timezones: string[]) => {
  return {
    type: 'SET_TIMEZONES',
    payload: timezones,
  };
};
export const setDefaultTimezone = (timezone: string) => {
  return {
    type: 'SET_DEFAULT_TIMEZONE',
    payload: timezone,
  };
};
export const setCalendarSettings = (data: ICalendarSettings) => {
  return {
    type: 'SET_CALENDAR_SETTINGS',
    payload: data,
  };
};
export const updateTimezoneSetting = (data: string) => {
  return {
    type: 'UPDATE_TIMEZONE_SETTING',
    payload: data,
  };
};
export const updateAutoUpdateTimezoneSetting = (data: boolean) => {
  return {
    type: 'UPDATE_AUTO_UPDATE_TIMEZONE_SETTING',
    payload: data,
  };
};

export const setRangeFrom = (d: string) => {
  return {
    type: 'SET_RANGE_FROM',
    payload: d,
  };
};

export const setRangeTo = (d: string) => {
  return {
    type: 'SET_RANGE_TO',
    payload: d,
  };
};

export const setCalendarDays = (days: CalendarDays) => {
  return {
    type: 'SET_CALENDAR_DAYS',
    payload: days,
  };
};
export const setCalendarDaysCurrentIndex = (index: number) => {
  return {
    type: 'SET_CALENDAR_DAYS_CURRENT_INDEX',
    payload: index,
  };
};
export const resetCalendarDaysCurrentIndex = () => {
  return {
    type: 'RESET_CALENDAR_DAYS_CURRENT_INDEX',
  };
};
export const addCalendar = (data: any) => {
  return {
    type: 'ADD_CALENDAR',
    payload: data,
  };
};
export const updateCalendar = (data: any) => {
  return {
    type: 'UPDATE_CALENDAR',
    payload: data,
  };
};
export const deleteCalendar = (data: any) => {
  return {
    type: 'DELETE_CALENDAR',
    payload: data,
  };
};
export const setCalendars = (data: Calendar[]) => {
  return {
    type: 'SET_CALENDARS',
    payload: data,
  };
};
export const setEvents = (data: any) => {
  return {
    type: 'SET_EVENTS',
    payload: data,
  };
};
export const addEvents = (data: any) => {
  return {
    type: 'ADD_EVENTS',
    payload: data,
  };
};
export const mergeEvent = (data: any) => {
  return {
    type: 'MERGE_EVENT',
    payload: data,
  };
};
export const setEventsLastSync = (data: any) => {
  return {
    type: 'SET_EVENTS_LAST_SYNC',
    payload: data,
  };
};
export const setAllEventsLastSync = () => {
  return {
    type: 'SET_ALL_EVENTS_SYNC_LOG',
  };
};
export const setAllEventsSyncLog = () => {
  return {
    type: 'SET_ALL_EVENTS_SYNC_LOG',
  };
};
export const setEventsSyncLog = () => {
  return {
    type: 'SET_EVENTS_SYNC_LOG',
  };
};
export const setCalendarsSyncLog = () => {
  return {
    type: 'SET_CALENDARS_SYNC_LOG',
  };
};
export const setContactsSyncLog = () => {
  return {
    type: 'SET_CONTACTS_SYNC_LOG',
  };
};
export const setNotificationsSyncLog = () => {
  return {
    type: 'SET_NOTIFICATIONS_SYNC_LOG',
  };
};
export const setAllEvents = (data: any) => {
  return {
    type: 'SET_ALL_EVENTS',
    payload: data,
  };
};
export const setEventsToImport = (data: any) => {
  return {
    type: 'SET_EVENTS_TO_IMPORT',
    payload: data,
  };
};
export const setIsFirstLogin = (data: boolean) => {
  return {
    type: 'SET_IS_FIRST_LOGIN',
    payload: data,
  };
};
export const setCalendarView = (data: CalendarView) => {
  return {
    type: 'SET_CALENDAR_VIEW',
    payload: data,
  };
};

export const setIsDark = (data: boolean) => {
  return {
    type: 'SET_IS_DARK',
    payload: data,
  };
};

export const setIsMobile = (data: boolean) => {
  return {
    type: 'SET_IS_MOBILE',
    payload: data,
  };
};

export const setIsLoading = (data: boolean) => {
  return {
    type: 'SET_IS_LOADING',
    payload: data,
  };
};
export const setIsAppStarting = (data: boolean) => {
  return {
    type: 'SET_IS_APP_STARTING',
    payload: data,
  };
};

export const setNotifications = (data: any) => {
  return {
    type: 'SET_NOTIFICATIONS',
    payload: data,
  };
};
export const addNotification = (data: any) => {
  return {
    type: 'ADD_NOTIFICATION',
    payload: data,
  };
};
export const setSelectedDate = (data: any) => {
  return {
    type: 'SET_SELECTED_DATE',
    payload: data,
  };
};
export const setEventsAreFetching = (data: any) => {
  return {
    type: 'SET_EVENTS_ARE_FETCHING',
    payload: data,
  };
};
export const setCalendarBodyWidth = (data: any) => {
  return {
    type: 'SET_CALENDAR_BODY_WIDTH',
    payload: data,
  };
};
export const setCalendarBodyHeight = (data: any) => {
  return {
    type: 'SET_CALENDAR_BODY_HEIGHT',
    payload: data,
  };
};
