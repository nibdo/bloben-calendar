import { DateTime } from 'luxon';
import { User, PgpKeys, Contact, Calendar } from 'bloben-utils';
import { UserProfile } from 'bloben-react/types/common.types';
import { INotification } from 'bloben-utils/models/Notification';

export interface localSettingType {
  key: string;
  value: string;
}

export interface dummyDataType {
  dummy: string;
}

// Data types
export interface calendarColorType {
  name: string;
  light: string;
  dark: string;
}

export interface calendarType {
  name: string;
  notifications: any;
  checked: boolean;
}

export type CalendarView = 'WEEK' | 'MONTH' | 'DAY' | '3DAYS' | 'AGENDA';

export type CalendarDays = [DateTime[], DateTime[], DateTime[]];

export type TCalendarTimeUnit = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';

export interface TCalendarPushAlarm {
  id: string;
  alarmType: 'push';
  amount: number;
  timeUnit: TCalendarTimeUnit;
  payload: null;
}
export interface TCalendarEmailAlarm {
  id: string;
  alarmType: 'email';
  amount: number;
  timeUnit: TCalendarTimeUnit;
  payload: string;
}

export interface GetEventWebsocketByIdDTO {
  id: string;
  rangeFrom: string;
  rangeTo: string;
}

export type TCalendarAlarmType = TCalendarPushAlarm | TCalendarEmailAlarm;

export interface ICalendarSettings {
  defaultCalendar: any;
  defaultTimezone: string;
  defaultAlarmType: string;
  autoUpdateTimezone: boolean;
}
export interface ISyncLog {
  calendars: string;
  events: string;
  eventsAll: string;
  contacts: string;
  notifications: string;
}

export interface ReduxState {
  user: User;
  userProfile: UserProfile;
  syncLog: ISyncLog;
  contacts: Contact[];
  calendarSettings: ICalendarSettings;
  timezones: string[];
  defaultTimezone: string;
  pgpKeys: PgpKeys;
  defaultCalendar: any;
  password: string;
  rangeFrom: string;
  rangeTo: string;
  calendarDays: CalendarDays;
  events: any;
  eventsToImport: any;
  calendarView: CalendarView;
  selectedEvent: any;
  calendars: Calendar[];
  isLoading: boolean;
  isAppStarting: boolean;
  notifications: INotification[];
  selectedDate: DateTime;
  eventsAreFetching: boolean;
  calendarBodyWidth: number;
  calendarBodyHeight: number;
  calendarDaysCurrentIndex: number;
  allEvents: any;
  isFirstLogin: boolean;
}

export interface InitCalendarDaysAction {
  calendarView: CalendarView;
  date: DateTime;
}
