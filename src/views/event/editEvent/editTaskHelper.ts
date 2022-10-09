import { CalDavCalendar } from '../../../types/interface';
import {
  CalendarSettingsResponse,
  GetProfileResponse,
} from '../../../bloben-interface';
import { DateTime } from 'luxon';
import { DatetimeParser, parseToDateTime } from '../../../utils/datetimeParser';
import { EVENT_TYPE, REPEATED_EVENT_CHANGE_TYPE } from '../../../enums';
import {
  InitialForm,
  didCalendarChange,
  findItemCalendar,
  handleAllDayStatus,
  setExternalEventID,
} from './editEventHelper';
import { OnNewEventClickData } from 'kalend';

import { StoreContext } from '../../../context/store';
import { TOAST_STATUS } from '../../../types/enums';
import {
  createToast,
  getLocalTimezone,
  parseCalendarTimezone,
} from '../../../utils/common';
import { debug } from '../../../utils/debug';
import { formatIcalDate } from '../../../utils/ICalHelper';
import { map } from 'lodash';
import { parseIcalAlarmToAppAlarm } from '../../../utils/caldavAlarmHelper';
import { v4 } from 'uuid';
import CalDavEventsApi from '../../../api/CalDavEventsApi';
import ICalHelperTasks from '../../../utils/ICalHelperTasks';
import LuxonHelper from '../../../utils/LuxonHelper';
import TasksApi from '../../../api/TasksApi';

export const createCalDavTask = async (
  formInitial: InitialForm,
  isNewEvent: boolean,
  timezone: string,
  calendar?: CalDavCalendar,
  handleClose?: any,
  originalEvent?: any,
  sendInvite?: boolean,
  inviteMessage?: string,
  isDuplicatingEvent?: boolean
) => {
  const form = handleAllDayStatus(formInitial);
  const eventCalendar: CalDavCalendar =
    calendar || findItemCalendar(originalEvent);

  const calendarChanged = didCalendarChange(
    isNewEvent,
    isDuplicatingEvent,
    originalEvent,
    eventCalendar
  );

  // use issued id or create for new event
  const newEventExternalID: string = setExternalEventID(
    originalEvent,
    isDuplicatingEvent
  );

  const iCalString: string = new ICalHelperTasks(
    {
      ...form,
      externalID: newEventExternalID,
    },
    timezone
  ).parseTo();

  debug(iCalString);

  let response;

  if (isNewEvent || isDuplicatingEvent) {
    response = await TasksApi.create({
      calendarID: eventCalendar.id,
      iCalString,
      externalID: newEventExternalID,
      sendInvite,
      inviteMessage,
    });
  } else {
    if (calendarChanged) {
      response = await TasksApi.update({
        calendarID: eventCalendar.id,
        iCalString,
        externalID: newEventExternalID,
        id: originalEvent.id,
        url: originalEvent.url,
        etag: originalEvent.etag,
        prevEvent: {
          externalID: originalEvent.externalID,
          id: originalEvent.id,
          url: originalEvent.url,
          etag: originalEvent.etag,
        },
        sendInvite,
        inviteMessage,
      });
    } else {
      response = await TasksApi.update({
        calendarID: eventCalendar.id,
        iCalString,
        id: originalEvent.id,
        externalID: originalEvent.externalID,
        url: originalEvent.url,
        etag: originalEvent.etag,
        prevEvent: null,
        sendInvite,
        inviteMessage,
      });
    }
  }

  // Close modal
  if (handleClose) {
    handleClose();
  }

  return response;
};

/**
 *
 * @param form
 * @param type
 * @param originalEvent
 */
export const formatRecurrenceID = (
  form: InitialForm,
  type: REPEATED_EVENT_CHANGE_TYPE,
  originalEvent?: any
) => {
  if (type === REPEATED_EVENT_CHANGE_TYPE.ALL) {
    return undefined;
  }

  if (form.recurrenceID) {
    return form.recurrenceID;
  } else {
    return {
      value: formatIcalDate(originalEvent.startAt, form.timezoneStartAt),
      timezone: form.timezoneStartAt,
    };
  }
};

/**
 *
 * @param form
 * @param type
 * @param calendar
 * @param handleClose
 * @param originalEvent
 * @param sendInvite
 * @param inviteMessage
 */
