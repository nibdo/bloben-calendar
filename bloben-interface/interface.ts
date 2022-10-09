import { Attendee, DateTimeObject, Organizer } from 'ical-js-parser';
import { DAVCalendarObject } from 'tsdav';
import { EventResult } from './app/event';
import { SOCKET_APP_TYPE, SOCKET_CRUD_ACTION } from './enums';

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
