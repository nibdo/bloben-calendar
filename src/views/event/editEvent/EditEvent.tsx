import React, { useReducer, useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { Dispatch } from 'redux';

import { REPLACE_STATE, stateReducer } from 'utils/reducer/baseReducer';
import EventDetail from '../eventDetail/EventDetail';
import {
  addAlarm,
  findInArrayById,
  findInEvents,
  handleEventReduxDelete,
  handleEventReduxUpdate,
  removeAlarm,
} from '../../../utils/common';
import CalendarApi from '../../../api/calendar';
import { calculateNewEventTime, setDefaultReminder } from '../event.utils';
import { mergeEvent } from '../../../redux/actions';
import { ICalendarSettings, ReduxState } from '../../../types/types';
import {
  initialFormState,
  initialRRulState,
  initialState,
} from './EditEvent.utils';
import {
  Attendee,
  createOrganizerAttendee,
  ROLE_OPT,
  ROLE_REQ,
} from 'bloben-utils/models/Attendee';
import {
  Calendar,
  User,
  getLocalTimezone,
  DatetimeParser,
  LuxonHelper,
  createEmailAlarm,
  EventEncrypted,
  encryptEvent,
  ICalHelper,
  createContact,
  Contact,
  encryptContact,
  ContactEncrypted,
  ContactApi,
} from 'bloben-utils';
import { UserProfile } from 'bloben-react/types/common.types';
import { Context } from 'bloben-module/context/store';
import {
  parseRRuleFromString,
  EventDecrypted,
  createEvent,
} from 'bloben-utils/models/Event';
import { HeaderModal } from 'bloben-react';
import { findInArrayByKeyValue } from 'bloben-utils/utils/common';

interface EditEventProps {
  isNewEvent: boolean;
  newEventTime?: any;
  defaultReminder?: any; // Remove?
}

const EditEvent = (props: EditEventProps) => {
  // Redux state
  const calendars: Calendar[] = useSelector(
    (state: ReduxState) => state.calendars
  );
  const contacts: Contact[] = useSelector(
    (state: ReduxState) => state.contacts
  );
  const user: User = useSelector((state: ReduxState) => state.user);
  const calendarSettings: ICalendarSettings = useSelector(
    (state: ReduxState) => state.calendarSettings
  );
  const userProfile: UserProfile = useSelector(
    (state: ReduxState) => state.userProfile
  );

  const [eventState, dispatchState] = useReducer(stateReducer, initialState);
  const [rRuleState, dispatchRRuleState] = useReducer(
    stateReducer,
    initialRRulState
  );
  const [form, dispatchForm] = useReducer(stateReducer, initialFormState);
  const [isLoaded, handleLoadingState] = useState(false);
  const [calendar, setCalendar] = useState();
  const [hasHeaderShadow, setHeaderShadow] = useState(false);

  const setForm = (type: any, payload: any) => {
    // @ts-ignore
    dispatchForm({ type, payload });
  };
  const setLocalState = (type: any, payload: any) => {
    // @ts-ignore
    dispatchState({ type, payload });
  };
  const setRRule = (type: any, payload: any) => {
    if (type === REPLACE_STATE) {
      setRRule(REPLACE_STATE, initialRRulState);
    }
    // @ts-ignore
    dispatchRRuleState({ type, payload });
  };

  const [store, dispatchContext] = useContext(Context);
  const { isDark, isMobile } = store;
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const { isNewEvent, newEventTime, defaultReminder } = props;
  const params: any = useParams();
  const history: any = useHistory();
  const dispatch: Dispatch = useDispatch();

  const { isStartDateValid } = eventState;

  const {
    prevItem,
    summary,
    location,
    description,
    calendarId,
    allDay,
    startAt,
    endAt,
    isRepeated,
    alarms,
    timezoneStart,
    attendees,
    organizer,
  } = form;

  const loadEvent = async () => {
    handleLoadingState(true);

    // Find event
    const eventItem: any = await findInEvents(params.id);

    // Set state
    setForm('prevItem', eventItem);
    setRRule(REPLACE_STATE, parseRRuleFromString(eventItem.rRule));

    handleLoadingState(false);
  };

  /**
   * Find calendar by calendarId
   * Set color event and default alarms for this calendar if event has none
   */
  const loadCalendar = async () => {
    const thisCalendar: Calendar | undefined = await findInArrayById(
      calendars,
      calendarId
    );

    if (!thisCalendar) {
      return;
    }
    setForm('color', thisCalendar.color);
    if (isNewEvent) {
      const timezoneFromCalendar: string =
        !thisCalendar.timezone || thisCalendar.timezone === 'device'
          ? getLocalTimezone()
          : thisCalendar.timezone;

      setForm('timezoneStart', timezoneFromCalendar);
      setForm('timezoneEnd', timezoneFromCalendar);
    }
    setCalendar(thisCalendar);

    if ((!alarms || alarms.length === 0) && thisCalendar.alarms) {
      setForm('alarms', thisCalendar.alarms);
    }
  };

  /**
   * Set date time for new event
   */
  const initNewEventOnMount = async (): Promise<void> => {
    setForm('calendarId', calendarSettings.defaultCalendar);
    setDefaultReminder(defaultReminder, setForm);

    const thisCalendar: Calendar | undefined = await findInArrayById(
      calendars,
      calendarSettings.defaultCalendar
    );

    if (!thisCalendar) {
      return;
    }

    const timezoneFromCalendar: string =
      !thisCalendar.timezone || thisCalendar.timezone === 'device'
        ? getLocalTimezone()
        : thisCalendar.timezone;

    setForm('color', thisCalendar.color);
    setForm('timezoneStart', timezoneFromCalendar);
    setForm('timezoneEnd', timezoneFromCalendar);

    const organizerAsAttendee: Attendee = createOrganizerAttendee(
      userProfile.appEmail,
      userProfile.publicName
    );

    addAttendee(organizerAsAttendee);
    setForm('organizer', organizerAsAttendee);

    if (!newEventTime) {
      return;
    }

    const dateFromNewEvent: DateTime = newEventTime.day
      ? calculateNewEventTime(newEventTime)
      : DateTime.local().plus({ hours: 1 });
    const dateTill: DateTime = dateFromNewEvent.plus({ hours: 1 });

    setForm('startAt', DatetimeParser(dateFromNewEvent, thisCalendar.timezone));
    setForm('endAt', DatetimeParser(dateTill, thisCalendar.timezone));
  };

  useEffect(() => {
    if (isNewEvent) {
      initNewEventOnMount();
    }
  }, []);

  useEffect(() => {
    if (!isNewEvent) {
      loadEvent();
    }
  }, [params.id]);

  useEffect(() => {
    loadCalendar();
  }, [calendarId !== null, calendarId]);

  const handleClose = () => {
    history.goBack();
  };

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
  const addAttendee = (item: Attendee) => {
    setForm('attendees', [...attendees, item]);
  };
  const removeAttendee = (item: any) => {
    const attendeeFiltered: any = [...attendees].filter(
      (attendee: any) => attendee.mailto !== item.mailto
    );
    setForm('attendees', attendeeFiltered);
  };
  const makeOptional = (item: Attendee) => {
    const items: Attendee[] = [...attendees];
    const result: any = items.map((attendee: Attendee) => {
      if (attendee.mailto === item.mailto) {
        if (attendee.role === ROLE_REQ) {
          attendee.role = ROLE_OPT;
        } else {
          attendee.role = ROLE_REQ;
        }
      }

      return attendee;
    });

    setForm('attendees', result);
  };

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
    const isDateValid: boolean = validateDate('startAt', dateValue, endAt);

    if (isDateValid) {
      // setForm('startAt', dateValue);
      setForm('startAt', DatetimeParser(dateValue, timezoneStart));
    } else {
      setContext('showSnackbar', {
        text: 'Error: Starting date before event end.',
      });
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
      setContext('showSnackbar', {
        text: 'Error: Ending date before event start.',
      });
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
    setForm('startAt', DatetimeParser(startAt, calendarObj.timezone));
    setForm('endAt', DatetimeParser(endAt, calendarObj.timezone));
    setForm('calendarId', calendarObj.id);
  };

  const saveEvent = async () => {
    const newEvent: EventDecrypted = createEvent(
      form,
      isRepeated ? { ...rRuleState, ...{ dtstart: form.startAt } } : null,
      calendarSettings.defaultTimezone,
      user.username as string
    );

    console.log('newEvent', newEvent);

    // Handle email alarms, add payload
    if (newEvent.alarms && newEvent.alarms.length > 0) {
      if (typeof newEvent.alarms !== 'string') {
        const alarmsParsed: any = [];

        for (const item of newEvent.alarms) {
          if (item.alarmType === 'email') {
            item.payload = JSON.stringify(
              await createEmailAlarm(
                newEvent.summary,
                newEvent.startAt,
                userProfile.emailPublicKey
              )
            );
          }

          alarmsParsed.push(item);
        }

        console.log('alarmsParsed', alarmsParsed);

        newEvent.alarms = alarmsParsed;
      }
    }

    const bodyToSend: EventEncrypted = await encryptEvent(
      user.publicKey,
      newEvent
    );

    console.log('bodyToSend', bodyToSend);

    // Different handling for new event and edited event
    if (isNewEvent) {
      // TODO @DEPRECATED
      // Get only simple object
      const simpleObj: any = newEvent;

      // Save to redux store
      dispatch(mergeEvent(newEvent));

      // TODO MOVE ELSEWHERE

      if (attendees.length > 1) {
        console.log('attendees', attendees);

        const icalTest: any = new ICalHelper(simpleObj).parseTo();
        console.log(icalTest);
        const inviteData: any = {
          attendee: attendees
            .filter((item: any) => item.mailto !== userProfile.appEmail)
            .map((item: any) => item.mailto),
          body: 'Event invite',
          subject: 'Event invite',
          attachment: btoa(icalTest),
        };
        console.log(inviteData);

        CalendarApi.sendInvite(inviteData);
      }

      // Create contacts
      // TODO check if not exists
      if (attendees.length > 1) {
        for (const item of attendees) {
          if (item.mailto !== userProfile.appEmail) {
            const contactInState: any = await findInArrayByKeyValue(
              contacts,
              'email',
              item.mailto
            );

            if (!contactInState) {
              const newContact: Contact = createContact(item);
              const encryptedContact: ContactEncrypted = await encryptContact(
                user.publicKey,
                newContact
              );
              console.log('contactBodyToSend', encryptedContact);
              await ContactApi.createContact(encryptedContact);
            }
          }
        }
      }

      await CalendarApi.createEvent(bodyToSend);
    } else {
      // Update event
      await CalendarApi.updateEvent(bodyToSend);

      // TODO need to either calculate events parameters client side, or refresh data from backend
      // Update Redux store
      await handleEventReduxUpdate(prevItem, newEvent);
    }

    // Close modal
    handleClose();
  };

  const deleteEvent = async () => {
    const event: EventDecrypted = createEvent(form, rRuleState);

    event.deletedAt = DateTime.local().toISO();

    await CalendarApi.deleteEvent(event);

    handleEventReduxDelete(prevItem, event);

    handleClose();
  };

  // Debounce scroll function
  const handleScroll = _.debounce((e: any) => {
    const element: any = document.getElementById('event_detail__wrapper');

    if (element.scrollTop !== 0) {
      setHeaderShadow(true);
    } else {
      setHeaderShadow(false);
    }
  }, 10);

  return (
    <div className={'full-screen'}>
      <HeaderModal
        hasHeaderShadow={hasHeaderShadow}
        onClose={handleClose}
        goBack={handleClose}
        handleSave={saveEvent}
        handleDelete={isNewEvent ? null : deleteEvent}
        isDark={isDark}
        isMobile={isMobile}
      />
      {calendar && startAt && endAt ? (
        <EventDetail
          handleScroll={handleScroll}
          isNewEvent={isNewEvent}
          calendar={calendar}
          summary={summary}
          location={location}
          description={description}
          startDate={startAt}
          endDate={endAt}
          isRepeated={isRepeated}
          handleChange={handleChange}
          allDay={allDay}
          setForm={setForm}
          handleChangeDateFrom={handleChangeDateFrom}
          handleChangeDateTill={handleChangeDateTill}
          rRuleState={rRuleState}
          setRRule={setRRule}
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
          makeOptional={makeOptional}
          organizer={organizer}
        />
      ) : (
        <div />
      )}
    </div>
  );
};

export default EditEvent;
