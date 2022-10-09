import { CalendarAlarms } from '../interface';

export interface WebcalCalendarData {
  name: string;
  url: string;
}

export interface CreateWebcalCalendarRequest {
  url: string;
  name: string;
  color: string;
  syncFrequency: number;
  alarms: CalendarAlarms[];
  userMailto: string;
}

export interface GetWebcalCalendarsResponse {
  id: string;
  name: string;
  color: string;
  syncFrequency: number;
  url: string;
  isHidden: boolean;
  alarms: CalendarAlarms[];
  userMailto: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatchWebcalCalendarRequest {
  isHidden?: boolean;
}
