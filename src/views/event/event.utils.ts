import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
  isBefore,
  parseISO,
} from 'date-fns';
import { DateTime } from 'luxon';

/**
 * Get time from clicked on timetable
 *
 * @param newEventTime
 */
export const calculateNewEventTime = (newEventTime: any): DateTime => {
  // Get date of new event
  const selectedDate: any = newEventTime.day;

  return selectedDate.set({ hour: newEventTime.hour, minute: 0, second: 0})
};

/**
 * Set default reminder
 *
 * @param defaultReminderProps
 * @param setForm
 */
export const setDefaultReminder = (defaultReminderProps: any, setForm: any) => {
  if (defaultReminderProps === 'none' || defaultReminderProps === undefined) {
    setForm('reminder', false);
    setForm('reminderValue', { label: '5 minutes before', value: '5' });
  } else {
    setForm('reminder', true);
    if (defaultReminderProps === '0') {
      setForm('reminderValue', { label: 'On start', value: '0' });
    } else if (defaultReminderProps === '5') {
      setForm('reminderValue', { label: '5 minutes before', value: '5' });
    } else if (defaultReminderProps === '15') {
      setForm('reminderValue', { label: '15 minutes before', value: '15' });
    } else if (defaultReminderProps === '60') {
      setForm('reminderValue', { label: 'Hour before', value: '60' });
    } else if (defaultReminderProps === '360') {
      setForm('reminderValue', { label: '6 hours before', value: '360' });
    } else if (defaultReminderProps === '1440') {
      setForm('reminderValue', { label: 'Day before', value: '1440' });
    } else if (defaultReminderProps === '10080') {
      setForm('reminderValue', { label: 'Week before', value: '10080' });
    }
  }
};

// REMOVE?
const validateDate = (
  changedDate: any,
  dateFrom: any,
  dateTill: any,
  setForm: any
) => {
  let dateFromParsed: any = parseISO(dateFrom);
  let dateTillParsed: any = parseISO(dateTill);
  if (changedDate === 'dateFrom') {
    if (isBefore(dateTillParsed, dateFromParsed)) {
      setForm(
        'dateTill',
        new Date(
          getYear(dateFromParsed),
          getMonth(dateFromParsed),
          getDate(dateFromParsed),
          getHours(dateTillParsed),
          getMinutes(dateTillParsed)
        )
      );
    }
  } else if (changedDate === 'dateTill') {
    if (isBefore(dateTillParsed, dateFromParsed)) {
      setForm(
        'dateFrom',
        new Date(
          getYear(dateTillParsed),
          getMonth(dateTillParsed),
          getDate(dateTillParsed),
          getHours(dateFromParsed),
          getMinutes(dateFromParsed)
        )
      );
    }
  }
};
