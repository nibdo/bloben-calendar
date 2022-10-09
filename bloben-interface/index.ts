export * from './2fa/2fa';
export * from './admin/auth';
export * from './admin/serverSettings';
export * from './app/auth';
export * from './app/calDavAccount';
export * from './app/calDavCalendar';
export * from './app/caldavEvent';
export * from './app/calDavTask';
export * from './app/CalDavTaskLabel';
export * from './app/calendarSettings';
export * from './app/calendarShared';
export * from './app/cardDavAddressBook';
export * from './app/cardDavContact';
export * from './app/event';
export * from './app/eventAlarm';
export * from './app/socket';
export * from './app/userEmailConfig';
export * from './app/version';
export * from './app/webcalCalendar';
export * from './public/SharedLinkPublic';
export * from './interface';
export * from './app/profile';

export enum ROLE {
  ADMIN = 'ADMIN',
  DEMO = 'DEMO',
  USER = 'USER',
}

export enum ALARM_TYPE {
  PUSH = 'PUSH',
  UNKNOWN = 'UNKNOWN',
}

export enum ALARM_UNIT {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
}

export enum SOCKET_APP_TYPE {
  CALENDAR = 'CALENDAR',
  WEBCAL_CALENDAR = 'WEBCAL_CALENDAR',
  EVENT = 'EVENT',
  CALENDAR_SETTINGS = 'CALENDAR_SETTINGS',
  CONTACT = 'CONTACT',
  USER_PROFILE = 'USER_PROFILE',
  GENERAL = 'GENERAL',
  CALENDAR_AND_EVENTS = 'calendarAndEvents',
}

export enum SOCKET_CRUD_ACTION {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  BULK = 'BULK',
  FULL = 'FULL',
}

export enum SOURCE_TYPE {
  CALDAV = 'CALDAV',
  WEBCAL = 'WEBCAL',
}

export enum EVENT_TYPE {
  EVENT = 'EVENT',
  TASK = 'TASK',
}

export enum LOG_FILE_TYPE {
  COMBINED = 'combined',
  ERROR = 'error',
}

export enum CALDAV_COMPONENTS {
  VEVENT = 'VEVENT',
  VTODO = 'VTODO',
  VJOURNAL = 'VJOURNAL',
}

export enum REPEATED_EVENT_CHANGE_TYPE {
  ALL = 'ALL',
  SINGLE = 'SINGLE',
  SINGLE_RECURRENCE_ID = 'SINGLE_RECURRENCE_ID',
  THIS_AND_FUTURE = 'THIS_AND_FUTURE',
}

export enum ATTENDEE_PARTSTAT {
  ACCEPTED = 'ACCEPTED',
  TENTATIVE = 'TENTATIVE',
  DECLINED = 'DECLINED',
  NEEDS_ACTION = 'NEEDS-ACTION',
}

export enum ATTENDEE_ROLE {
  REQ_PARTICIPANT = 'REQ-PARTICIPANT',
  OPT_PARTICIPANT = 'OPT-PARTICIPANT',
}

export enum DAV_ACCOUNT_TYPE {
  CALDAV = 'caldav',
  CARDDAV = 'carddav',
}

export enum LOCATION_PROVIDER {
  OPEN_STREET_MAPS = 'OpenStreetMap',
  GOOGLE_MAPS = 'Google Maps',
}

export const allowedLanguages: { label: string; value: string }[] = [
  { label: 'English', value: 'en' },
  {
    label: 'Czech',
    value: 'cs',
  },
  {
    label: 'Chinese',
    value: 'zh',
  },
  {
    label: 'German',
    value: 'de',
  },
  {
    label: 'Dutch',
    value: 'nl',
  },
  {
    label: 'Estonian',
    value: 'et',
  },
  {
    label: 'French',
    value: 'fr',
  },
  {
    label: 'Italian',
    value: 'it',
  },
  {
    label: 'Korean',
    value: 'ko',
  },
  {
    label: 'Norwegian',
    value: 'no',
  },
  {
    label: 'Polish',
    value: 'pl',
  },
  {
    label: 'Portuguese',
    value: 'pt',
  },
  {
    label: 'Slovak',
    value: 'sk',
  },
  {
    label: 'Swedish',
    value: 'sw',
  },
  {
    label: 'Spanish',
    value: 'es',
  },
  {
    label: 'Slovenian',
    value: 'sl',
  },
  {
    label: 'Hungarian',
    value: 'hu',
  },
];

import { Attendee, DateTimeObject, Organizer } from 'ical-js-parser';
import { DAVCalendarObject } from 'tsdav';
import { EventResult } from './app/event';

export interface CommonResponse {
  message: string;
  data: any;
}

export interface SyncRequestV1 {
  id: string;
  updatedAt: string;
}

export interface SocketCrudAction {
  id: string;
  action: SOCKET_CRUD_ACTION;
  type: SOCKET_APP_TYPE;
  updatedAt: string;
}

export interface EventSyncAction {
  id: string;
  action: SOCKET_CRUD_ACTION;
  type: SOCKET_APP_TYPE;
  updatedAt: string;
  event?: EventResult;
}

export interface Range {
  rangeFrom: string;
  rangeTo: string;
}

export interface AlarmEvent {
  trigger: string;
  action?: string;
  [key: string]: any;
}
export interface EventJSON {
  begin: string;
  end: string;
  dtstart: DateTimeObject;
  dtend: DateTimeObject;
  dtstamp?: DateTimeObject;
  organizer?: Organizer;
  uid?: string;
  attendee?: Attendee[];
  created?: DateTimeObject;
  description?: string;
  lastModified?: DateTimeObject;
  location?: string;
  sequence?: string;
  summary?: string;
  transp?: string;
  rrule?: string;
  status?: string;
  recurrenceId?:
    | {
        TZID: string;
      }
    | string;
  alarms?: AlarmEvent[];
  [key: string]: any;
}
export interface CalDavEvent extends DAVCalendarObject {
  id: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezone: string | null;
  isRepeated: boolean;
  rRule: string | null;
  summary: string | null;
  etag: string;
  location: string | null;
  description: string | null;
  color: string;
  alarms?: AlarmEvent[];
  recurenceID?: string;
  internalID?: string;
}

export interface Log {
  timestamp: string;
  message: string;
  level: string;
  tags: string[];
}

export interface CalendarAlarms {
  amount: number;
  timeUnit: string;
}

export interface EventStyle {
  textDecoration?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  color?: string;
  border?: string;
}
