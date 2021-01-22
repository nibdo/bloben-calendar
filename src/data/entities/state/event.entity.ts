/* tslint:disable:no-magic-numbers */
import { v4 } from 'uuid';
import { formatISO, isSameDay, parseISO } from 'date-fns';
import Crypto from '../../../bloben-package/utils/encryption';
import { TCalendarNotificationType } from '../../../types/types';
import {
  formatTimestampToDate,
  parseDateToString,
  parseToDate,
} from '../../../components/calendarView/calendar-common';
import OpenPgp, { PgpKeys } from '../../../bloben-package/utils/OpenPgp';
import { DatetimeParser } from '../../../bloben-package/utils/datetimeParser';
import { DateTime } from 'luxon';
import LuxonHelper from '../../../bloben-package/utils/LuxonHelper';

export type EventsStateType = 'events';
export const EVENTS_STATE: string = 'events';
export const MAX_REPEAT_UNTIL: Date = new Date(2060, 12, 30);
export const INFINITE_COUNT: number = 50000;
export const RRULE_DATE_PROPS: string[] = ['dtstart', 'dtend', 'until'];

export type EventStateType = {
  id: string;
  calendarId: string;
  text: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  timezoneStart: string;
  timezoneEnd: string;
  isRepeated: boolean;
  location: string;
  notes: string;
  rRule: string | null;
  reminders: TCalendarNotificationType[] | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  color: string | null;
  calendarTimezone: string;
  // ICS specific
  externalId: string | null;
  // App state
  isLocal: boolean;
  isSynced: boolean;
};
export type rRuleOriginal = {
  freq: string;
  wkst: string;
  count: number | null;
  until: string | null;
  interval: number;
};
export type rRule = {
  freq: string;
  wkst: string;
  count: number | null;
  until: string | null;
  interval: number;
  dtstart: string;
  dtend: string;
};

/**
 * Private part for encryption
 */
export type EventPropsForEncryption = {
  text: string;
  location: string;
  notes: string;
};

/**
 * Body to save in server
 */
export type EventBodyToSend = {
  id: string;
  calendarId: string;
  data: string;
  startAt: string;
  endAt: string;
  timezoneStart: string;
  timezoneEnd: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
  isRepeated: boolean;
  rRule: rRule | null;
  reminders: TCalendarNotificationType[] | string;
  externalId: string | null;
};

export default class EventStateEntity {
  id: string;
  calendarId: string;
  text: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  isMultiDay: boolean;
  timezoneStart: string;
  timezoneEnd: string;
  isRepeated: boolean;
  location: string;
  color: string | null;
  calendarTimezone: string;
  notes: string;
  rRule: rRule | null;
  reminders: TCalendarNotificationType[] | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null = null;
  externalId: string | null;
  isLocal: boolean;
  isSynced: boolean;

  constructor(data: any, rRuleData?: rRuleOriginal) {
    const isNotNew: boolean = data.id;
    const isIcs: boolean = data.isIcs;

    this.id = isNotNew ? data.id : v4();
    this.calendarId = data.calendarId;
    this.text = data.text;
    this.startAt = DatetimeParser(data.startAt, data.timezoneStart);
    this.timezoneStart = data.timezoneStart;
    this.endAt = DatetimeParser(data.endAt, data.timezoneEnd);
    this.timezoneEnd = data.timezoneEnd;
    this.allDay = data.allDay;
    this.isMultiDay = !LuxonHelper.isSameDay(data.startAt, data.endAt);
    this.isRepeated = isNotNew ? data.isRepeated : data.isRepeated;
    this.location = data.location;
    this.notes = data.notes;
    this.color = data.color ? data.color : null;
    this.calendarTimezone = data.calendarTimezone;
    this.rRule = data.rRule
      ? this.parseRRuleFromString(data.rRule)
      : this.parseRRule(rRuleData ? rRuleData : null);
    this.reminders =
      typeof data.reminders === 'string'
        ? JSON.parse(data.reminders)
        : data.reminders;
    this.createdAt = data.createdAt ? data.createdAt : DateTime.local().toString();
    this.updatedAt = isNotNew ? DateTime.local().toString() : this.createdAt;
    this.deletedAt = data.deletedAt ? data.deletedAt : null;
    this.isLocal = !isNotNew;
    this.isSynced = isNotNew;
    this.externalId = isIcs ? data.externalId : null;
  }

