import { v4 } from 'uuid';
import { TCalendarNotificationType } from '../../../types/types';
import {
  parseDateToString,
  parseToDate,
} from '../../../components/calendarView/calendar-common';
import Crypto from '../../../bloben-package/utils/encryption';
import OpenPgp from '../../../bloben-package/utils/OpenPgp';
import { DateTime } from 'luxon';
import LuxonHelper from '../../../bloben-package/utils/LuxonHelper';

export type CalendarsStateType = 'calendars';
export const CALENDARS_STATE: string = 'calendars';

/**
 * Private part for encryption
 */
export type CalendarPropsForEncryption = {
  name: string;
};

/**
 * Body to save in server
 */
export type CalendarBodyToSend = {
  id: string;
  data: string;
  timezone: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  isShared: boolean;
  isPublic: boolean;
  reminders: string | null;
};

type iCalDataType = {
  address: string;
  lastSyncAt: string;
};

export type CalendarStateType = {
  id: string;
  name: string;
  color: string;
  reminders: TCalendarNotificationType[];
  iCalData: iCalDataType | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isPublic: boolean;
  isShared: boolean;
  isLocal: boolean;
  isSynced: boolean;
};

export default class CalendarStateEntity {
  id: string;
  name: string;
  color: string;
  timezone: string;
  reminders: TCalendarNotificationType[];
  iCalData: iCalDataType | null = null;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean = false;
  isShared: boolean = false;
  isLocal: boolean;
  isSynced: boolean;

  constructor(data: any, iCalData?: any) {
    const isNotNew: boolean = data.updatedAt;

    this.id = data.id ? data.id : v4();
    this.color = data.color;
    this.reminders = data.reminders;
    this.isShared = data.isShared;
    this.isPublic = data.isPublic;
    this.timezone = data.timezone;
    this.createdAt = data.createdAt ? data.createdAt : DateTime.local().toString();
    this.updatedAt = data.updatedAt
      ? data.updatedAt
      : this.createdAt;
    this.isLocal = !isNotNew;
    this.isSynced = isNotNew;

    if (iCalData) {
      this.name = data.name;
      this.iCalData = iCalData;
    } else {
      this.name = data.name;
    }
  }

  public getStoreObj = () =>
    ({
      id: this.id,
      name: this.name,
      timezone: this.timezone,
      color: this.color,
      reminders: this.reminders,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isShared: this.isShared,
      isPublic: this.isPublic,
      isLocal: false,
      isSynced: true,
    });

  /**
   * Get only private parts of event for encryption
   */
  public getCalendarPropsForEncryption = (): CalendarPropsForEncryption => ({
    name: this.name,
  });

  /**
   * Encrypt calendar with password
   * @param password
   */
  public encryptCalendar = async (password: string): Promise<string> =>
    Crypto.encrypt(this.getCalendarPropsForEncryption(), password);

  /**
   *
   * @param cryptoPassword
   */
  public formatBodyToSend = async (
    cryptoPassword: string
  ): Promise<CalendarBodyToSend> => ({
    id: this.id,
    color: this.color,
    data: await this.encryptCalendar(cryptoPassword),
    timezone: this.timezone,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isShared: this.isShared,
    isPublic: this.isPublic,
    reminders:
      this.reminders && this.reminders.length > 0
        ? JSON.stringify(this.reminders)
        : null,
  });
  public formatBodyToSendPgp = async (
    publicKey: string
  ): Promise<CalendarBodyToSend> => ({
    id: this.id,
    color: this.color,
    data: await OpenPgp.encrypt(
      publicKey,
      this.getCalendarPropsForEncryption()
    ),
    timezone: this.timezone,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isShared: this.isShared,
    isPublic: this.isPublic,
    reminders:
      this.reminders && this.reminders.length > 0
        ? JSON.stringify(this.reminders)
        : null,
  });
  public static flagAsSynced = (
    calendar: CalendarStateEntity
  ): CalendarStateEntity => {
    calendar.isSynced = true;
    calendar.isLocal = false;

    return calendar;
  };
}
