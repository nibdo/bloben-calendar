import { Attendee } from 'bloben-utils';

export interface InitialFormState {
  prevItem: any;
  id: string;
  summary: string;
  location: string;
  description: string;
  calendarId: null | string;
  timezone: null;
  allDay: false;
  startAt: string;
  timezoneStart: null | string;
  endAt: string;
  timezoneEnd: null | string;
  isRepeated: boolean;
  alarms: any;
  attendees: Attendee[];
  createdAt: null | string;
  updatedAt: null | string;
  color: string;
  organizer: string;
}

export interface InitialState {
  modalIsOpen: boolean;
  hasChanged: boolean;
  isStartDateValid: boolean;
  isEndDateValid: boolean;
}

export interface InitialRRulState {
  freq: string;
  wkst: string;
  count: number | null;
  interval: string;
  until: string | null;
  dtstart: string;
  dtend: string;
}