  /**
   * Get only private parts of event for encryption
   */
  public getReduxStateObj = (): any => ({
    id: this.id,
    calendarId: this.calendarId,
    text: this.text,
    startAt: this.startAt,
    endAt: this.endAt,
    timezoneStart: this.timezoneStart,
    timezoneEnd: this.timezoneEnd,
    allDay: this.allDay,
    isMultiDay: this.isMultiDay,
    isRepeated: this.isRepeated,
    rRule: this.rRule,
    color: this.color,
    calendarTimezone: this.calendarTimezone,
    location: this.location,
    notes: this.notes,
    reminders: this.reminders,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    deletedAt: this.deletedAt,
    isLocal: this.isLocal,
    isSynced: this.isSynced,
  });

  public static flagAsSynced = (event: EventStateEntity): EventStateEntity => {
    event.isSynced = true;
    event.isLocal = false;

    return event;
  };

  public delete = (): void => {
    this.deletedAt = DateTime.local().toString();
  };

  /**
   * Get only private parts of event for encryption
   */
  public getEventPropsForEncryption = (): EventPropsForEncryption => ({
    text: this.text,
    location: this.location,
    notes: this.notes,
  });

  private parseRRule = (data: rRuleOriginal | null): rRule | null => {
    if (
      !data ||
      (data && data.freq === 'NONE') ||
      (data && data.freq === 'none')
    ) {
      return null;
    }

    const { freq, wkst, count, until, interval } = data;

    // Need to format Date to Zulu ISO string for PG parser in database

    return {
      freq: freq.toUpperCase(),
      wkst,
      count: count ? count : null,
      until: until ? until.toString() : null,
      interval,
      dtstart: this.startAt.toString(),
      dtend: this.endAt.toString(),
    };
  };

  /**
   * Set rRule in string format
   * @param data
   */
  public setRRule = (data: rRuleOriginal): string | null => {
    if (
      !data ||
      (data && data.freq === 'NONE') ||
      (data && data.freq === 'none')
    ) {
      return null;
    }

    const rRuleParsed: rRule | null = this.parseRRule(data);

    if (!rRuleParsed) {
      return null;
    }

    const { freq, wkst, count, until, interval, dtstart, dtend } = rRuleParsed;

    return `DTSTART:${dtstart}
    RRULE:FREQ=${freq};${interval ? `INTERVAL=${interval};` : ''}${
      !count && !until ? `UNTIL=${until}` : ''
    }${count ? `COUNT=${count}` : ''}${until ? `UNTIL=${until}` : ''}`;
  };

  public parseRRuleFromString = (rRuleString: string): rRule => {
    const rRuleObj: any = {
      freq: '',
      wkst: '',
      count: null,
      until: null,
      interval: null,
      dtstart: '',
      dtend: '',
    };

    const delimiter: string = ';';
    const hasInterval: boolean = rRuleString.indexOf('INTERVAL') !== -1;
    const hasCount: boolean = rRuleString.indexOf('COUNT') !== -1;
    const hasUntil: boolean = rRuleString.indexOf('UNTIL') !== -1;

    const freq: string = rRuleString.slice(
      rRuleString.indexOf('FREQ=') + 'FREQ='.length,
      rRuleString.indexOf(delimiter)
    );
    rRuleObj.freq = freq;

    // Get rest of string
    let rawString: string = rRuleString.slice(
      rRuleString.indexOf(freq) + freq.length + 1
    );

    if (hasInterval) {
      const interval: string = rawString.slice(
        rawString.indexOf('INTERVAL=') + 'INTERVAL='.length,
        rawString.indexOf(delimiter)
      );
      rRuleObj.interval = Number(interval);
      rawString = rawString.slice(
        rawString.indexOf(interval) + interval.length + 1
      );
    }

    if (hasCount) {
      const count: string = rawString.slice(
        rawString.indexOf('COUNT=') + 'COUNT='.length
      );
      rRuleObj.count = Number(count);
    }

    if (hasUntil) {
      rRuleObj.until = rawString.slice(
        rawString.indexOf('UNTIL=') + 'UNTIL='.length
      );
    }

    return rRuleObj;
  };

