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

export enum EVENT_TYPE {
  CALDAV = 'CALDAV',
  WEBCAL = 'WEBCAL',
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

export enum ALERT_BOX_TYPE {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
}

export enum BLOBEN_EVENT_KEY {
  INVITE_FROM = 'xBlobenInviteTo',
  INVITE_TO = 'xBlobenInviteFrom',
}
