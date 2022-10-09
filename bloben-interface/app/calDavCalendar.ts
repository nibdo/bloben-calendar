import { CalendarAlarms } from '../interface';

export interface GetCalDavCalendar {
  id: string;
  displayName: string;
  calDavAccountID: string;
  color: string;
  components: string[];
  timezone: string;
  url: string;
  isHidden?: boolean;
  alarms: CalendarAlarms[];
}

export interface CreateCalDavCalendarRequest {
  accountID: string;
  name: string;
  color: string;
  components: string[];
}

export interface UpdateCalDavCalendarRequest {
  name: string;
  color: string;
  alarms: CalendarAlarms[];
}

export interface PatchCalDavCalendarRequest {
  isHidden: boolean;
}
