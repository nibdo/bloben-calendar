import React, { useReducer, useEffect, useState, useContext } from 'react';
import { addHours, parseISO } from 'date-fns';
import { formReducer, stateReducer } from 'utils/reducer/baseReducer';
import EventDetail from '../eventDetail/EventDetail';
import EventStateEntity, {
  EventBodyToSend,
  RRULE_DATE_PROPS,
} from '../../../data/entities/state/event.entity';
import {
  addNotification,
  findInArrayById,
  findInEvents,
  handleEventReduxDelete,
  handleEventReduxUpdate,
  removeNotification,
} from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import {
  sendWebsocketMessage,
  WEBSOCKET_CREATE_EVENT,
  WEBSOCKET_DELETE_EVENT,
  WEBSOCKET_UPDATE_EVENT,
} from '../../../api/calendar';
import { calculateNewEventTime, setDefaultReminder } from '../event.utils';
import { mergeEvent } from '../../../redux/actions';
import { PgpKeys } from '../../../bloben-package/utils/OpenPgp';
import _ from 'lodash';
import HeaderModal from '../../../bloben-package/components/headerModal/HeaderModal';
import { Context } from '../../../bloben-package/context/store';
import { DatetimeParser } from '../../../bloben-package/utils/datetimeParser';
import { DateTime } from 'luxon';
import LuxonHelper from '../../../bloben-package/utils/LuxonHelper';
import { ICalendarSettings } from '../../../types/types';
import { getLocalTimezone } from '../../../bloben-package/utils/common';

const initialFormState: any = {
  prevItem: {},
  id: '',
  text: '',
  location: '',
  notes: '',
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
  reminders: [],
  createdAt: null,
  updatedAt: null,
  color: '',
  calendarTimezone: '',
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
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);
  const calendarSettings: ICalendarSettings = useSelector(
    (state: any) => state.calendarSettings
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
    text,
    location,
    notes,
    calendarId,
    allDay,
    startAt,
    endAt,
    isRepeated,
    reminders,
    timezoneStart,
  } = form;

  /**
   * Find calendar by calendarId
   * Set color event and default reminders for this calendar if event has none
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

    if ((!reminders || reminders.length === 0) && thisCalendar.reminders) {
      setForm('reminders', thisCalendar.reminders);
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
  //     if ((!reminders || reminders.length === 0) && calendar.reminders) {
  //       setForm('reminders', calendar.reminders)
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

  const addNotificationEvent = (item: any) => {
    addNotification(item, setForm, reminders);
  };

  const removeNotificationEvent = (item: any) => {
    removeNotification(item, setForm, reminders);
  };

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
    if (
      LuxonHelper.isBeforeAny(endAtDate, startAtDate
      )
    ) {
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
      calendarSettings.defaultTimezone
    );

    // Encrypt data
    const bodyToSend: EventBodyToSend =
      pgpKeys && pgpKeys.publicKey
        ? await newEvent.formatBodyToSendOpenPgp(pgpKeys)
        : await newEvent.formatBodyToSend(cryptoPassword);

    // Different handling for new event and edited event
    if (isNewEvent) {
      // Get only simple object
      const simpleObj: any = newEvent.getReduxStateObj();

      // Save to redux store
      dispatch(mergeEvent(simpleObj));

      sendWebsocketMessage(WEBSOCKET_CREATE_EVENT, bodyToSend);
    } else {
      // Update event
      sendWebsocketMessage(WEBSOCKET_UPDATE_EVENT, bodyToSend);

      // TODO need to either calculate events parameters client side, or refresh data from backend
      // Update Redux store
      handleEventReduxUpdate(prevItem, newEvent);
    }

    // Close modal
    handleClose();
  };

  const deleteEvent = () => {
    const event: EventStateEntity = new EventStateEntity(form, rRuleState);
    event.delete();

    handleEventReduxDelete(prevItem, event);

    sendWebsocketMessage(WEBSOCKET_DELETE_EVENT, { id: params.id });

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
          text={text}
          location={location}
          notes={notes}
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
          reminders={reminders}
          addNotification={addNotificationEvent}
          removeNotification={removeNotificationEvent}
          timezoneStart={timezoneStart}
          setStartTimezone={setStartTimezone}
          selectCalendar={selectCalendar}
        />
      ) : (
        <div />
      )}
    </div>
  );
};

export default EditEvent;
