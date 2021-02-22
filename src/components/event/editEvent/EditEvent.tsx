import React, { useReducer, useEffect, useState, useContext } from 'react';
import { addHours, parseISO } from 'date-fns';
import { formReducer, stateReducer } from 'utils/reducer/baseReducer';
import EventDetail from '../eventDetail/EventDetail';
import EventStateEntity, {
  EventBodyToSend,
  RRULE_DATE_PROPS,
} from '../../../bloben-utils/models/event.entity';
import {
  addAlarm,
  findInArrayById, findInArrayByKeyValue,
  findInEvents,
  handleEventReduxDelete,
  handleEventReduxUpdate,
  removeAlarm,
} from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import CalendarApi from '../../../api/calendar';
import { calculateNewEventTime, setDefaultReminder } from '../event.utils';
import { addEvents, mergeEvent } from '../../../redux/actions';
import { PgpKeys } from '../../../bloben-utils/utils/OpenPgp';
import _ from 'lodash';
import HeaderModal from '../../../bloben-package/components/headerModal/HeaderModal';
import { Context } from '../../../bloben-package/context/store';
import { DatetimeParser } from '../../../bloben-package/utils/datetimeParser';
import { DateTime } from 'luxon';
import LuxonHelper from '../../../bloben-utils/utils/LuxonHelper';
import { ICalendarSettings, TCalendarAlarmType } from '../../../types/types';
import { getLocalTimezone } from '../../../bloben-package/utils/common';
import { IUserProfile } from '../../../bloben-package/types/common.types';
import { createEmailAlarm } from '../../../bloben-utils/models/EmailAlarm';
import ICalHelper, {
  Attendee,
  createAttendee,
  ROLE_OPT,
  ROLE_REQ,
} from '../../../bloben-package/utils/ICalHelper';
import { v4 } from 'uuid';
import ContactApi from '../../../bloben-package/api/contact.api';
import Contact from '../../../bloben-utils/models/Contact';

const initialFormState: any = {
  prevItem: {},
  id: '',
  summary: '',
  location: '',
  description: '',
  date: '',
  calendarId: null,
  type: 'events',
  timezone: null,
  allDay: false,
  startAt: DateTime.local().toString(),
  timezoneStart: null,
  endAt: DateTime.local().plus({ hours: 1 }).toString(),
  timezoneEnd: null,
  isRepeated: false,
  alarms: [],
  attendees: [],
  createdAt: null,
  updatedAt: null,
  color: '',
  calendarTimezone: '',
  organizer: '',
};
const initialState: any = {
  modalIsOpen: false,
  hasChanged: false,
  isStartDateValid: true,
  isEndDateValid: true,
};

export const initialRRulState: any = {
  freq: 'none',
  wkst: '',
  count: '',
  interval: '',
  until: '',
  dtstart: '',
  dtend: '',
};