export const updateRepeatedEvent = async (
  form: any,
  type: REPEATED_EVENT_CHANGE_TYPE,
  calendar?: CalDavCalendar,
  handleClose?: any,
  originalEvent?: any,
  sendInvite?: boolean,
  inviteMessage?: string
) => {
  const eventCalendar: CalDavCalendar =
    calendar || findItemCalendar(originalEvent);

  const calendarChanged: boolean =
    originalEvent?.calendarID !== eventCalendar.id;

  debug('original', originalEvent);

  const response = await CalDavEventsApi.updateRepeatedEvent({
    calendarID: eventCalendar.id,
    event: {
      ...form,
      recurrenceID: formatRecurrenceID(form, type, originalEvent),
      rRule: type === REPEATED_EVENT_CHANGE_TYPE.ALL ? form.rRule : null,
      externalID: originalEvent.externalID,
      type: EVENT_TYPE.CALDAV,
      calendarID: originalEvent.calendarID,
    },
    id: originalEvent.id,
    externalID: originalEvent.externalID,
    url: originalEvent.url,
    etag: originalEvent.etag,
    type,
    prevEvent: calendarChanged
      ? {
          externalID: originalEvent.externalID,
          id: originalEvent.id,
          url: originalEvent.url,
          etag: originalEvent.etag,
        }
      : null,
    sendInvite,
    inviteMessage,
  });

  // Close modal
  if (handleClose) {
    handleClose();
  }

  return response;
};

/**
 * Format date in utc to actual date for all day event with floating timezone
 * @param date
 * @param timezone
 */
export const formatAllDayHeaderEventDate = (date: string, timezone: string) => {
  const localDate = parseToDateTime(date, timezone);

  return DateTime.now()
    .toUTC()
    .set({
      year: localDate.year,
      month: localDate.month,
      day: localDate.day,
      minute: 1,
      hour: 0,
    })
    .toString();
};

export interface NewEventTime extends OnNewEventClickData {
  isHeaderClick?: boolean;
}
/**
 * Set date time for new event
 */
export const initNewEventOnMount = (
  settings: CalendarSettingsResponse,
  calDavCalendars: CalDavCalendar[],
  setForm: any,
  setCalendar: any,
  store: StoreContext,
  user: GetProfileResponse,
  newEventTime: NewEventTime
): void => {
  const defaultCalendarID = settings.defaultCalendarID;
  const defaultCalendar = defaultCalendarID
    ? calDavCalendars.find((item) => item.id === defaultCalendarID)
    : null;

  setForm(
    'calendarUrl',
    defaultCalendar ? defaultCalendar.url : calDavCalendars[0].url
  );
  // setDefaultReminder(defaultReminder, setForm);

  const thisCalendar: CalDavCalendar | undefined = defaultCalendar
    ? defaultCalendar
    : calDavCalendars[0];

  if (!thisCalendar) {
    return;
  }
  const timezone: string = settings.timezone || getLocalTimezone();

  setForm('timezoneStartAt', timezone);
  setForm('timezoneEndAt', timezone);
  setCalendar(thisCalendar);

  if (thisCalendar.alarms) {
    setForm(
      'alarms',
      map(thisCalendar.alarms, (alarm) => ({
        id: v4(),
        isBefore: true,
        ...alarm,
      }))
    );
  }

  if (
    (store?.emailConfig?.hasSystemConfig ||
      store?.emailConfig?.hasCustomConfig) &&
    store.emailConfig?.mailto
  ) {
    setForm('organizer', {
      CN: user.username,
      mailto: store.emailConfig?.mailto,
    });
  }

  if (!newEventTime) {
    return;
  }

  if (newEventTime.view === 'month' || newEventTime.isHeaderClick) {
    setForm('allDay', true);
    setForm('timezoneStartAt', 'floating');
    setForm('timezoneEndAt', 'floating');

    setForm(
      'startAt',
      formatAllDayHeaderEventDate(newEventTime.startAt as string, timezone)
    );
    setForm(
      'endAt',
      formatAllDayHeaderEventDate(newEventTime.endAt as string, timezone)
    );
  } else {
    setForm('startAt', newEventTime.startAt);
    setForm('endAt', newEventTime.endAt);
  }
};

/**
 *
 * @param prop
 */
