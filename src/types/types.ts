// TODO: Add new type Date as JSON string Date

export type encryptedType = {
  id: string;
  type: string;
  data: string;
  createdAt: string;
  updatedAt: string;
  needSync: boolean;
  isLocal: boolean;
  parent: string;
  isShared: boolean;
  deleted: boolean;
};

export type localSettingType = {
  key: string;
  value: string;
};

export type cryptoDatabaseType = {
  key: string;
  cryptoPassword: string;
  pinCode: boolean;
  pinAttempts: number;
};

export type dummyDataType = {
  dummy: string;
};

// Data types
export type calendarColorType = {
  name: string;
  light: string;
  dark: string;
};

export type calendarType = {
  name: string;
  notifications: any;
  checked: boolean;
};

export type TCalendarTimeUnit = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';

export type TCalendarNotificationType =
  | TCalendarPushNotification
  | TCalendarEmailNotification;

export type TCalendarPushNotification = {
  id: string;
  reminderType: 'push';
  amount: number;
  timeUnit: TCalendarTimeUnit;
};
export type TCalendarEmailNotification = {
  id: string;
  reminderType: 'email';
  amount: number;
  timeUnit: TCalendarTimeUnit;
};

export type GetEventWebsocketByIdDTO = {
  id: string;
  rangeFrom: string;
  rangeTo: string;
};

type TCryptoPasswordKey = 'cryptoPassword';

export type TCryptoPasswordObject = {
  key: TCryptoPasswordKey;
  cryptoPassword: string;
  pinAttempts: number;
  pinCode: number | null;
}

export interface ICalendarSettings {
  defaultCalendar: any;
  defaultTimezone: string;
  autoUpdateTimezone: boolean;
  updatedAt: string;
}
