import React, { useReducer, useEffect, useState, } from 'react';
import './new-event.scss';
import {
  addHours,
  isBefore,
} from 'date-fns';
import { formReducer, stateReducer } from 'utils/reducer/baseReducer';
import EventDetail from '../event-detail/event-detail';
import HeaderModal from '../../header-modal';
import { calculateNewEventTime, setDefaultReminder } from '../event.utils';
import EventStateEntity, {
  EventBodyToSend,
} from '../../../data/entities/state/event.entity';
import { stompClient } from '../../../layers/authenticated-layer';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification, findInArrayById, removeNotification } from '../../../utils/common';
import { Dispatch } from 'redux';
import {  mergeEvent } from '../../../redux/actions';
import CalendarStateEntity from '../../../data/entities/state/calendar.entity';
import { sendWebsocketMessage, WEBSOCKET_CREATE_EVENT } from '../../../api/calendar';

const initialFormState: any = {
  text: '',
  location: '',
  notes: '',
  date: '',
  calendarId: '',
  type: 'events',
  isRepeated: false,
  timezone: 'device',
  allDay: false,
  startAt: new Date(),
  endAt: addHours(new Date(), 1),
  repeat: null,
  reminders: [],
  color: '',
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

const NewEvent = (props: any) => {
  const calendars: any = useSelector((state: any) => state.calendars);

  const [state, dispatchState] = useReducer(stateReducer, initialState);
  const [rRuleState, dispatchRRuleState] = useReducer(
    stateReducer,
    initialRRulState
  );
  const dispatch: Dispatch = useDispatch();
  const { isStartDateValid } = state;
  const { newEventTime, handleClose } = props;
  const [form, dispatchForm] = useReducer(formReducer, initialFormState);
  const [calendar, setCalendar] = useState('');
  const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
  const {
    text,
    location,
    notes,
    date,
    calendarId,
    timezone,
    isRepeated,
    allDay,
    startAt,
    endAt,
    repeat,
    reminders
  } = form;

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
  const setThisCalendar = async () => {

    let thisCalendar: any;
    if (calendarId) {
      thisCalendar = await findInArrayById(calendars, calendarId)
    } else {
      thisCalendar = calendars[0]
    }

    setCalendar(thisCalendar);

    setForm('color', thisCalendar.color)
    if ((!reminders || reminders.length === 0) && thisCalendar.reminders) {
      setForm('reminders', thisCalendar.reminders)
    }
  }
  useEffect(() => {
    setThisCalendar()
  }, [calendarId])

  const initOnMount = () => {
    const dateFromNewEvent: Date = newEventTime ? calculateNewEventTime(newEventTime) : new Date();
    const dateTill: Date = addHours(dateFromNewEvent, 1);
    setForm('startAt', dateFromNewEvent);
    setForm('endAt', dateTill);

    setForm('calendarId', calendars[0].id);
    setDefaultReminder(props.defaultReminder, setForm);
  };

  useEffect(() => {
    initOnMount();
  }, []);

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

  /**
   * Set calendar and it's preset notifications
   * @param calendar
   */
  const selectCalendar = (calendar: any) => {
    setForm('calendarId', calendar.id);
  };

  const addNotificationEvent = (item: any) => {
    addNotification(item, setForm, reminders);
  }

  const removeNotificationEvent = (item: any) => {
    removeNotification(item, setForm, reminders)
  }

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

  const saveEvent = async () => {
    const newEvent: EventStateEntity = new EventStateEntity(form, rRuleState);
    // Encrypt data
    const bodyToSend: EventBodyToSend = await newEvent.formatBodyToSend(cryptoPassword);

    // Get only simple object
    const simpleObj: EventStateEntity = newEvent.getReduxStateObj();

    // Save to redux store
    dispatch(mergeEvent(simpleObj));

    sendWebsocketMessage(WEBSOCKET_CREATE_EVENT, bodyToSend);

    props.handleClose();
  }
  const selectOption = (optionName: any, option: any) => {
    setLocalState(optionName, option);
  };

  const goBack = () => {
    props.location ? props.history.goBack() : props.close();
  };

  return (
    <div className={'full-screen'}>
      <HeaderModal goBack={handleClose} handleSave={saveEvent} />
      {calendar && startAt && endAt ? (
        <EventDetail
          history={props.history}
          fetchEventsFromServer={props.fetchEventsFromServer}
          saveeventsToLocal={props.saveEventsDataToLocal}
          saveEvent={saveEvent}
          goBack={goBack}
          calendarId={calendarId}
          calendar={calendar}
          saveNewItem={props.saveNewItem}
          text={text}
          location={location}
          notes={notes}
          date={date}
          startDate={startAt}
          endDate={endAt}
          repeat={repeat}
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

export default NewEvent;
