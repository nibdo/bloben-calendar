import {
  ALARM_TYPE,
  ATTENDEE_PARTSTAT,
  ATTENDEE_ROLE,
  EVENT_TYPE,
  REPEATED_EVENT_CHANGE_TYPE,
  SOURCE_TYPE,
} from '../enums';
import { DateTimeObject } from 'ical-js-parser';
import { EventStyle } from '../interface';

export interface Organizer {
  CN: string;
  mailto: string;
}

export interface Attendee {
  CN: string;
  mailto: string;
  ROLE: ATTENDEE_ROLE;
  RSVP: string;
  PARTSTAT: ATTENDEE_PARTSTAT;
}

export interface AlarmRequest {
  id: string;
  alarmType: ALARM_TYPE;
  amount: number;
  timeUnit: string;
  payload: string;
}
export interface Attendee {
  cn: string;
  role: string;
  rsvp: string;
  partstat: string;
  mailto: string;
}

export interface EmailInvite {
  eventDecrypted: any;
  attendees: Attendee[];
}

export interface EmailInviteData {
  subject: string;
  body: string;
  from: string;
  ical: string;
  method: string;
  recipients: string[];
}

export interface GetEventResponse {
  id: string;
  data: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string;
  color: string;
  alarms: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  internalID?: string;
  externalID: string;
}

export interface CreateCalDavEventRequest {
  externalID: string;
  calendarID: string;
  iCalString: string;
  sendInvite?: boolean;
  inviteMessage?: string;
}

interface PrevEventInRequest {
  id: string;
  externalID: string;
  url: string;
  etag: string;
}

export interface UpdateCalDavEventRequest {
  id: string;
  calendarID: string;
  iCalString: string;
  externalID: string;
  etag: string;
  url: string;
  prevEvent: PrevEventInRequest | null;
  sendInvite?: boolean;
  inviteMessage?: string;
}

export interface UpdateRepeatedCalDavEventRequest {
  id: string;
  event: EventResult;
  calendarID: string;
  externalID: string;
  etag: string;
  url: string;
  type: REPEATED_EVENT_CHANGE_TYPE;
  prevEvent: PrevEventInRequest | null;
  sendInvite?: boolean;
  inviteMessage?: string;
}

export interface DeleteCalDavEventRequest {
  calendarID: string;
  id: string;
  etag: string;
  url: string;
  sendInvite?: boolean;
  inviteMessage?: string;
}

export interface DeleteRepeatedCalDavEventRequest
  extends DeleteCalDavEventRequest {
  type: REPEATED_EVENT_CHANGE_TYPE;
  iCalString?: string;
  recurrenceID?: DateTimeObject;
  exDates?: DateTimeObject[];
  sendInvite?: boolean;
  inviteMessage?: string;
}

export interface EventBody {
  id: string;
  data: string;
  calendarID: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string;
  timezoneEndAt: string;
  allDay: boolean;
  isRepeated: boolean;
  rRule: string | null;
  alarms: AlarmRequest[];
  eventInvite?: EmailInvite | null;
  createdAt: string;
  updatedAt: string;
  externalID?: string | null;
  deletedAt?: string | null;
}

interface EventResultProps {
  exdate?: any[];
  alarms?: any[];
  attendee?: any[];
  status?: string;
  created?: any;
  lastModified?: any;
  transp?: any;
  organizer?: any;
  sequence?: any;
  recurrenceId?: any;
}

export interface EventResult {
  id: string; // entity id
  externalID: string; // caldav, webcal id
  internalID?: string; // id to ref repeated events
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
  timezoneEndAt: string | null;
  summary: string;
  description: string;
  location: string;
  allDay?: boolean;
  rRule: string | null;
  isRepeated: boolean;
  etag?: string;
  url?: string;
  sourceType: SOURCE_TYPE;
  type: EVENT_TYPE;
  color: string;
  calendarID: string;
  props?: EventResultProps;
  attendees?: Attendee[] | null;
  exdates?: any[];
  valarms?: any[];
  organizer?: Organizer | null;
  recurrenceID?: any;
  createdAt: string;
  updatedAt: string;
  style?: EventStyle;
}

export interface UpdatePartstatStatusRequest {
  status: ATTENDEE_PARTSTAT;
  sendInvite?: boolean;
  inviteMessage?: string;
}

export interface SearchEventsResponse {
  id: string;
  summary: string;
  startAt: string;
  endAt: string;
  timezoneStartAt: string | null;
  sourceType: SOURCE_TYPE;
  type: EVENT_TYPE;
}

export interface DuplicateMultipleCalDavEventsBody {
  dates: string[];
  sendInvite?: boolean;
  inviteMessage?: string;
}