export const isEventKnownProp = (prop: string) => {
  const knownProps = [
    'startAt',
    'endAt',
    'summary',
    'timezoneStartAt',
    'timezoneEndAt',
    'location',
    'allDay',
    'description',
    'rRule',
    'props',
    'color',
    'alarms',
    'valarms',
    'attendees',
    'exdates',
    'recurrenceID',
    'organizer',
  ];

  return knownProps.includes(prop);
};

export const checkIfHasRepeatPreAction = (event: any) => {
  return (
    event?.rRule?.length > 1 ||
    event?.recurrenceID ||
    event?.recurrenceID?.value
  );
};

/**
 * Load event data to form
 * @param event
 * @param setForm
 * @param setWasSimpleEvent
 */
export const loadEvent = (event: any, setForm: any, setWasSimpleEvent: any) => {
  // Find event
  const eventItem: any = event;

  if (eventItem) {
    // Set state
    // Set previous event state to check for occurrences
    setForm('prevItem', eventItem);

    const wasRepeated = checkIfHasRepeatPreAction(eventItem);
    if (wasRepeated) {
      setWasSimpleEvent(false);
    } else {
      setWasSimpleEvent(true);
    }

    // Set event data
    for (const [key, value] of Object.entries(eventItem)) {
      if (isEventKnownProp(key)) {
        // @ts-ignore
        if (key === 'valarms' && value.length) {
          // @ts-ignore
          setForm('alarms', map(value, parseIcalAlarmToAppAlarm));
        } else if (value) {
          if (typeof value === 'string') {
            setForm(key, value.replaceAll('\\n', '\n'));
          } else {
            setForm(key, value);
          }
        }
      }
    }
  }
};

/**
 * Find calendar by calendarID
 * Set color event and default alarms for this calendar if event has none
 * @param calendarID
 * @param event
 * @param calDavCalendars
 * @param settings
 * @param isNewEvent
 * @param setForm
 * @param setCalendar
 */
export const loadCalendar = (
  calendarID: string | undefined,
  event: any,
  calDavCalendars: CalDavCalendar[],
  settings: CalendarSettingsResponse,
  isNewEvent: boolean,
  setForm: any,
  setCalendar: any
) => {
  let thisCalendar: CalDavCalendar | undefined;

  if (event || calendarID) {
    thisCalendar = calDavCalendars.find(
      (item) => item.id === (calendarID ? calendarID : event?.calendarID)
    );
  } else {
    const defaultCalendarID = settings.defaultCalendarID;
    thisCalendar = defaultCalendarID
      ? calDavCalendars.find((item) => item.id === defaultCalendarID)
      : undefined;
  }

  if (!thisCalendar) {
    return;
  }

  if (isNewEvent) {
    const timezoneFromCalendar: string = parseCalendarTimezone(
      thisCalendar.timezone,
      settings
    );

    setForm('timezoneStartAt', timezoneFromCalendar);
    setForm('timezoneEndAt', timezoneFromCalendar);
  }

  setCalendar(thisCalendar);
};

/**
 * Validate event interval
 * @param changedDate
 * @param startAtDate
 * @param endAtDate
 * @param allDay
 */
export const validateDate = (
  changedDate: string,
  startAtDate: any,
  endAtDate: any,
  allDay: boolean
): boolean => {
  if (LuxonHelper.isSameDay(endAtDate, startAtDate) && allDay) {
    return true;
  }

  if (LuxonHelper.isBeforeAny(endAtDate, startAtDate)) {
    return false;
  }

  return true;
};

/**
 * Select calendar and set data
 * @param calendarObj
 * @param setForm
 * @param setCalendar
 * @param startAt
 * @param endAt
 * @param settings
 */
export const handleSelectCalendar = (
  calendarObj: any,
  setForm: any,
  setCalendar: any,
  startAt: string,
  endAt: string,
  settings: CalendarSettingsResponse
) => {
  const localTimezone = parseCalendarTimezone(calendarObj.timezone, settings);

  setForm('startAt', DatetimeParser(startAt, localTimezone));
  setForm('endAt', DatetimeParser(endAt, localTimezone));
  setForm('calendarUrl', calendarObj.url);
  setCalendar(calendarObj);
  setForm('alarms', calendarObj?.alarms || []);
  setForm('color', null);
};

