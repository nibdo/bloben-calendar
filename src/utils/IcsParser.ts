import EventStateEntity from '../bloben-utils/models/event.entity';
import { Calendar } from '../bloben-utils/models/Calendar';

const EVENT_BEGIN_KEY_VALUE = 'BEGIN:VEVENT';
const EVENT_END_KEY_VALUE = 'END:VEVENT';
const CALENDAR_END_KEY_VALUE = 'END:VCALENDAR';

const IcsParser: any = {
  enhanceParsedEvent: (eventArray: any, calendar: Calendar) => {
    const result: any = [];

    // TODO Add reminders
    for (const item of eventArray) {
      const data: any = {
        ...item,
        calendarId: calendar.id,
        color: calendar.color,
        alarms: [],
        isRepeated: false,
      };
      const event: EventStateEntity = new EventStateEntity(data);

      result.push(event);
    }

    return result;
  },

  parseFile: (icsString: string) => {
    const result: any = [];

    const icsEvents: string = IcsParser.extractEvents(icsString);

    const icsEventsArray: string[] = IcsParser.splitStringEvents(icsEvents);

    for (const item of icsEventsArray) {
      const event: any = IcsParser.parseIcsString(item);

      result.push(event);
    }

    return result;
  },

  /**
   * Extract only events from string
   * @param icsFile
   */
  extractEvents: (icsFile: string): string => {
    // First filter only events in ics string

    // Find index of first event
    const firstEventIndex: number = icsFile.indexOf(EVENT_BEGIN_KEY_VALUE);
    const endOfEventsIndex: number = icsFile.indexOf(CALENDAR_END_KEY_VALUE);

    return icsFile.slice(firstEventIndex, endOfEventsIndex);
  },
  /**
   * Split string events to array
   * @param icsEvents
   */
  splitStringEvents: (icsEvents: string) => {
    // Get array of events
    let result: any = icsEvents.split(EVENT_BEGIN_KEY_VALUE).slice(1);

    if (!result) {
      return '';
    }

    // Add missing delimiter to each record
    result = result.map((item: string) => `${EVENT_BEGIN_KEY_VALUE}${item}`);

    return result;
  },

  /**
   * Get key values from each line to build obj
   * @param icsStringEvent
   */
  parseIcsString: (icsStringEvent: string) => {
    const data: any = {};

    data.isIcs = true;
    // Get key value item in array for each line
    const keyValueArray: string[] = icsStringEvent.split('\n');

    // Iterate over string event and prepare data object from key values
    for (const item of keyValueArray) {
      const keyValueObj: any = IcsParser.splitToKeyValueObj(item);
      const { key, value } = keyValueObj;

      // Format key for internal use
      const keyTransformed: string = IcsParser.transformKey(key);
      if (keyTransformed !== 'unknown') {
        // Format date values
        data[keyTransformed] = IcsParser.transformValue(keyTransformed, value);
      }
    }

    return data;
  },

  transformKey: (key: string) => {
    switch (key) {
      case 'DTSTART':
        return 'startAt';
      case 'DTEND':
        return 'endAt';
      case 'SUMMARY':
        return 'text';
      case 'LOCATION':
        return 'location';
      case 'DESCRIPTION':
        return 'notes';
      case 'CREATED':
        return 'createdAt';
      case 'LAST-MODIFIED':
        return 'updatedAt';
      case 'UID':
        return 'externalId';
      default:
        return 'unknown';
    }
  },
  transformValue: (key: string, value: string): string => {
    if (
      key === 'startAt' ||
      key === 'endAt' ||
      key === 'createdAt' ||
      key === 'updatedAt'
    ) {
      return IcsParser.parseIcsDate(value);
    }

    return value;
  },
  splitToKeyValueObj: (item: string) => {
    const isDateKey: boolean = IcsParser.checkIfIsDateKey(item);

    let delimiterIndex: number;

    // Check both for ":" and ";" delimiter
    if (isDateKey) {
      delimiterIndex =
        item.indexOf('TZID') !== -1 ? item.indexOf(';') : item.indexOf(':');
    } else {
      delimiterIndex = item.indexOf(':');
    }

    const key: string = item.slice(0, delimiterIndex);
    const value: string = item.slice(delimiterIndex + 1);

    return {
      key,
      value,
    };
  },

  parseIcsDate: (icsDate: string): string => {
    // TODO add timezone, handle different date formats with timezones

    const isTzidDate: boolean = IcsParser.checkIfHasTzidTimezone(icsDate);

    const baseDate: string = isTzidDate ? icsDate.split(':')[1] : icsDate;

    const year: string = baseDate.slice(0, 4);
    const month: string = baseDate.slice(4, 6);
    const day: string = baseDate.slice(6, 8);
    const hour: string = baseDate.slice(9, 11);
    const minute: string = baseDate.slice(11, 13);
    const offset: string = baseDate.slice(13, baseDate.length);

    return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
  },
  checkIfIsDateKey: (keyValueString: string): boolean =>
    keyValueString.indexOf('DTSTART') !== -1 ||
    keyValueString.indexOf('DTEND') !== -1 ||
    keyValueString.indexOf('CREATED') !== -1 ||
    keyValueString.indexOf('LAST-MODIFIED') !== -1,
  checkIfHasTzidTimezone: (value: string): boolean =>
    value.indexOf('TZID') !== -1,
};

export default IcsParser;