  public getDateKey = (): string => formatTimestampToDate(this.startAt);

  /**
   * Encrypt event with password
   * @param password
   */
  public encryptEvent = async (password: string): Promise<string> =>
    Crypto.encrypt(this.getEventPropsForEncryption(), password);

  public formatBodyToSend = async (
    password: string
  ): Promise<EventBodyToSend> => ({
    id: this.id,
    calendarId: this.calendarId,
    data: await this.encryptEvent(password),
    startAt: this.startAt,
    endAt: this.endAt,
    timezoneStart: this.timezoneStart,
    timezoneEnd: this.timezoneEnd,
    allDay: this.allDay,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isRepeated: this.isRepeated,
    rRule: this.rRule,
    reminders: this.reminders,
    externalId: this.externalId,
  });

  public formatBodyToSendOpenPgp = async (
    pgpKeys: PgpKeys
  ): Promise<EventBodyToSend> => {
    const data: any = await OpenPgp.encrypt(
      pgpKeys.publicKey,
      this.getEventPropsForEncryption()
    );

    return {
      id: this.id,
      calendarId: this.calendarId,
      data,
      startAt: this.startAt,
      endAt: this.endAt,
      timezoneStart: this.timezoneStart,
      timezoneEnd: this.timezoneEnd,
      allDay: this.allDay,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isRepeated: this.isRepeated,
      rRule: this.rRule,
      reminders: this.reminders,
      externalId: this.externalId,
    };
  };

  static async enhance(stateItem: any, localItem: any) {
    const stateItemEnhanced: any = { ...stateItem };
    const { id, calendarId, createdAt, updatedAt, deletedAt } = localItem;
    stateItemEnhanced.id = id;
    stateItemEnhanced.calendarId = calendarId;
    stateItemEnhanced.createdAt = createdAt;
    stateItemEnhanced.updatedAt = updatedAt;
    stateItemEnhanced.deletedAt = deletedAt;

    return stateItemEnhanced;
  }

  static sort = (data: any, rule: string) =>
    new Promise((resolve) => {
      let sortedData;
      switch (rule) {
        case 'updatedAt':
          sortedData = data.sort((a: any, b: any) => {
            const aItem: any = parseISO(a.updatedAt);
            const bItem: any = parseISO(b.updatedAt);

            return bItem - aItem;
          });
          break;
        default:
          sortedData = data.sort((a: any, b: any) => {
            const aItem: any = parseISO(a.updatedAt);
            const bItem: any = parseISO(b.updatedAt);

            return bItem - aItem;
          });
      }
      resolve(sortedData);
    });
  static onChange = (event: any, setLocalStateState: any, text: string) => {
    const target = event.target;
    const name = target.name;

    if (!text) {
      setLocalStateState('text', event.target.value);

      return;
    }

    // Get index of title
    const index: number = text.indexOf('\n');

    if (index === -1) {
      setLocalStateState('text', event.target.value);

      return;
    }

    // Handle title change, parse to text
    if (name === 'title') {
      // Replace title in original text
      const newText: string = `${event.target.value}${text.slice(
        index,
        text.length
      )}`;
      setLocalStateState('text', newText);
    } else {
      // Replace text in original text
      const newText: string = `${text.slice(0, index + 1)}${
        event.target.value
      }`;
      setLocalStateState('text', newText);
    }
  };
}
