import React, {  useReducer, useEffect, useState } from 'react';
import {
  addHours,
  isBefore, parseISO,
} from 'date-fns';
import { formReducer, stateReducer } from 'utils/reducer/baseReducer';
import EventDetail from '../event-detail/event-detail';
import HeaderModal from '../../header-modal';
import EventStateEntity, {
  EventBodyToSend,
  RRULE_DATE_PROPS
} from '../../../data/entities/state/event.entity';
import {
  addNotification,
  findInArrayById,
  findInEvents, handleEventReduxDelete,
  handleEventReduxUpdate, removeNotification,
} from '../../../utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import {
  sendWebsocketMessage,
  WEBSOCKET_CREATE_EVENT,
  WEBSOCKET_DELETE_EVENT,
  WEBSOCKET_UPDATE_EVENT
} from '../../../api/calendar';
import { calculateNewEventTime, setDefaultReminder } from '../event.utils';
import { mergeEvent } from '../../../redux/actions';

const initialFormState: any = {
  prevItem: {},
  id: '',
  text: '',
  location: '',
  notes: '',
  date: '',
  calendarId: null,
  type: 'events',
  timezone: 'device',
  allDay: false,
  startAt: new Date(),
  endAt: addHours(new Date(), 1),
  isRepeated: false,
  reminders: [],
  createdAt: null,
  updatedAt: null,
  color: ''
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

const EditEvent = (props: any) => {
  const [isLoaded, handleLoadingState] = useState(false);
  const [state, dispatchState] = useReducer(stateReducer, initialState);
  const [rRuleState, dispatchRRuleState] = useReducer(
    stateReducer,
    initialRRulState
  );

  const {isNewEvent, newEventTime} = props;
  const params: any = useParams();

  const history: any = useHistory();
  const dispatch: any = useDispatch();
  const calendars: any = useSelector((state: any) => state.calendars);
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);

  const [calendar, setCalendar] = useState(null)


  useEffect(() => {
    const loadEvent = async () => {
      handleLoadingState(false);
      // Find event
      const eventItem: any = await findInEvents(params.id);

      setForm('prevItem', eventItem)

      // Set rRule data
      if (eventItem.rRule) {
        for (const [key, value] of Object.entries(eventItem.rRule)) {
          if (RRULE_DATE_PROPS.indexOf(key) !== -1) {
            if (value) {
              setRRule(key, parseISO(value as string))
            }
          } else {
            setRRule(key, value)
          }
        }
      }

      // Set event data
      for (const [key, value] of Object.entries(eventItem)) {
        if (key !== 'rRule') {
          setForm(key, value)
        }
      }

      handleLoadingState(true);
    }

    if (!isNewEvent) {
      loadEvent();
    }
  }, [params.id])


  const { isStartDateValid } = state;
  const [form, dispatchForm] = useReducer(formReducer, initialFormState);
  const {
    prevItem,
    text,
    location,
    notes,
    date,
    calendarId,
    allDay,
    startAt,
    endAt,
    isRepeated,
    reminders
  } = form;

  /**
   * Find calendar by calendarId
   * Set color event and default reminders for this calendar if event has none
   */
  const setThisCalendar = async () => {
    const thisCalendar: any = await findInArrayById(calendars, calendarId)

    if (!thisCalendar) {
      return
    }
    setForm('color', thisCalendar.color)
    setCalendar(thisCalendar);
    if ((!reminders || reminders.length === 0) && thisCalendar.reminders) {
      setForm('reminders', thisCalendar.reminders)
    }
  }

  useEffect(() => {
    setThisCalendar()
  },        [calendarId !== null, calendarId])

  const handleClose = () => {
    history.goBack()
  }

  /**
   * Set date time for new event
   */
  const initNewEventOnMount = () => {
    setForm('calendarId', calendars[0].id);
    setDefaultReminder(props.defaultReminder, setForm);

    if (!newEventTime) {
      return
    }
    console.log('newEventTime', newEventTime)
    const dateFromNewEvent: Date = newEventTime.day ? calculateNewEventTime(newEventTime) : addHours(new Date(), 1);
    console.log('dateFromNewEvent', dateFromNewEvent)
    const dateTill: Date = addHours(dateFromNewEvent, 1);
    setForm('startAt', dateFromNewEvent);
    setForm('endAt', dateTill);


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
    dispatchState({ type: type, payload: payload });
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
  }

  const removeNotificationEvent = (item: any) => {
    removeNotification(item, setForm, reminders)
  }

  const validateDate = (
    changedDate: string,
    startAtDate: any,
    endAtDate: any
  ) => {
    setLocalState('isStartDateValid', true);
    if (changedDate === 'startAt') {
      if (isBefore(endAtDate, startAtDate)) {
        setLocalState('isStartDateValid', false);
      }
    } else if (changedDate === 'endAt') {
      if (isBefore(endAtDate, startAtDate)) {
        setLocalState('isStartDateValid', false);
      }
    }
  };
  const handleChangeDateFrom = (date: Date) => {
    setForm('startAt', date);
    validateDate('startAt', date, endAt);
  };
  const handleChangeDateTill = (date: Date) => {
    setForm('endAt', date);
    validateDate('endAt', startAt, date);
  };

  const handleChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    setForm(name, event.target.value);
  };

  const selectCalendar = (calendarObj: any) => {
    setForm('calendar', calendarObj);
  };

  const saveEvent = async () => {
    const newEvent: EventStateEntity = new EventStateEntity(form, rRuleState);

    // Encrypt data
    const bodyToSend: EventBodyToSend = await newEvent.formatBodyToSend(cryptoPassword);

    // Different handling for new event and edited event
    if (isNewEvent) {
      // Get only simple object
      const simpleObj: EventStateEntity = newEvent.getReduxStateObj();

      // Save to redux store
      dispatch(mergeEvent(simpleObj));

      sendWebsocketMessage(WEBSOCKET_CREATE_EVENT, bodyToSend);
    } else {
      // Update event
      sendWebsocketMessage(WEBSOCKET_UPDATE_EVENT, bodyToSend)

      // TODO need to either calculate events parameters client side, or refresh data from backend
      // Update Redux store
      handleEventReduxUpdate(prevItem, newEvent);
    }

    // Close modal
    handleClose();
  }

  const deleteEvent = () => {
    const event: EventStateEntity = new EventStateEntity(form, rRuleState);
    event.delete();

    handleEventReduxDelete(prevItem, event);

    sendWebsocketMessage(WEBSOCKET_DELETE_EVENT, {id: params.id})

    handleClose();
  }

  const selectOption = (optionName: any, option: any) => {
    setLocalState(optionName, option);
  };

  return (
    <div className={'full-screen'}>
      <HeaderModal goBack={handleClose} handleSave={saveEvent} handleDelete={isNewEvent ? null : deleteEvent}/>
      {calendar && startAt && endAt ? (
        <EventDetail
            isNewEvent={isNewEvent}
          history={props.history}
          fetchEventsFromServer={props.fetchEventsFromServer}
          saveEvent={saveEvent}
          goBack={handleClose}
          calendar={calendar}
          calendarId={calendarId}
          saveNewItem={props.saveNewItem}
          text={text}
          location={location}
          notes={notes}
          date={date}
          startDate={startAt}
          endDate={endAt}
          isRepeated={isRepeated}
          handleChange={handleChange}
          selectCalendar={selectCalendar}
          allDay={allDay}
          setForm={setForm}
          selectOption={selectOption}
          handleChangeDateFrom={handleChangeDateFrom}
          handleChangeDateTill={handleChangeDateTill}
          rRuleState={rRuleState}
          setRRule={setRRule}
          isStartDateValid={isStartDateValid}
          reminders={reminders}
          addNotification={addNotificationEvent}
          removeNotification={removeNotificationEvent}
        />
      ) : (
        <div />
      )}
    </div>
  );
};

export default EditEvent;
