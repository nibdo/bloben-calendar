import { Alarm } from 'ical-js-parser';
import { CALDAV_OBJ_TYPE } from './enums';
import {
  CalendarSettingsResponse,
  GetProfileResponse,
} from '../bloben-interface';

import { DAV_ACCOUNT_TYPE } from '../enums';
import { EVENT_TYPE, SOURCE_TYPE } from '../bloben-interface/enums';
import { OnPageChangeData } from 'kalend';
import { SettingsLocal } from '../redux/reducers/settingsLocal';
import { ThemeSettings } from '../redux/reducers/themeSettings';
import { WebcalCalendar } from '../redux/reducers/webcalCalendars';

export interface CalDavAccount {
  id: string;
  username: string;
  password: string;
  url: string;
  principalUrl: string;
  accountType: DAV_ACCOUNT_TYPE;
}

export interface QueryRange {
  rangeFrom: string;
  rangeTo: string;
}

export interface QueryRangeMillis {
  rangeFrom: number;
  rangeTo: number;
}

export interface CalDavCalendar {
  calDavAccountID: string;
  color: string;
  isHidden?: boolean;
  displayName: string;
  id: string;
  timezone: string;
  url: string;
  components: string[];
  alarms: any[];
  // [key: string]: any;
}

export interface CalDavEvent {
  id: string;
  calendarID?: string;
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
  alarms?: Alarm[];
  allDay: boolean;
  recurenceID?: string;
  internalID?: string;
  url: string;
  calendarUrl: string;
  type: EVENT_TYPE;
  sourceType: SOURCE_TYPE;
  [key: string]: any;
}

export interface AppSettings {
  logging: boolean;
  timeFormat: string;
  startOfWeek: string;
  defaultView: any;
  hourHeight: number;
  disabledViews: any[];
  timezone: string;
  hiddenCalendarIDs: string[];
}

export interface ReduxState {
  calDavAccounts: CalDavAccount[];
  calDavCalendars: CalDavCalendar[];
  calDavEvents: CalDavEvent[];
  calendarDaysRange: OnPageChangeData;
  baseDateRange: OnPageChangeData;
  settings: AppSettings;
  webcalCalendars: WebcalCalendar[];
  cachedEvents: any[];
  syncLog: SyncLog;
  user: GetProfileResponse;
  calendarSettings: CalendarSettingsResponse;
  themeSettings: ThemeSettings;
  settingsLocal: SettingsLocal;
}

export interface Duration {
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface Notification {
  date: string;
  alarm: Alarm;
  eventID: string;
  summary?: string | null;
}

export interface SyncLog {
  events: string;
}

export interface CalDavQueryResult {
  type: CALDAV_OBJ_TYPE;
  data: any[];
}