interface IEditEventProps {
  isNewEvent: boolean;
  newEventTime?: any;
  defaultReminder?: any; // Remove?
}
const EditEvent = (props: IEditEventProps) => {
  const [isLoaded, handleLoadingState] = useState(false);
  const [eventState, dispatchState] = useReducer(stateReducer, initialState);
  const [rRuleState, dispatchRRuleState] = useReducer(
    stateReducer,
    initialRRulState
  );

  const [store, dispatchContext] = useContext(Context);
  const setContext = (type: string, payload: any) => {
    dispatchContext({ type, payload });
  };

  const { isNewEvent, newEventTime, defaultReminder } = props;
  const params: any = useParams();

  const history: any = useHistory();
  const dispatch: any = useDispatch();
  const calendars: any = useSelector((state: any) => state.calendars);
  const contacts: any = useSelector((state: any) => state.contacts);
  const username: string = useSelector((state: any) => state.username);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);
  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
  );
  const userProfile: IUserProfile = useSelector(
    (state: any) => state.userProfile
  );

  const [calendar, setCalendar] = useState(null);
  const [hasHeaderShadow, setHeaderShadow] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      handleLoadingState(false);
      // Find event
      const eventItem: any = await findInEvents(params.id);

      setForm('prevItem', eventItem);

      // Set rRule data
      if (eventItem.rRule) {
        for (const [key, value] of Object.entries(eventItem.rRule)) {
          if (RRULE_DATE_PROPS.indexOf(key) !== -1) {
            if (value) {
              setRRule(key, parseISO(value as string));
            }
          } else {
            setRRule(key, value);
          }
        }
      }

      // Set event data
      for (const [key, value] of Object.entries(eventItem)) {
        if (key !== 'rRule') {
          setForm(key, value);
        }
      }

      handleLoadingState(true);
    };

    if (!isNewEvent) {
      loadEvent();
    }
  }, [params.id]);

  const { isStartDateValid } = eventState;
  const [form, dispatchForm] = useReducer(formReducer, initialFormState);
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

  /**
   * Find calendar by calendarId
   * Set color event and default alarms for this calendar if event has none
   */
  const loadCalendar = async () => {
    const thisCalendar: any = await findInArrayById(calendars, calendarId);

    if (!thisCalendar) {
      return;
    }
    setForm('color', thisCalendar.color);
    if (isNewEvent) {
      setForm(
        'timezoneStart',
        !thisCalendar.timezone || thisCalendar.timezone === 'device'
          ? getLocalTimezone()
          : thisCalendar.timezone
      );
      setForm(
        'timezoneEnd',
        !thisCalendar.timezone || thisCalendar.timezone === 'device'
          ? getLocalTimezone()
          : thisCalendar.timezone
      );
    }
    setCalendar(thisCalendar);

    if ((!alarms || alarms.length === 0) && thisCalendar.alarms) {
      setForm('alarms', thisCalendar.alarms);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [calendarId !== null, calendarId]);

  const handleClose = () => {
    history.goBack();
  };

  /**
   * Set date time for new event
   */
  const initNewEventOnMount = async () => {
    setForm('calendarId', calendars[0].id);
    setDefaultReminder(defaultReminder, setForm);

    const thisCalendar: any = await findInArrayById(calendars, calendars[0].id);

    if (!thisCalendar) {
      return;
    }
    setForm('color', thisCalendar.color);
    setForm(
      'timezoneStart',
      !thisCalendar.timezone || thisCalendar.timezone === 'device'
        ? getLocalTimezone()
        : thisCalendar.timezone
    );
    setForm(
      'timezoneEnd',
      !thisCalendar.timezone || thisCalendar.timezone === 'device'
        ? getLocalTimezone()
        : thisCalendar.timezone
    );

    const organizerName: string | null = userProfile.publicName
      ? userProfile.publicName
      : userProfile.appEmail;
    const organizerAsAttendee: any = {
      cn: organizerName,
      role: 'REQ-PARTICIPANT',
      rsvp: true,
      partstat: 'ACCEPTED',
      mailto: userProfile.appEmail,
    };
    addAttendee(organizerAsAttendee);
    setForm('organizer', {
      role: 'REQ-PARTICIPANT',
      cn: organizerName,
      mailto: userProfile.appEmail,
    });

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

  // useEffect(() => {
  //
  //   const setNewCalendarReminders = async () => {
  //     const calendar: CalendarStateEntity = await findInArrayById(calendars, calendarId)
  //
  //     if ((!alarms || alarms.length === 0) && calendar.alarms) {
  //       setForm('alarms', calendar.alarms)
  //     }
  //   }
  //   setNewCalendarReminders()
  // }, [calendarId])
  useEffect(() => {
    if (isNewEvent) {
      initNewEventOnMount();
    }
  }, []);

  const setForm = (type: any, payload: any) => {
    // @ts-ignore
    dispatchForm({ type, payload });
  };
  const setLocalState = (type: any, payload: any) => {
    // @ts-ignore
    dispatchState({ type, payload });
  };
  const resetRRule = () => {
    setRRule('freq', 'none');
    setRRule('dtstart', '');
    setRRule('dtend', '');
    setRRule('interval', 1);
    setRRule('count', 0);
    setRRule('until', '');
    setRRule('wkst', '');
  };

  const setRRule = (type: any, payload: any) => {
    if (type === 'reset') {
      resetRRule();
    }
    // @ts-ignore
    dispatchRRuleState({ type, payload });
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
    const newEvent: EventStateEntity = new EventStateEntity(
      form,
      rRuleState,
      calendarSettings.defaultTimezone,
      username
    );

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

        newEvent.alarms = alarmsParsed;
      }
    }

    console.log('newEvent,', newEvent);

    // Encrypt data
    const bodyToSend: EventBodyToSend = await newEvent.formatBodyToSendOpenPgp(
      pgpKeys
    );

    // Different handling for new event and edited event
    if (isNewEvent) {
      // Get only simple object
      const simpleObj: any = newEvent.getReduxStateObj();

      // Save to redux store
      dispatch(mergeEvent(simpleObj));

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

            const contactInState: any = await findInArrayByKeyValue(contacts, 'email', item.mailto)

            console.log('contact in state', contactInState);

            if (!contactInState) {
              const newContact = new Contact(item);
              const contactBodyToSend: any = await newContact.formatBodyToEncrypt(
                  pgpKeys.publicKey
              );
              console.log('contactBodyToSend', contactBodyToSend);
              await ContactApi.createContact(contactBodyToSend);
            }
          }
        }
      }
      //
      // const test: any = await ContactApi.getContacts();
      // const test2: any = await ContactApi.getContactById('13668662-d012-46c0-8f81-671859e6c30f')

      await CalendarApi.createEvent(bodyToSend);

      // sendWebsocketMessage(WEBSOCKET_CREATE_EVENT, bodyToSend);
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
    const event: EventStateEntity = new EventStateEntity(form, rRuleState);
    event.delete();

    await CalendarApi.deleteEvent(event);

    handleEventReduxDelete(prevItem, event);

    handleClose();
  };

  const selectOption = (optionName: any, option: any) => {
    setLocalState(optionName, option);
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
        handleSave={saveEvent}
        handleDelete={isNewEvent ? null : deleteEvent}
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
