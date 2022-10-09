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

export enum TASK_STATUS {
  COMPLETED = 'COMPLETED',
  NEEDS_ACTION = 'NEEDS-ACTION',
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
