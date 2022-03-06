import { DateTime } from 'luxon';
import { useSelector } from 'react-redux';
import React, { useContext, useEffect, useReducer, useState } from 'react';

import {
  addAlarm,
  createToast,
  getLocalTimezone,
  removeAlarm,
} from 'utils/common';

import { stateReducer } from 'utils/reducer/baseReducer';
import EventDetail from '../eventDetail/EventDetail';

import {
  CalDavCalendar,
  CalDavEvent,
  ReduxState,
} from '../../../types/interface';
import { Context } from 'context/store';
import { DatetimeParser } from 'utils/datetimeParser';
import { Flex, Spacer, useToast } from '@chakra-ui/react';
import { TOAST_STATUS } from '../../../types/enums';
import { calculateNewEventTime } from '../event.utils';
import { initialFormState, initialState } from './EditEvent.utils';
import { reduxStore } from '../../../layers/ReduxProvider';
import { v4 } from 'uuid';
import CalDavEventsApi from '../../../api/CalDavEventsApi';
import ICalHelper from '../../../utils/ICalHelper';
import LuxonHelper from '../../../utils/LuxonHelper';
import Modal from 'components/modal/Modal';
import PrimaryButton from '../../../components/chakraCustom/primaryButton/PrimaryButton';
import Separator from 'components/separator/Separator';

export const findItemCalendar = (item: any) => {
  const state = reduxStore.getState();
  const itemCalendar: CalDavCalendar = state.calDavCalendars.filter(
    (calendarItem: CalDavCalendar) => calendarItem.id === item?.calendarID
  )[0];

  if (!itemCalendar) {
    throw Error('No calendar found');
  }

  return itemCalendar;
};

export const createEvent = async (
  form: any,
  isNewEvent: boolean,
  calendar?: CalDavCalendar,
  handleClose?: any,
  originalEvent?: any
) => {
  const eventCalendar: CalDavCalendar =
    calendar || findItemCalendar(originalEvent);

  const calendarChanged: boolean =
    !isNewEvent && originalEvent?.calendarID !== eventCalendar.id;

  // use issued id or create for new event
  const newEventExternalID: string = originalEvent?.externalID || v4();

  const iCalString: string = new ICalHelper({
    ...form,
    externalID: newEventExternalID,
  }).parseTo();
  if (isNewEvent) {
    await CalDavEventsApi.createEvent({
      calendarID: eventCalendar.id,
      iCalString,
      externalID: newEventExternalID,
    });
  } else {
    if (calendarChanged) {
      await CalDavEventsApi.updateEvent({
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
      });
    } else {
      await CalDavEventsApi.updateEvent({
        calendarID: eventCalendar.id,
        iCalString,
        id: originalEvent.id,
        externalID: originalEvent.externalID,
        url: originalEvent.url,
        etag: originalEvent.etag,
        prevEvent: null,
      });
    }
  }

  // Close modal
  if (handleClose) {
    handleClose();
  }
};

interface EditEventProps {
  handleClose: any;
  isNewEvent: boolean;
  newEventTime?: any;
  defaultReminder?: any; // Remove?
  event?: CalDavEvent;
  wasInitRef?: any;
  currentE: any;
}

export const RRULE_DATE_FORMAT = 'yyyyLLddHHmmss';

const isEventKnownProp = (prop: string) => {
  const knownProps = [
    'startAt',
    'endAt',
    'summary',
    'timezoneStartAt',
    'timezoneEndAt',
    'location',
    'description',
    'rRule',
  ];

  return knownProps.includes(prop);
};

export const parseRRuleDate = (date: string) => {
  const datetime: string = DateTime.fromISO(date).toFormat(RRULE_DATE_FORMAT);

  return (
    datetime.slice(0, 'YYYYMMDD'.length) +
    'T' +
    datetime.slice('YYYYMMDD'.length) +
    'Z'
  );
};

