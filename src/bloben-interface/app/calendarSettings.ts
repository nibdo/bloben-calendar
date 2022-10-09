import { CALENDAR_VIEW } from 'kalend/common/enums';

export interface PatchCalendarSettingsRequest {
  timeFormat?: number;
  startOfWeek?: string;
  defaultView?: CALENDAR_VIEW;
  hourHeight?: number;
  defaultCalendarID?: string;
  timezone?: string;
  showWeekNumbers?: boolean;
  defaultAddressBookID?: string;
  saveContactsAuto?: boolean;
  showTasks?: boolean;
}

export interface CalendarSettingsResponse {
  timeFormat: number;
  startOfWeek: string;
  defaultView: CALENDAR_VIEW;
  hourHeight: number;
  defaultCalendarID: string | null;
  timezone: string;
  showWeekNumbers: boolean;
  defaultAddressBookID: string | null;
  saveContactsAuto: boolean;
  showTasks: boolean;
}
