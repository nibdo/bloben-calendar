import { DateTime } from 'luxon';

import {
  InitialFormState,
  InitialRRulState,
  InitialState,
} from '../../../types/editEvent.types';

export const initialFormState: InitialFormState = {
  prevItem: {},
  id: '',
  summary: '',
  location: '',
  description: '',
  calendarId: null,
  timezone: null,
  allDay: false,
  startAt: DateTime.local().toString(),
  timezoneStart: null,
  endAt: DateTime.local().plus({ hours: 1 }).toString(),
  timezoneEnd: null,
  isRepeated: false,
  alarms: [],
  attendees: [],
  createdAt: null,
  updatedAt: null,
  color: '',
  organizer: '',
};

export const initialState: InitialState = {
  modalIsOpen: false,
  hasChanged: false,
  isStartDateValid: true,
  isEndDateValid: true,
};

export const initialRRulState: InitialRRulState = {
  freq: 'none',
  wkst: '',
  count: null,
  interval: '',
  until: null,
  dtstart: '',
  dtend: '',
};