const EditEvent = (props: EditEventProps) => {
  const toast = useToast();

  // Redux state
  const calDavCalendars: CalDavCalendar[] = useSelector(
    (state: ReduxState) => state.calDavCalendars
  );

  const [eventState] = useReducer(stateReducer, initialState);

  const [form, dispatchForm] = useReducer(stateReducer, initialFormState);
  const [calendar, setCalendar] = useState(null as any);

  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const setForm = (type: any, payload: any) => {
    if (type === 'rRule') {
      const needSlice = payload.includes('RRULE');

      let customPayload = payload;

      if (needSlice) {
        customPayload = payload.slice(6);
      }

      const data = {
        type,
        payload: customPayload,
      };

      // @ts-ignore
      dispatchForm(data);

      return;
    }
    // @ts-ignore
    dispatchForm({ type, payload });
  };

  const { isNewEvent, newEventTime, handleClose, event, currentE } = props;

  const { isStartDateValid } = eventState;

  const {
    summary,
    location,
    description,
    calendarID,
    allDay,
    startAt,
    endAt,
    isRepeated,
    alarms,
    timezoneStart,
    attendees,
    organizer,
    rRule,
  } = form;

  const loadEvent = async () => {
    // Find event
    const eventItem: any = event;

    if (eventItem) {
      // Set state
      // Set previous event state to check for occurrences
      setForm('prevItem', eventItem);

      // Set event data
      for (const [key, value] of Object.entries(eventItem)) {
        if (isEventKnownProp(key)) {
          if (value) {
            setForm(key, value);
          }
        }
      }
    }
  };

  /**
   * Find calendar by calendarID
   * Set color event and default alarms for this calendar if event has none
   */
  const loadCalendar = async (calendarID: string | undefined) => {
    const thisCalendar: CalDavCalendar | undefined =
      calendarID || props.event
        ? calDavCalendars.filter(
            (item) => item.id === props.event?.calendarID
          )[0]
        : calDavCalendars[0];

    if (!thisCalendar) {
      return;
    }
    setForm('color', thisCalendar.color);
    if (isNewEvent) {
      const timezoneFromCalendar: string = getLocalTimezone();

      setForm('timezoneStart', timezoneFromCalendar);
      setForm('timezoneEnd', timezoneFromCalendar);
    }
    setCalendar(thisCalendar);
  };

  /**
   * Set date time for new event
   */
  const initNewEventOnMount = async (): Promise<void> => {
    setForm('calendarUrl', calDavCalendars[0].url);
    // setDefaultReminder(defaultReminder, setForm);

    const thisCalendar: CalDavCalendar | undefined = calDavCalendars[0];

    if (!thisCalendar) {
      return;
    }
    const timezoneFromCalendar: string = getLocalTimezone();

    setForm('color', '#2667FF');
    setForm('timezoneStart', timezoneFromCalendar);
    setForm('timezoneEnd', timezoneFromCalendar);
    setCalendar(thisCalendar);

    if (!newEventTime) {
      return;
    }

    const dateFromNewEvent: DateTime = newEventTime.day
      ? calculateNewEventTime(newEventTime)
      : DateTime.local().plus({ hours: 1 });
    const dateTill: DateTime = dateFromNewEvent.plus({ hours: 1 });

    setForm('startAt', DatetimeParser(dateFromNewEvent, getLocalTimezone()));
    setForm('endAt', DatetimeParser(dateTill, getLocalTimezone()));
  };

  useEffect(() => {
    if (isNewEvent) {
      initNewEventOnMount();
    } else {
      loadEvent();
    }
  }, [isNewEvent]);

  useEffect(() => {
    loadCalendar(calendarID);
  }, [calendarID]);

  const addAlarmEvent = (item: any) => {
    addAlarm(item, setForm, alarms);
  };

  const removeAlarmEvent = (item: any) => {
    removeAlarm(item, setForm, alarms);
  };

  /**
   * Attendees
   * @param item
   */
  const addAttendee = (item: any) => {
    setForm('attendees', [...attendees, item]);
  };
  const removeAttendee = (item: any) => {
    const attendeeFiltered: any = [...attendees].filter(
      (attendee: any) => attendee.mailto !== item.mailto
    );
    setForm('attendees', attendeeFiltered);
  };

  // const makeOptional = (item: Attendee) => {
  //   makeOptionalAttendee(item, attendees, setForm);
  // };

  /**
   Attendees end
   */

  const setStartTimezone = (value: string) => {
    setForm('timezoneStart', value);
    setForm('timezoneEnd', value);
  };

  /**
   * Validate event interval
   * @param changedDate
   * @param startAtDate
   * @param endAtDate
   */
  const validateDate = (
    changedDate: string,
    startAtDate: any,
    endAtDate: any
  ): boolean => {
    if (LuxonHelper.isBeforeAny(endAtDate, startAtDate)) {
      return false;
    }

    return true;
  };
  /**
   * Validate startAt date before change
   * @param dateValue
   */
  const handleChangeDateFrom = (dateValue: any) => {
    setForm('startAt', DatetimeParser(dateValue, timezoneStart));

    const isDateValid: boolean = validateDate('startAt', dateValue, endAt);

    if (!isDateValid) {
      setForm('endAt', DatetimeParser(dateValue, timezoneStart));
    }
  };
  /**
   * Validate endAt date before change
   * @param dateValue
   */
  const handleChangeDateTill = (dateValue: any) => {
    const isDateValid: boolean = validateDate('endAt', startAt, dateValue);

    if (isDateValid) {
      setForm('endAt', DatetimeParser(dateValue, timezoneStart));
    } else {
      toast(createToast('Invalid date', TOAST_STATUS.ERROR));
    }
  };

  const handleChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    const value: any = event.target.value;

    if (name === 'timezoneStart' || name === 'timezoneEnd') {
      setForm('startAt', DatetimeParser(startAt, value));
      setForm('endAt', DatetimeParser(endAt, value));
    }

    setForm(name, value);
  };

  const selectCalendar = (calendarObj: any) => {
    const localTimezone = getLocalTimezone();
    setForm(
      'startAt',
      DatetimeParser(startAt, calendarObj.timezone || localTimezone)
    );
    setForm(
      'endAt',
      DatetimeParser(endAt, calendarObj.timezone || localTimezone)
    );
    setForm('calendarUrl', calendarObj.url);
    setCalendar(calendarObj);
  };

  const saveEvent = async () => {
    try {
      await createEvent(form, isNewEvent, calendar, handleClose, props.event);

      setContext('syncSequence', store.syncSequence + 1);

      toast(createToast(isNewEvent ? 'Event created' : 'Event updated'));
    } catch (e: any) {
      toast(createToast(e.response?.data?.message, TOAST_STATUS.ERROR));
    }
  };

  return (
    <Modal e={currentE} handleClose={handleClose}>
      <Flex direction={'column'}>
        {calendar?.url && startAt && endAt ? (
          <EventDetail
            isNewEvent={isNewEvent}
            calendar={calendar}
            summary={summary}
            location={location}
            description={description}
            startDate={startAt}
            rRule={rRule}
            endDate={endAt}
            isRepeated={isRepeated}
            handleChange={handleChange}
            allDay={allDay}
            setForm={setForm}
            handleChangeDateFrom={handleChangeDateFrom}
            handleChangeDateTill={handleChangeDateTill}
            isStartDateValid={isStartDateValid}
            alarms={alarms}
            addAlarm={addAlarmEvent}
            removeAlarm={removeAlarmEvent}
            timezoneStart={timezoneStart}
            setStartTimezone={setStartTimezone}
            selectCalendar={selectCalendar}
            attendees={attendees}
            addAttendee={addAttendee}
            removeAttendee={removeAttendee}
            // makeOptional={makeOptional}
            organizer={organizer}
            form={form}
          />
        ) : (
          <div />
        )}
        <Separator height={16} />
        <Flex direction={'row'}>
          <Spacer />
          <PrimaryButton onClick={saveEvent}>Save</PrimaryButton>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default EditEvent;