/**
 *
 * @param showEmailInviteModal
 * @param openEmailInviteModal
 * @param form
 * @param isNewEvent
 * @param calendar
 * @param handleClose
 * @param event
 * @param isDuplicatingEvent
 * @param setContext
 * @param store
 * @param wasSimpleEvent
 * @param setIsSaving
 * @param handleUpdateRepeatedEvent
 * @param toast
 */
export const handleSaveTask = async (
  showEmailInviteModal: any,
  openEmailInviteModal: any,
  form: InitialForm,
  isNewEvent: boolean,
  calendar: any,
  handleClose: any,
  event: any,
  timezone: string,
  isDuplicatingEvent: boolean | undefined,
  setContext: any,
  store: StoreContext,
  wasSimpleEvent: boolean,
  setIsSaving: any,
  handleUpdateRepeatedEvent: any,
  toast: any
) => {
  try {
    if (showEmailInviteModal) {
      openEmailInviteModal({
        call: async (sendInvite?: boolean, inviteMessage?: string) => {
          await createCalDavTask(
            form,
            isNewEvent,
            timezone,
            calendar,
            handleClose,
            event,
            sendInvite,
            inviteMessage,
            isDuplicatingEvent
          );
          setContext('syncSequence', store.syncSequence + 1);
        },
      });

      return;
    }

    if (
      !isNewEvent &&
      !isDuplicatingEvent &&
      checkIfHasRepeatPreAction(form) &&
      !wasSimpleEvent
    ) {
      setIsSaving(true);
      await handleUpdateRepeatedEvent();

      setContext('syncSequence', store.syncSequence + 1);

      setIsSaving(false);

      toast(createToast('Event updated'));
      return;
    }

    setIsSaving(true);

    await createCalDavTask(
      form,
      isNewEvent,
      timezone,
      calendar,
      handleClose,
      event,
      undefined,
      undefined,
      isDuplicatingEvent
    );

    setContext('syncSequence', store.syncSequence + 1);

    setIsSaving(false);

    toast(
      createToast(
        isNewEvent || isDuplicatingEvent ? 'Event created' : 'Event updated'
      )
    );
  } catch (e: any) {
    if (toast) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }
    setIsSaving(false);
  }
};

export const createTask = async (
  formInitial: InitialForm,
  isNewEvent: boolean,
  timezone: string,
  calendar?: CalDavCalendar,
  handleClose?: any,
  originalEvent?: any,
  sendInvite?: boolean,
  inviteMessage?: string,
  isDuplicatingEvent?: boolean
) => {
  const form = handleAllDayStatus(formInitial);
  const eventCalendar: CalDavCalendar =
    calendar || findItemCalendar(originalEvent);

  const calendarChanged = didCalendarChange(
    isNewEvent,
    isDuplicatingEvent,
    originalEvent,
    eventCalendar
  );

  // use issued id or create for new event
  const newEventExternalID: string = setExternalEventID(
    originalEvent,
    isDuplicatingEvent
  );

  const iCalString: string = new ICalHelperTasks(
    {
      ...form,
      externalID: newEventExternalID,
    },
    timezone
  ).parseTo();

  debug(iCalString);

  let response;

  if (isNewEvent || isDuplicatingEvent) {
    response = await TasksApi.create({
      calendarID: eventCalendar.id,
      iCalString,
      externalID: newEventExternalID,
      sendInvite,
      inviteMessage,
    });
  } else {
    if (calendarChanged) {
      response = await TasksApi.update({
        calendarID: eventCalendar.id,
        iCalString,
        externalID: newEventExternalID,
        id: originalEvent.id,
        url: originalEvent.url,
        etag: originalEvent.etag,
        prevEvent: {
          externalID: originalEvent.externalID,
          id: originalEvent.id,
          url: originalEvent.url,
          etag: originalEvent.etag,
        },
        sendInvite,
        inviteMessage,
      });
    } else {
      response = await TasksApi.update({
        calendarID: eventCalendar.id,
        iCalString,
        id: originalEvent.id,
        externalID: originalEvent.externalID,
        url: originalEvent.url,
        etag: originalEvent.etag,
        prevEvent: null,
        sendInvite,
        inviteMessage,
      });
    }
  }

  // Close modal
  if (handleClose) {
    handleClose();
  }

  return response;
};
